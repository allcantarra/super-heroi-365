import { describe, expect, it } from 'vitest'
import { ALIMENTOS, PROIBIDOS, type IdAlimento } from '../conteudo/alimentos'
import { CATEGORIA_DA_REFEICAO, FORMATO, METAS, REFEICOES, REFEICAO_LIVRE } from '../conteudo/cardapio'
import { ORCAMENTO, PRATOS, type IdPrato, type Prato } from '../conteudo/pratos'
import { RECEITAS } from '../conteudo/receitas'
import {
  BESTEIRAS, DA_CATEGORIA, TODOS_DA_CATEGORIA, VAGAS_DE_BESTEIRA, alternativas, cardapioDaData, chaveDaTroca, datasDaSemana, fasePara, listaDeCompras, macrosDaData, macrosDoPrato,
  marmitasDaSemana, normalizarTrocas, papelDoDia, prato, pratoDaData, pratoOriginal, segundaDe, semanaDe,
} from './cardapio'
import { diaDaSemana, somarDias, type Fase } from './tempo'

const FASES: Fase[] = [1, 2, 3, 4]
const IDS = Object.keys(PRATOS) as IdPrato[]
/** Dia 1 numa quinta-feira, para a semana 0 começar no meio. */
const DIA_UM = '2026-11-12'
const ANO = Array.from({ length: 365 }, (_, i) => somarDias(DIA_UM, i))

describe('conteúdo: restrições alimentares', () => {
  it('nenhum alimento, prato ou receita cita item proibido', () => {
    const textos = [
      ...Object.values(ALIMENTOS).flatMap((a) => [a.nome, 'compra' in a ? a.compra : '']),
      ...(Object.values(PRATOS) as Prato[]).flatMap((p): string[] => [p.nome, p.preparo, ...p.passos, ...(p.temperos ?? []), p.levar ?? '', p.airfryer ?? '']),
      ...Object.values(RECEITAS).flatMap((r) => [r.nome, ...r.ingredientes, ...r.passos]),
      ...REFEICAO_LIVRE.regras,
    ]
    expect(textos.filter((t) => PROIBIDOS.test(t))).toEqual([])
  })

  it('a checagem de proibidos funciona', () => {
    for (const t of ['Feijão tropeiro', 'salada', 'Salada de tomate', 'Filé de peixe', 'camarão', 'legumes', 'couve refogada', 'ervilha']) expect(PROIBIDOS.test(t)).toBe(true)
    // versão 2: vegetal dentro do preparo e a salada caesar passam
    for (const t of ['Arroz, bife e batata', 'Hambúrguer com alface e tomate', 'Nuggets com cenoura ralada', 'Salada caesar com frango']) expect(PROIBIDOS.test(t)).toBe(false)
  })

  it('todo prato usa só alimentos da tabela e aponta para receita que existe', () => {
    for (const id of IDS) {
      const p = prato(id)
      for (const item of p.itens) expect(ALIMENTOS[item.a as IdAlimento], `${id} ${item.a}`).toBeDefined()
      if (p.receita) expect(RECEITAS[p.receita as keyof typeof RECEITAS], `${id} ${p.receita}`).toBeDefined()
    }
  })

  it('a tabela de alimentos é coerente: kcal perto de 4p + 4c + 9g', () => {
    for (const [id, a] of Object.entries(ALIMENTOS)) {
      // alimento de pouquíssima caloria (alface, tomate) tem a fibra pesando mais que a margem
      if (a.kcal < 30) continue
      const calculado = 4 * a.p + 4 * a.c + 9 * a.g
      // folga de 20%: a TACO desconta fibra e arredonda, o que pesa em alimento de pouca caloria (molho de tomate)
      expect(Math.abs(calculado - a.kcal) / a.kcal, id).toBeLessThan(0.2)
    }
  })
})

