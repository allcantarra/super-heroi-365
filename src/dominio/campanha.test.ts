import { describe, expect, it } from 'vitest'
import { CHEFOES, DESAFIOS, chefao, chefaoAtual, conquistas, desafioDaSemana, gibi, maiorSequencia, type Registros } from './campanha'
import { META_COPOS, type RegistroDia } from './dia'
import { ROTINA_PADRAO, missoesDoDia, type IdMissao } from './rotina'
import { somarDias } from './tempo'
import type { Sessao } from './treino'

const DIA_UM = '2026-11-12' // quinta-feira
const tudo = (data: string): RegistroDia => ({ data, feitas: missoesDoDia(ROTINA_PADRAO, data).map((m) => m.id), copos: META_COPOS })
const base = (hoje: string, dias: RegistroDia[] = [], extra: Partial<Registros> = {}): Registros => ({
  diaUm: DIA_UM, hoje, rotina: ROTINA_PADRAO, pesoInicial: 60, dias: new Map(dias.map((d) => [d.data, d])),
  sessoes: new Map(), pesagens: new Map(), mesesComFoto: [], xpTotal: 0, ...extra,
})
const seguidos = (n: number, de = DIA_UM) => Array.from({ length: n }, (_, i) => tudo(somarDias(de, i)))

describe('chefão da fase', () => {
  const totalDaFase1 = Array.from({ length: 30 }, (_, i) => missoesDoDia(ROTINA_PADRAO, somarDias(DIA_UM, i)).length).reduce((a, b) => a + b, 0)

  it('começa com vida cheia e meta de 80% das missões da fase', () => {
    const c = chefaoAtual(base(DIA_UM))
    expect(c.vilao).toBe(CHEFOES[1])
    expect(c.meta).toBe(Math.ceil(totalDaFase1 * 0.8))
    expect(c).toMatchObject({ vida: 1, derrotado: false, comecou: true, terminou: false })
  })

  it('cada missão tira vida; 24 dias completos derrotam a Preguiça antes do fim da fase', () => {
    const c10 = chefao(base(somarDias(DIA_UM, 9), seguidos(10)), 1)
    expect(c10.vida).toBeGreaterThan(0.5)
    expect(c10.vida).toBeLessThan(0.7)
    const c24 = chefao(base(somarDias(DIA_UM, 23), seguidos(24)), 1)
    expect(c24).toMatchObject({ derrotado: true, vida: 0 })
  })

  it('missão marcada em data futura não conta', () => {
    expect(chefao(base(DIA_UM, seguidos(10)), 1).cumpridas).toBe(missoesDoDia(ROTINA_PADRAO, DIA_UM).length)
  })

  it('fase acabada sem derrotar: o chefão fica de pé, sem punição', () => {
    const c = chefao(base(somarDias(DIA_UM, 40), seguidos(5)), 1)
    expect(c).toMatchObject({ terminou: true, derrotado: false })
    expect(chefaoAtual(base(somarDias(DIA_UM, 40))).fase).toBe(2)
  })
})

describe('vilão da semana', () => {
  it('na primeira semana parcial, o alvo encolhe na proporção dos dias', () => {
    const d = desafioDaSemana(base(DIA_UM))
    expect(d.vilao).toBe(DESAFIOS[0].vilao)
    expect(d.alvo).toBe(3) // 5 dias de água, mas a semana só tem 4 dias de projeto (quinta a domingo)
    expect(d.meta).toBe('Bater a meta de água em 3 dias')
  })

  it('conta só os dias da semana até hoje e vence ao bater o alvo', () => {
    const hoje = somarDias(DIA_UM, 2)
    const d = desafioDaSemana(base(hoje, seguidos(3)))
    expect(d).toMatchObject({ feito: 3, vencido: true, diasPassados: 3 })
  })

  it('a semana seguinte traz outro vilão, com o alvo cheio', () => {
    const d = desafioDaSemana(base('2026-11-16'))
    expect(d.vilao).toBe(DESAFIOS[1].vilao)
    expect(d.alvo).toBe(DESAFIOS[1].alvo)
    expect(d.feito).toBe(0)
  })

  it('o vilão da balança conta pesagens', () => {
    const semana = 4 // índice do Fujão da Balança
    const segunda = somarDias('2026-11-09', semana * 7)
    expect(desafioDaSemana(base(segunda)).vilao).toBe('O Fujão da Balança')
    const d = desafioDaSemana(base(segunda, [], { pesagens: new Map([[segunda, { data: segunda, kg: 61 }]]) }))
    expect(d).toMatchObject({ feito: 1, vencido: true })
  })
})

describe('conquistas', () => {
  it('sem registros, nenhuma conquista', () => {
    expect(conquistas(base(DIA_UM)).filter((c) => c.feita)).toEqual([])
  })

  it('sete dias completos dão primeiro passo, dia vencido e semana de herói', () => {
    const feitas = conquistas(base(somarDias(DIA_UM, 6), seguidos(7))).filter((c) => c.feita).map((c) => c.id)
    expect(feitas).toEqual(expect.arrayContaining(['primeira-missao', 'primeiro-dia', 'primeira-semana']))
    expect(feitas).not.toContain('um-mes')
  })

  it('treinos, séries, peso, fotos e nível viram conquistas', () => {
    const sessao = (data: string, exercicio: string, valor: number): Sessao => ({ data, treino: 'x', inicio: 1, fim: 2, series: [{ exercicio, valor }] as Sessao['series'] })
    const r = base(somarDias(DIA_UM, 20), [], {
      sessoes: new Map([[DIA_UM, sessao(DIA_UM, 'flexao', 10)], ['2026-11-13', sessao('2026-11-13', 'flexaoArqueiro', 3)]]),
      pesagens: new Map(Array.from({ length: 20 }, (_, i) => somarDias(DIA_UM, i + 1)).map((d) => [d, { data: d, kg: 62 }])),
      mesesComFoto: [1],
      xpTotal: 2000,
    })
    const feitas = conquistas(r).filter((c) => c.feita).map((c) => c.id)
    expect(feitas).toEqual(expect.arrayContaining(['primeiro-treino', 'dez-flexoes', 'arqueiro', 'primeiro-quilo', 'primeira-foto', 'recruta']))
    expect(feitas).not.toContain('cinco-quilos')
    expect(feitas).not.toContain('antes-depois')
  })

  it('as conquistas têm id único', () => {
    const ids = conquistas(base(DIA_UM)).map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('sequência e gibi', () => {
  it('a maior sequência ignora os buracos e guarda o recorde', () => {
    const dias = [...seguidos(3), ...seguidos(5, somarDias(DIA_UM, 5))]
    expect(maiorSequencia(base(somarDias(DIA_UM, 12), dias))).toBe(5)
  })

  it('o gibi tem um capítulo por fase começada e um quadro por dia vencido', () => {
    const quase: RegistroDia = { data: somarDias(DIA_UM, 1), feitas: ['cafe'] as IdMissao[], copos: 0 }
    const capitulos = gibi(base(somarDias(DIA_UM, 31), [tudo(DIA_UM), quase, tudo(somarDias(DIA_UM, 30))]))
    expect(capitulos.map((c) => c.fase)).toEqual([1, 2])
    expect(capitulos[0].quadros.map((q) => q.numero)).toEqual([1])
    expect(capitulos[0].quadros[0]).toMatchObject({ treino: true, refeicoes: 8 })
    expect(capitulos[1].quadros.map((q) => q.numero)).toEqual([31])
    expect(capitulos[0].diasDaFase).toBe(30)
  })
})
