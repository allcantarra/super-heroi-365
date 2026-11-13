import { describe, expect, it } from 'vitest'
import { alternarMissao, registroVazio, type RegistroDia } from './dia'
import {
  XP_FOTO, XP_PESAGEM, atributos, medidaValida, mesDoProjeto, nivelDoAtributo, normalizarFoto, normalizarMedida, normalizarPesagem,
  pesoValido, ritmo, serieDePeso, tendencia, variacaoDasMedidas, xpDaEvolucao,
} from './evolucao'
import { ROTINA_PADRAO, type IdMissao } from './rotina'
import { somarDias } from './tempo'
import type { Sessao } from './treino'

const DIA_UM = '2026-11-12'

describe('peso', () => {
  it('aceita vírgula, arredonda a uma casa e recusa o impossível', () => {
    expect(pesoValido('55,46')).toBe(55.5)
    expect(pesoValido(61)).toBe(61)
    for (const ruim of ['', 'abc', 29.9, 200.1, NaN, null]) expect(pesoValido(ruim)).toBeNull()
  })

  it('descarta pesagem gravada com data ou peso inválido', () => {
    expect(normalizarPesagem({ data: '2026-11-20', kg: 56.2 })).toEqual({ data: '2026-11-20', kg: 56.2 })
    expect(normalizarPesagem({ data: '2026-02-30', kg: 56 })).toBeNull()
    expect(normalizarPesagem({ data: '2026-11-20', kg: '56' })).toBeNull()
  })

  it('a série começa no peso do cadastro e ignora pesagens de antes do dia 1', () => {
    expect(serieDePeso(DIA_UM, 55, [{ data: '2026-11-20', kg: 56 }, { data: '2026-11-01', kg: 50 }])).toEqual([
      { data: DIA_UM, kg: 55 },
      { data: '2026-11-20', kg: 56 },
    ])
  })

  it('pesagem no dia 1 substitui o peso do cadastro', () => {
    expect(serieDePeso(DIA_UM, 55, [{ data: DIA_UM, kg: 55.4 }])).toEqual([{ data: DIA_UM, kg: 55.4 }])
  })

  it('a tendência fica entre o peso antigo e o novo, e anda mais quanto maior o intervalo', () => {
    const [a, b] = tendencia([{ data: DIA_UM, kg: 55 }, { data: somarDias(DIA_UM, 1), kg: 56 }])
    expect(a.tendencia).toBe(55)
    expect(b.tendencia).toBeCloseTo(55.1, 5)
    const [, semana] = tendencia([{ data: DIA_UM, kg: 55 }, { data: somarDias(DIA_UM, 7), kg: 56 }])
    expect(semana.tendencia).toBeCloseTo(55 + (1 - 0.9 ** 7), 5)
    expect(semana.tendencia).toBeLessThan(56)
  })

  it('a tendência ignora um pico isolado mais do que o peso cru', () => {
    const datas = [0, 1, 2, 3, 4].map((i) => somarDias(DIA_UM, i))
    const pontos = tendencia(datas.map((data, i) => ({ data, kg: i === 2 ? 58 : 55 })))
    expect(Math.max(...pontos.map((p) => p.tendencia))).toBeLessThan(55.4)
  })

  it('ritmo só aparece com 10 dias de pesagens e avalia contra a fase', () => {
    const curto = tendencia([{ data: DIA_UM, kg: 55 }, { data: somarDias(DIA_UM, 7), kg: 56 }])
    expect(ritmo(DIA_UM, curto)).toBeNull()
    const datas = Array.from({ length: 22 }, (_, i) => somarDias(DIA_UM, i))
    const subindo = tendencia(datas.map((data, i) => ({ data, kg: 55 + i * 0.08 })))
    const r = ritmo(DIA_UM, subindo)!
    expect(r.fase).toBe(1)
    expect(r.kgPorSemana).toBeGreaterThan(0.3)
    expect(r.avaliacao).toBe('dentro')
    const parado = tendencia(datas.map((data) => ({ data, kg: 55 })))
    expect(ritmo(DIA_UM, parado)!.avaliacao).toBe('abaixo')
  })

  it('na fase 4, perder peso no ritmo certo é "dentro"', () => {
    const inicio = somarDias(DIA_UM, 260)
    const datas = Array.from({ length: 22 }, (_, i) => somarDias(inicio, i))
    const r = ritmo(DIA_UM, tendencia(datas.map((data, i) => ({ data, kg: 66 - i * 0.06 }))))!
    expect(r.fase).toBe(4)
    expect(r.avaliacao).toBe('dentro')
  })
})

describe('medidas', () => {
  it('guarda só as partes válidas e exige pelo menos uma', () => {
    expect(normalizarMedida({ data: '2026-11-20', peito: '88,5', braco: 'x', cintura: 300, coxa: 50 })).toEqual({ data: '2026-11-20', peito: 88.5, coxa: 50 })
    expect(normalizarMedida({ data: '2026-11-20', peito: '' })).toBeNull()
    expect(normalizarMedida({ peito: 90 })).toBeNull()
    expect(medidaValida(14)).toBeNull()
  })

  it('a variação compara a primeira e a última medida de cada parte', () => {
    const v = variacaoDasMedidas([
      { data: '2026-12-20', braco: 28, peito: 90 },
      { data: '2026-11-20', braco: 26 },
      { data: '2027-01-20', braco: 29.5 },
    ])
    expect(v).toEqual({ braco: { de: 26, para: 29.5 } })
  })
})