describe('conteúdo: pratos', () => {
  it('todo prato fecha perto do orçamento da categoria em todas as fases', () => {
    for (const id of IDS) for (const f of FASES) {
      const alvo = ORCAMENTO[prato(id).categoria][f - 1]
      expect(Math.abs(macrosDoPrato(id, f).kcal - alvo) / alvo, `${id} fase ${f}`).toBeLessThan(0.1)
    }
  })

  it('quantidades são práticas: positivas, inteiras para o que se conta', () => {
    for (const id of IDS) for (const item of prato(id).itens) for (const q of item.q) {
      expect(q).toBeGreaterThan(0)
      if (typeof ALIMENTOS[item.a].medida === 'object') expect(Number.isInteger(q)).toBe(true)
    }
  })

  it('pré-treino tem guaraná e todo café tem whey e creatina', () => {
    for (const id of IDS) {
      const itens = prato(id).itens.map((i) => i.a as string)
      if (prato(id).categoria === 'pre') expect(itens, id).toContain('guarana')
      if (prato(id).categoria === 'cafe') expect(itens, id).toEqual(expect.arrayContaining(['whey', 'creatina']))
    }
  })

  it('cada tipo de refeição tem pelo menos 30 opções, com nomes únicos', () => {
    for (const categoria of ['pre', 'cafe', 'lanche', 'almoco', 'jantar', 'ceia'] as const) expect(DA_CATEGORIA[categoria].length, categoria).toBeGreaterThanOrEqual(30)
    const nomes = IDS.map((id) => prato(id).nome)
    expect(nomes.filter((n, i) => nomes.indexOf(n) !== i)).toEqual([])
  })
})

describe('calendário dos 365 dias', () => {
  it('semana 0 é a semana do dia 1, de segunda a domingo', () => {
    expect(segundaDe(DIA_UM)).toBe('2026-11-09')
    expect(semanaDe(DIA_UM, '2026-11-09')).toBe(0)
    expect(semanaDe(DIA_UM, '2026-11-15')).toBe(0)
    expect(semanaDe(DIA_UM, '2026-11-16')).toBe(1)
  })

  it('cada refeição recebe um prato da categoria certa em todos os dias do ano', () => {
    for (const data of ANO) {
      const c = cardapioDaData(DIA_UM, data, {})
      for (const r of REFEICOES) expect(prato(c[r]).categoria, `${data} ${r}`).toBe(CATEGORIA_DA_REFEICAO[r])
    }
  })

  it('refeição de trabalho e de trajeto é sempre marmita ou portátil, o ano inteiro', () => {
    for (const data of ANO) {
      const c = cardapioDaData(DIA_UM, data, {})
      for (const r of ['lancheManha', 'lancheTarde', 'trajeto'] as const) expect(FORMATO[prato(c[r]).categoria]).toBe('portátil')
      expect(FORMATO[prato(c.almoco).categoria]).toBe('marmita')
    }
  })

  it('todo dia do ano fecha a até 5% da meta de calorias da sua fase', () => {
    for (const data of ANO) {
      const m = macrosDaData(DIA_UM, data, {}), meta = METAS[fasePara(DIA_UM, data)]
      expect(Math.abs(m.kcal - meta.kcal) / meta.kcal, `kcal ${data}: ${Math.round(m.kcal)}`).toBeLessThan(0.05)
    }
  })

  it('os macros de um dia isolado variam com os pratos: até 27% da meta (30% para proteína, 40% para gordura)', () => {
    for (const data of ANO) {
      const m = macrosDaData(DIA_UM, data, {}), meta = METAS[fasePara(DIA_UM, data)]
      expect(Math.abs(m.p / meta.p - 1), `proteína ${data}: ${Math.round(m.p)}`).toBeLessThan(0.3)
      expect(Math.abs(m.c / meta.c - 1), `carboidrato ${data}: ${Math.round(m.c)}`).toBeLessThan(0.27)
      expect(Math.abs(m.g / meta.g - 1), `gordura ${data}: ${Math.round(m.g)}`).toBeLessThan(0.4)
    }
  })

  it('na média de cada semana, os macros ficam a até 12% da meta', () => {
    for (let s = 1; s < 52; s++) {
      const dias = datasDaSemana(somarDias('2026-11-09', s * 7))
      if (new Set(dias.map((d) => fasePara(DIA_UM, d))).size > 1) continue // semana de virada de fase
      const meta = METAS[fasePara(DIA_UM, dias[0])]
      const media = (k: 'p' | 'c' | 'g') => dias.reduce((t, d) => t + macrosDaData(DIA_UM, d, {})[k], 0) / 7
      for (const k of ['p', 'c', 'g'] as const) expect(Math.abs(media(k) / meta[k] - 1), `semana ${s} ${k}: ${Math.round(media(k))}`).toBeLessThan(0.12)
    }
  })

  it('na média de cada fase, calorias e macros ficam a até 4% da meta', () => {
    for (const f of FASES) {
      const dias = ANO.filter((d) => fasePara(DIA_UM, d) === f).map((d) => macrosDaData(DIA_UM, d, {}))
      for (const k of ['kcal', 'p', 'c', 'g'] as const) {
        const media = dias.reduce((t, m) => t + m[k], 0) / dias.length
        expect(Math.abs(media / METAS[f][k] - 1), `fase ${f} ${k}: ${Math.round(media)}`).toBeLessThan(0.04)
      }
    }
  })

  it('a semana tem 3 marmitas: A na seg, qua e sex; B na ter e qui; C no fim de semana', () => {
    const segunda = '2026-11-16', dias = datasDaSemana(segunda), almoco = dias.map((d) => pratoOriginal(DIA_UM, d, 'almoco'))
    expect(almoco[0]).toBe(almoco[2])
    expect(almoco[2]).toBe(almoco[4])
    expect(almoco[1]).toBe(almoco[3])
    expect(almoco[5]).toBe(almoco[6])
    expect(new Set(almoco).size).toBe(3)
    const marmitas = marmitasDaSemana(DIA_UM, segunda, {})
    expect(marmitas.map((m) => m.datas.length)).toEqual([3, 2, 2])
    expect(marmitas.map((m) => m.prato)).toEqual([almoco[0], almoco[1], almoco[5]])
  })

  it('nenhum almoço se repete de uma semana para a seguinte', () => {
    for (let s = 0; s < 52; s++) {
      const a = marmitasDaSemana(DIA_UM, somarDias('2026-11-09', s * 7), {}).map((m) => m.prato)
      const b = marmitasDaSemana(DIA_UM, somarDias('2026-11-09', (s + 1) * 7), {}).map((m) => m.prato)
      expect(a.filter((x) => b.includes(x)), `semanas ${s} e ${s + 1}`).toEqual([])
    }
  })

  it('no mesmo dia os três lanches são diferentes', () => {
    for (const data of ANO) {
      const c = cardapioDaData(DIA_UM, data, {})
      expect(new Set([c.lancheManha, c.lancheTarde, c.trajeto]).size, data).toBe(3)
    }
  })

  it('o ano usa todos os pratos e quase não repete o dia inteiro', () => {
    const usados = new Set(ANO.flatMap((d) => Object.values(cardapioDaData(DIA_UM, d, {}))))
    expect(usados.size).toBe(IDS.length)
    const dias = new Set(ANO.map((d) => REFEICOES.map((r) => pratoOriginal(DIA_UM, d, r)).join('|')))
    expect(dias.size).toBe(365)
  })

  it('o papel da marmita segue o dia da semana', () => {
    expect([1, 2, 3, 4, 5, 6, 0].map(papelDoDia).join('')).toBe('ABABACC')
  })
})

