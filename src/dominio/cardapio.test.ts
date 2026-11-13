import { describe, expect, it } from 'vitest'
import { ALIMENTOS, PROIBIDOS, type IdAlimento } from '../conteudo/alimentos'
import { CATEGORIA_DA_REFEICAO, FORMATO, METAS, MODELOS, REFEICOES, REFEICAO_LIVRE } from '../conteudo/cardapio'
import { ORCAMENTO, PRATOS, type IdPrato } from '../conteudo/pratos'
import { RECEITAS } from '../conteudo/receitas'
import { alternativas, cardapioDoDia, chaveDaTroca, listaDeCompras, macrosDoDia, macrosDoPrato, normalizarTrocas, prato, pratoDoDia } from './cardapio'
import type { Fase } from './tempo'

const FASES: Fase[] = [1, 2, 3, 4]
const DIAS = [0, 1, 2, 3, 4, 5, 6]
const IDS = Object.keys(PRATOS) as IdPrato[]

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
    for (const p of Object.values(PRATOS)) {
      for (const item of p.itens) expect(ALIMENTOS[item.a as IdAlimento]).toBeDefined()
      if ('receita' in p) expect(RECEITAS[p.receita as keyof typeof RECEITAS]).toBeDefined()
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

describe('conteúdo: pratos e modelos de dia', () => {
  it('todo prato fecha perto do orçamento da categoria em todas as fases', () => {
    for (const id of IDS) for (const f of FASES) {
      const alvo = ORCAMENTO[PRATOS[id].categoria][f - 1]
      expect(Math.abs(macrosDoPrato(id, f).kcal - alvo) / alvo, `${id} fase ${f}`).toBeLessThan(0.1)
    }
  })

  it('quantidades são práticas: positivas, inteiras para o que se conta', () => {
    for (const p of Object.values(PRATOS)) for (const item of p.itens) for (const q of item.q) {
      expect(q).toBeGreaterThan(0)
      if (typeof ALIMENTOS[item.a].medida === 'object') expect(Number.isInteger(q)).toBe(true)
    }
  })

  it('cada modelo de dia serve cada refeição com um prato da categoria certa', () => {
    for (const d of DIAS) for (const r of REFEICOES) expect(PRATOS[MODELOS[d][r]].categoria, `dia ${d} ${r}`).toBe(CATEGORIA_DA_REFEICAO[r])
  })

  it('refeição de trabalho e de trajeto é sempre marmita ou portátil', () => {
    for (const d of DIAS) {
      for (const r of ['lancheManha', 'lancheTarde', 'trajeto'] as const) expect(FORMATO[PRATOS[MODELOS[d][r]].categoria]).toBe('portátil')
      expect(FORMATO[PRATOS[MODELOS[d].almoco].categoria]).toBe('marmita')
    }
  })

  it('todo dia, em toda fase, fecha a até 5% da meta de calorias e perto das metas de macros', () => {
    for (const d of DIAS) for (const f of FASES) {
      const m = macrosDoDia(d, f, {})
      expect(Math.abs(m.kcal - METAS[f].kcal) / METAS[f].kcal, `kcal dia ${d} fase ${f}: ${Math.round(m.kcal)}`).toBeLessThan(0.05)
      expect(m.p / METAS[f].p, `proteína dia ${d} fase ${f}: ${Math.round(m.p)}`).toBeGreaterThan(0.9)
      expect(m.p / METAS[f].p, `proteína dia ${d} fase ${f}: ${Math.round(m.p)}`).toBeLessThan(1.15)
      expect(m.c / METAS[f].c, `carboidrato dia ${d} fase ${f}: ${Math.round(m.c)}`).toBeGreaterThan(0.9)
      expect(m.g / METAS[f].g, `gordura dia ${d} fase ${f}: ${Math.round(m.g)}`).toBeLessThan(1.2)
    }
  })

  it('a fase 4 tem menos carboidrato que a fase 3 em todos os dias', () => {
    for (const d of DIAS) expect(macrosDoDia(d, 4, {}).c).toBeLessThan(macrosDoDia(d, 3, {}).c)
  })

  it('pré-treino tem guaraná e todo café tem whey e creatina', () => {
    for (const id of IDS) {
      const itens = PRATOS[id].itens.map((i) => i.a as string)
      if (PRATOS[id].categoria === 'pre') expect(itens, id).toContain('guarana')
      if (PRATOS[id].categoria === 'cafe') expect(itens, id).toEqual(expect.arrayContaining(['whey', 'creatina']))
    }
  })
})

describe('trocas de refeição', () => {
  it('oferece só pratos da mesma categoria, sem o atual', () => {
    const lista = alternativas('trajeto', 'lanche2', 1)
    expect(lista.length).toBeGreaterThanOrEqual(5)
    expect(lista.every((a) => PRATOS[a.id].categoria === 'lanche' && a.id !== 'lanche2')).toBe(true)
  })

  it('qualquer troca mantém o dia dentro de 6% da meta', () => {
    for (const f of FASES) for (const r of REFEICOES) for (const alt of alternativas(r, MODELOS[1][r], f)) {
      const kcal = macrosDoDia(1, f, { [chaveDaTroca(1, r)]: alt.id }).kcal
      expect(Math.abs(kcal - METAS[f].kcal) / METAS[f].kcal, `${r} por ${alt.id} fase ${f}`).toBeLessThan(0.06)
    }
  })

  it('a troca vale só para aquele dia da semana e aquela refeição', () => {
    const trocas = { [chaveDaTroca(2, 'jantar')]: 'jantar7' as const }
    expect(pratoDoDia(2, 'jantar', trocas)).toBe('jantar7')
    expect(pratoDoDia(3, 'jantar', trocas)).toBe(MODELOS[3].jantar)
    expect(cardapioDoDia(2, trocas).almoco).toBe(MODELOS[2].almoco)
  })

  it('descarta troca gravada inválida: prato inexistente, categoria errada ou chave quebrada', () => {
    expect(normalizarTrocas({ '2:jantar': 'jantar7', '2:almoco': 'jantar7', '9:jantar': 'jantar1', '1:ceia': 'nada', lixo: 'x' })).toEqual({ '2:jantar': 'jantar7' })
    expect(normalizarTrocas(null)).toEqual({})
    expect(pratoDoDia(2, 'almoco', { '2:almoco': 'jantar7' })).toBe(MODELOS[2].almoco)
  })
})

describe('lista de compras', () => {
  const semana = listaDeCompras(1, {}, 1)
  const item = (id: string) => semana.flatMap((s) => s.itens).find((i) => i.id === id)!

  it('agrupa por setor do mercado, sem item repetido', () => {
    const ids = semana.flatMap((s) => s.itens.map((i) => i.id))
    expect(new Set(ids).size).toBe(ids.length)
    expect(semana.map((s) => s.setor)).toEqual(['Açougue', 'Frios e laticínios', 'Padaria', 'Hortifruti', 'Mercearia', 'Suplementos'])
  })

  it('converte arroz e carne para peso cru', () => {
    expect(item('arroz').nome).toBe('Arroz cru')
    const cozido = DIAS.flatMap((d) => REFEICOES.flatMap((r) => [...prato(MODELOS[d][r]).itens])).filter((i) => i.a === 'arroz').reduce((s, i) => s + i.q[0], 0)
    expect(item('arroz').quantidade).toBeCloseTo(cozido * 0.36, 5)
    expect(item('frango').nome).toMatch(/cru/)
  })

  it('a lista do mês é 4 vezes a da semana', () => {
    const mes = listaDeCompras(1, {}, 4).flatMap((s) => s.itens).find((i) => i.id === 'leite')!
    expect(mes.quantidade).toBe(item('leite').quantidade * 4)
  })

  it('escreve quantidades de mercado: quilos, litros, dúzias', () => {
    expect(item('leite').texto).toMatch(/^\d+,\d L$/)
    expect(item('ovo').texto).toMatch(/^\d+ ovos$/)
    expect(listaDeCompras(1, {}, 4).flatMap((s) => s.itens).find((i) => i.id === 'ovo')!.texto).toMatch(/^\d+ dz$/)
    expect(item('creatina').texto).toBe('40 g')
  })

  it('a troca de prato muda a lista', () => {
    const batata = (lista: typeof semana) => lista.flatMap((s) => s.itens).find((i) => i.nome === 'Batata')!.quantidade
    // sexta: sai o bife com batata frita, entra a omelete
    expect(batata(listaDeCompras(1, { [chaveDaTroca(5, 'jantar')]: 'jantar3' }, 1))).toBeLessThan(batata(semana))
  })

  it('batata cozida, frita e purê viram uma compra só', () => {
    expect(semana.flatMap((s) => s.itens).filter((i) => /Batata/.test(i.nome))).toHaveLength(1)
  })
})
