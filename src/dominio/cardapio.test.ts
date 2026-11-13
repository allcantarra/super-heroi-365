import { describe, expect, it } from 'vitest'
import { ALIMENTOS, PROIBIDOS, type IdAlimento } from '../conteudo/alimentos'
import { CATEGORIA_DA_REFEICAO, FORMATO, METAS, REFEICOES, REFEICAO_LIVRE } from '../conteudo/cardapio'
import { ORCAMENTO, PRATOS, type IdPrato } from '../conteudo/pratos'
import { RECEITAS } from '../conteudo/receitas'
import {
  DA_CATEGORIA, alternativas, cardapioDaData, chaveDaTroca, datasDaSemana, fasePara, listaDeCompras, macrosDaData, macrosDoPrato,
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
      ...Object.values(PRATOS).flatMap((p) => [p.nome, p.preparo]),
      ...Object.values(RECEITAS).flatMap((r) => [r.nome, ...r.ingredientes, ...r.passos]),
      ...REFEICAO_LIVRE.regras,
    ]
    expect(textos.filter((t) => PROIBIDOS.test(t))).toEqual([])
  })

  it('a checagem de proibidos funciona', () => {
    for (const t of ['Feijão tropeiro', 'salada', 'Filé de peixe', 'camarão', 'legumes']) expect(PROIBIDOS.test(t)).toBe(true)
    expect(PROIBIDOS.test('Arroz, bife e batata')).toBe(false)
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
      if (a.kcal === 0) continue
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

  it('lanches e almoços não são múltiplos de 3, senão o rodízio prende pratos em posições fixas', () => {
    expect(DA_CATEGORIA.lanche.length % 3).not.toBe(0)
    expect(DA_CATEGORIA.almoco.length % 3).not.toBe(0)
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

  it('os macros de um dia isolado ficam a até 20% da meta (35% para gordura)', () => {
    for (const data of ANO) {
      const m = macrosDaData(DIA_UM, data, {}), meta = METAS[fasePara(DIA_UM, data)]
      expect(Math.abs(m.p / meta.p - 1), `proteína ${data}: ${Math.round(m.p)}`).toBeLessThan(0.2)
      expect(Math.abs(m.c / meta.c - 1), `carboidrato ${data}: ${Math.round(m.c)}`).toBeLessThan(0.2)
      expect(Math.abs(m.g / meta.g - 1), `gordura ${data}: ${Math.round(m.g)}`).toBeLessThan(0.35)
    }
  })

  it('na média de cada semana, os macros ficam a até 10% da meta', () => {
    for (let s = 1; s < 52; s++) {
      const dias = datasDaSemana(somarDias('2026-11-09', s * 7))
      if (new Set(dias.map((d) => fasePara(DIA_UM, d))).size > 1) continue // semana de virada de fase
      const meta = METAS[fasePara(DIA_UM, dias[0])]
      const media = (k: 'p' | 'c' | 'g') => dias.reduce((t, d) => t + macrosDaData(DIA_UM, d, {})[k], 0) / 7
      for (const k of ['p', 'c', 'g'] as const) expect(Math.abs(media(k) / meta[k] - 1), `semana ${s} ${k}: ${Math.round(media(k))}`).toBeLessThan(0.1)
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
    expect(dias.size).toBeGreaterThan(330)
  })

  it('o papel da marmita segue o dia da semana', () => {
    expect([1, 2, 3, 4, 5, 6, 0].map(papelDoDia).join('')).toBe('ABABACC')
  })
})

describe('trocas de refeição', () => {
  const SEG = '2026-11-16'

  it('oferece só pratos da mesma categoria, sem o atual', () => {
    const lista = alternativas('trajeto', 'lanche2')
    expect(lista.length).toBe(DA_CATEGORIA.lanche.length - 1)
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
    const naFase3 = somarDias(DIA_UM, 150)
    expect(fasePara(DIA_UM, naFase3)).toBe(3)
    const fase1 = listaDeCompras(DIA_UM, datasDaSemana(segundaDe(somarDias(DIA_UM, 7))), {})
    const fase3 = listaDeCompras(DIA_UM, datasDaSemana(segundaDe(naFase3)), {})
    expect(item(fase3, 'Arroz cru').quantidade).toBeGreaterThan(item(fase1, 'Arroz cru').quantidade * 0.9)
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