describe('trocas de refeição', () => {
  const SEG = '2026-11-16'

  it('oferece só pratos da mesma categoria, sem o atual', () => {
    const lista = alternativas('trajeto', 'lanche2')
    expect(lista.length).toBe(TODOS_DA_CATEGORIA.lanche.length - 1)
    // a troca deixa escolher besteira em qualquer dia: é escolha do usuário
    expect(lista).toEqual(expect.arrayContaining(BESTEIRAS.lanche))
    expect(lista.every((id) => prato(id).categoria === 'lanche' && id !== 'lanche2')).toBe(true)
  })

  it('qualquer troca mantém o dia dentro de 6% da meta', () => {
    for (const data of [SEG, somarDias(DIA_UM, 60), somarDias(DIA_UM, 200), somarDias(DIA_UM, 300)]) {
      const meta = METAS[fasePara(DIA_UM, data)]
      for (const r of REFEICOES) for (const alt of alternativas(r, pratoOriginal(DIA_UM, data, r))) {
        const kcal = macrosDaData(DIA_UM, data, { [chaveDaTroca(DIA_UM, data, r)]: alt }).kcal
        expect(Math.abs(kcal - meta.kcal) / meta.kcal, `${data} ${r} por ${alt}`).toBeLessThan(0.06)
      }
    }
  })

  it('trocar a marmita vale para todos os dias dela na semana, e só nessa semana', () => {
    const outro = alternativas('almoco', pratoOriginal(DIA_UM, SEG, 'almoco'))[0]
    const trocas = { [chaveDaTroca(DIA_UM, SEG, 'almoco')]: outro }
    expect(diaDaSemana(SEG)).toBe(1)
    for (const d of [0, 2, 4]) expect(pratoDaData(DIA_UM, somarDias(SEG, d), 'almoco', trocas)).toBe(outro)
    expect(pratoDaData(DIA_UM, somarDias(SEG, 1), 'almoco', trocas)).toBe(pratoOriginal(DIA_UM, somarDias(SEG, 1), 'almoco'))
    expect(pratoDaData(DIA_UM, somarDias(SEG, 7), 'almoco', trocas)).toBe(pratoOriginal(DIA_UM, somarDias(SEG, 7), 'almoco'))
  })

  it('trocar outra refeição vale só para aquela data', () => {
    const outro = alternativas('jantar', pratoOriginal(DIA_UM, SEG, 'jantar'))[0]
    const trocas = { [chaveDaTroca(DIA_UM, SEG, 'jantar')]: outro }
    expect(pratoDaData(DIA_UM, SEG, 'jantar', trocas)).toBe(outro)
    expect(pratoDaData(DIA_UM, somarDias(SEG, 7), 'jantar', trocas)).toBe(pratoOriginal(DIA_UM, somarDias(SEG, 7), 'jantar'))
  })

  it('descarta troca gravada inválida, inclusive as do formato antigo por dia da semana', () => {
    expect(normalizarTrocas({ 's1:A': 'almoco2', 's1:B': 'jantar1', 's1:D': 'almoco1', '2026-11-16:jantar': 'jantar7', '2026-11-16:almoco': 'almoco1', '2026-13-40:ceia': 'ceia1', '2:jantar': 'jantar7', lixo: 'x' }))
      .toEqual({ 's1:A': 'almoco2', '2026-11-16:jantar': 'jantar7' })
    expect(normalizarTrocas(null)).toEqual({})
  })
})