describe('fotos', () => {
  it('o mês do projeto conta de 30 em 30 dias a partir do dia 1', () => {
    expect(mesDoProjeto(DIA_UM, DIA_UM)).toBe(1)
    expect(mesDoProjeto(DIA_UM, somarDias(DIA_UM, 29))).toBe(1)
    expect(mesDoProjeto(DIA_UM, somarDias(DIA_UM, 30))).toBe(2)
    expect(mesDoProjeto(DIA_UM, somarDias(DIA_UM, 364))).toBe(13)
    expect(mesDoProjeto(DIA_UM, somarDias(DIA_UM, -5))).toBe(1)
  })

  it('aceita só imagem, com mês e data válidos', () => {
    const imagem = new Blob(['x'], { type: 'image/jpeg' })
    expect(normalizarFoto({ mes: 2, data: '2026-12-15', imagem })).toEqual({ mes: 2, data: '2026-12-15', imagem })
    expect(normalizarFoto({ mes: 2, data: '2026-12-15', imagem: new Blob(['x'], { type: 'text/html' }) })).toBeNull()
    expect(normalizarFoto({ mes: 0, data: '2026-12-15', imagem })).toBeNull()
    expect(normalizarFoto({ mes: 2, data: '2026-12-15', imagem: 'data:image/png' })).toBeNull()
  })
})

describe('XP da evolução', () => {
  it('pesagem dá XP uma vez por semana; foto, uma vez por mês', () => {
    const pesagens = ['2026-11-12', '2026-11-13', '2026-11-16', '2026-11-30']
    expect(xpDaEvolucao(DIA_UM, '2026-12-01', pesagens, [1, 1])).toBe(3 * XP_PESAGEM + XP_FOTO)
  })

  it('não conta pesagem fora do período nem foto de mês que ainda não chegou', () => {
    expect(xpDaEvolucao(DIA_UM, '2026-11-20', ['2026-11-01', '2026-12-25'], [1, 2, 5])).toBe(XP_FOTO)
  })
})

describe('atributos do herói', () => {
  const REFEICOES: IdMissao[] = ['pre', 'cafe', 'lancheManha', 'almoco', 'lancheTarde', 'trajeto']
  const sessao = (data: string, series: [string, number][]): Sessao => ({ data, treino: 'x', inicio: 1, fim: 2, series: series.map(([exercicio, valor]) => ({ exercicio, valor })) as Sessao['series'] })

  it('o nível cresce com pontos e cada nível pede mais que o anterior', () => {
    expect(nivelDoAtributo('forca', 0)).toEqual({ nivel: 1, noNivel: 0, doNivel: 20 })
    expect(nivelDoAtributo('forca', 20)).toEqual({ nivel: 2, noNivel: 0, doNivel: 60 })
    expect(nivelDoAtributo('forca', 79).nivel).toBe(2)
    expect(nivelDoAtributo('forca', 80).nivel).toBe(3)
  })

  it('começa tudo no nível 1 sem registros', () => {
    expect(atributos(DIA_UM, DIA_UM, ROTINA_PADRAO, new Map(), new Map()).map((a) => [a.id, a.nivel, a.pontos])).toEqual([
      ['forca', 1, 0], ['folego', 1, 0], ['energia', 1, 0], ['foco', 1, 0],
    ])
  })

  it('soma séries de força, minutos de corrida, refeições e dias vencidos', () => {
    const hoje = '2026-11-13'
    const dias = new Map<string, RegistroDia>([
      [DIA_UM, { ...registroVazio(DIA_UM), feitas: [...REFEICOES, 'treino'] }],
      [hoje, alternarMissao(registroVazio(hoje), 'cafe')],
    ])
    const sessoes = new Map([
      [DIA_UM, sessao(DIA_UM, [['flexao', 10], ['flexao', 9], ['prancha', 30], ['corridaLeve', 20]])],
      ['2026-11-01', sessao('2026-11-01', [['flexao', 10]])],
    ])
    const a = Object.fromEntries(atributos(DIA_UM, hoje, ROTINA_PADRAO, dias, sessoes).map((x) => [x.id, x.pontos]))
    expect(a).toEqual({ forca: 3, folego: 20, energia: 7, foco: 1 })
  })

  it('separa o que foi feito nos últimos 7 dias', () => {
    const hoje = somarDias(DIA_UM, 20)
    const sessoes = new Map([
      [DIA_UM, sessao(DIA_UM, [['flexao', 10]])],
      [hoje, sessao(hoje, [['flexao', 10], ['flexao', 10]])],
    ])
    const forca = atributos(DIA_UM, hoje, ROTINA_PADRAO, new Map(), sessoes).find((x) => x.id === 'forca')!
    expect(forca.pontos).toBe(3)
    expect(forca.semana).toBe(2)
  })
})