describe('lista de compras', () => {
  const semana = datasDaSemana('2026-11-16')
  const lista = listaDeCompras(DIA_UM, semana, {})
  const item = (l: typeof lista, nome: string) => l.flatMap((s) => s.itens).find((i) => i.nome === nome)!

  it('agrupa por setor do mercado, sem item repetido', () => {
    const nomes = lista.flatMap((s) => s.itens.map((i) => i.nome))
    expect(new Set(nomes).size).toBe(nomes.length)
    expect(lista.map((s) => s.setor)).toEqual(['Açougue', 'Frios e laticínios', 'Padaria', 'Hortifruti', 'Mercearia', 'Suplementos'])
  })

  it('converte arroz e carne para peso cru', () => {
    const cozido = semana.flatMap((d) => REFEICOES.flatMap((r) => [...prato(pratoOriginal(DIA_UM, d, r)).itens])).filter((i) => i.a === 'arroz').reduce((s, i) => s + i.q[0], 0)
    expect(cozido).toBeGreaterThan(0)
    expect(item(lista, 'Arroz cru').quantidade).toBeCloseTo(cozido * 0.36, 5)
    expect(lista.flatMap((s) => s.itens).some((i) => /\(cr[ua]\)/.test(i.nome))).toBe(true)
  })

  it('quatro semanas somam as quatro listas semanais', () => {
    const segundas = [0, 1, 2, 3].map((s) => somarDias('2026-11-16', s * 7))
    const soma = segundas.reduce((t, s) => t + item(listaDeCompras(DIA_UM, datasDaSemana(s), {}), 'Leite integral').quantidade, 0)
    expect(item(listaDeCompras(DIA_UM, segundas.flatMap(datasDaSemana), {}), 'Leite integral').quantidade).toBeCloseTo(soma, 5)
  })

  it('usa a quantidade da fase de cada data', () => {
    expect(item(listaDeCompras(DIA_UM, [DIA_UM], {}), 'Creatina').quantidade).toBe(5)
    const naFase3 = datasDaSemana(segundaDe(somarDias(DIA_UM, 150)))
    expect(fasePara(DIA_UM, naFase3[0])).toBe(3)
    const leite = naFase3.flatMap((d) => REFEICOES.flatMap((r) => [...prato(pratoOriginal(DIA_UM, d, r)).itens])).filter((i) => i.a === 'leite')
    expect(item(listaDeCompras(DIA_UM, naFase3, {}), 'Leite integral').quantidade).toBe(leite.reduce((t, i) => t + i.q[2], 0))
    expect(leite.reduce((t, i) => t + i.q[2], 0)).not.toBe(leite.reduce((t, i) => t + i.q[0], 0))
  })

  it('escreve quantidades de mercado: quilos, litros, unidades', () => {
    expect(item(lista, 'Leite integral').texto).toMatch(/^\d+,\d L$/)
    expect(item(lista, 'Ovos').texto).toMatch(/^\d+ (un|dz)$/)
    expect(item(lista, 'Creatina').texto).toBe('40 g')
  })

  it('batata cozida, frita e purê viram uma compra só, e a troca de marmita muda a lista', () => {
    expect(lista.flatMap((s) => s.itens).filter((i) => /Batata/.test(i.nome)).length).toBeLessThanOrEqual(1)
    const original = pratoOriginal(DIA_UM, semana[0], 'almoco')
    const outro = alternativas('almoco', original).find((id) => prato(id).itens[0].a !== prato(original).itens[0].a)!
    const trocada = listaDeCompras(DIA_UM, semana, { [chaveDaTroca(DIA_UM, semana[0], 'almoco')]: outro })
    expect(JSON.stringify(trocada)).not.toBe(JSON.stringify(lista))
  })
})

describe('receitas completas (versão 2)', () => {
  const temFritura = (id: IdPrato) => {
    const p = prato(id)
    return p.itens.some((i) => ['batataFrita', 'milanesaFrango', 'milanesaBoi', 'coxinha', 'bacon'].includes(i.a)) || /frit[oa]|empanad|milanesa/i.test(p.nome)
  }

  it('todo prato tem receita: tempo, 3 a 7 passos, doce ou salgado, e nada de "você"', () => {
    for (const id of IDS) {
      const p = prato(id)
      expect(p.tempo, id).toBeGreaterThan(0)
      expect(p.tempo, id).toBeLessThanOrEqual(120)
      expect(p.passos.length, id).toBeGreaterThanOrEqual(3)
      expect(p.passos.length, id).toBeLessThanOrEqual(7)
      expect(p.etiquetas.filter((e) => e === 'doce' || e === 'salgado').length, id).toBe(1)
      for (const t of p.passos) expect(t.trim().length, id).toBeGreaterThan(8)
      expect(JSON.stringify(p).toLowerCase(), id).not.toMatch(/\bvocê\b/)
    }
  })

  it('refeição de trabalho diz como levar; almoço é marmita; fritura tem versão na airfryer', () => {
    for (const id of IDS) {
      const p = prato(id)
      if (p.categoria === 'lanche' || p.categoria === 'almoco') expect(p.levar?.length ?? 0, id).toBeGreaterThan(15)
      if (p.categoria === 'almoco') expect(p.etiquetas, id).toContain('marmita')
      if (temFritura(id)) expect(p.airfryer?.length ?? 0, id).toBeGreaterThan(15)
    }
  })

  it('besteira só no lanche e no jantar, com pelo menos 4 opções em cada e 30 pratos do dia a dia por refeição', () => {
    for (const id of IDS) if (prato(id).etiquetas.includes('besteira')) expect(['lanche', 'jantar'], id).toContain(prato(id).categoria)
    expect(BESTEIRAS.lanche.length).toBeGreaterThanOrEqual(4)
    expect(BESTEIRAS.jantar.length).toBeGreaterThanOrEqual(4)
    for (const c of ['pre', 'cafe', 'lanche', 'almoco', 'jantar', 'ceia'] as const) expect(DA_CATEGORIA[c].length, c).toBeGreaterThanOrEqual(30)
  })

  it('os lotes 1 e 2 trouxeram uns 170 pratos novos, chegando a 350', () => {
    expect(IDS.length).toBeGreaterThanOrEqual(345)
  })
})

describe('besteira planejada no rodízio', () => {
  const besteira = (id: IdPrato) => prato(id).etiquetas.includes('besteira')

  it('até 3 por semana nas fases 1 a 3, 1 por semana na fase 4, nunca 2 no mesmo dia', () => {
    const porSemana = new Map<number, { n: number; fase4: boolean }>()
    for (const data of ANO) {
      const dia = cardapioDaData(DIA_UM, data, {})
      const doDia = REFEICOES.filter((r) => besteira(dia[r])).length
      expect(doDia, data).toBeLessThanOrEqual(1)
      const s = semanaDe(DIA_UM, data), atual = porSemana.get(s) ?? { n: 0, fase4: false }
      porSemana.set(s, { n: atual.n + doDia, fase4: atual.fase4 || fasePara(DIA_UM, data) === 4 })
    }
    for (const [s, { n, fase4 }] of porSemana) expect(n, `semana ${s}`).toBeLessThanOrEqual(fase4 ? 3 : 3)
    const semanasSoDaFase4 = [...porSemana.keys()].filter((s) => ANO.filter((d) => semanaDe(DIA_UM, d) === s).every((d) => fasePara(DIA_UM, d) === 4))
    expect(semanasSoDaFase4.length).toBeGreaterThan(5)
    for (const s of semanasSoDaFase4) expect(porSemana.get(s)!.n, `semana ${s}`).toBeLessThanOrEqual(1)
  })

  it('cai nas vagas certas: terça no lanche da tarde, quinta e domingo no jantar', () => {
    expect(VAGAS_DE_BESTEIRA.normal.map((v) => `${v.dia}:${v.refeicao}`)).toEqual(['2:lancheTarde', '4:jantar', '0:jantar'])
    const terca = ANO.find((d) => diaDaSemana(d) === 2 && fasePara(DIA_UM, d) === 1)!
    expect(besteira(pratoDaData(DIA_UM, terca, 'lancheTarde', {}))).toBe(true)
    expect(besteira(pratoDaData(DIA_UM, terca, 'jantar', {}))).toBe(false)
  })

  it('todas as besteiras aparecem ao longo do ano', () => {
    const vistas = new Set(ANO.flatMap((d) => Object.values(cardapioDaData(DIA_UM, d, {}))).filter(besteira))
    for (const c of ['lanche', 'jantar'] as const) for (const id of BESTEIRAS[c]) expect(vistas.has(id), id).toBe(true)
  })
})

describe('receita casa com o prato', () => {
  const n = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  // pós, bebida de base e gordura de preparo nem sempre aparecem com o nome nos passos
  const IGNORAR = new Set<string>(['creatina', 'guarana', 'beterraba', 'whey', 'leite', 'azeite', 'manteiga', 'mel', 'sucoLaranja', 'maca'])
  const GENERICAS = new Set(['com', 'cozido', 'cozida', 'grelhado', 'assada', 'assado', 'natural', 'integral', 'refogada', 'tipo', 'frito', 'frita', 'liso', 'pronto', 'cremoso', 'para'])

  it('os passos citam pelo menos metade dos ingredientes do próprio prato (pega receita trocada de prato)', () => {
    const ruins: string[] = []
    for (const id of IDS) {
      const p = prato(id)
      // prato que sai do preparo de domingo pode só remeter a ele: a receita de domingo entra na conferência
      const domingo = p.receita ? RECEITAS[p.receita as keyof typeof RECEITAS] : undefined
      const texto = n([...p.passos, p.levar ?? '', p.airfryer ?? '', ...(domingo ? [...domingo.ingredientes, ...domingo.passos] : [])].join(' ')).replace(/paes/g, 'pao')
      const itens = p.itens.filter((i) => !IGNORAR.has(i.a))
      const falta = itens.filter((i) => !n(ALIMENTOS[i.a].nome).split(/[^a-z]+/).filter((w) => w.length >= 3 && !GENERICAS.has(w)).some((w) => texto.includes(w.slice(0, 5))))
      if (itens.length && falta.length / itens.length >= 0.5) ruins.push(`${id} ${p.nome}: falta ${falta.map((i) => i.a).join(', ')}`)
    }
    expect(ruins).toEqual([])
  })
})

describe('preparo de domingo', () => {
  it('prato que remete ao preparo de domingo aponta para ele, e o livro mostra a receita', () => {
    for (const id of IDS) {
      const p = prato(id)
      if (/preparo de domingo/i.test(p.passos.join(' '))) expect(p.receita, id).toBeDefined()
    }
  })
})
