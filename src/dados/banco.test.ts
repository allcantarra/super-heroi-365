import { beforeEach, describe, expect, it } from 'vitest'
import { alternarMissao, mudarCopos } from '../dominio/dia'
import { ROTINA_PADRAO } from '../dominio/rotina'
import { APARENCIA_PADRAO } from '../heroi/aparencia'
import { banco, lerDias, lerPerfil, mudarDia, normalizarDia, normalizarPerfil, salvarPerfil, type Perfil } from './banco'

const PESSOA = { pesoInicial: 60, metaPeso: 70, altura: 175, idade: 30 }
const PERFIL: Perfil = { id: 'eu', aparencia: { pele: 'Morena', cabelo: 'Preto', uniforme: 'Grafite', corte: 'Curto' }, pessoa: PESSOA, rotina: ROTINA_PADRAO, diaUm: '2026-11-12', som: false, trocas: { '2026-11-16:jantar': 'jantar7', 's1:A': 'almoco2' }, comprados: ['arroz'] }

beforeEach(async () => {
  await banco.perfil.clear()
  await banco.dias.clear()
})

describe('perfil no aparelho', () => {
  it('sem nada salvo, devolve perfil padrão e primeira abertura pendente', async () => {
    expect(await lerPerfil()).toEqual({ id: 'eu', aparencia: APARENCIA_PADRAO, pessoa: null, rotina: ROTINA_PADRAO, diaUm: null, som: true, trocas: {}, comprados: [] })
  })

  it('lê de volta o que foi salvo', async () => {
    await salvarPerfil(PERFIL)
    expect(await lerPerfil()).toEqual(PERFIL)
  })

  it('aproveita o perfil da etapa 1, que só tinha aparência', async () => {
    await banco.perfil.put({ id: 'eu', aparencia: PERFIL.aparencia } as never)
    const p = await lerPerfil()
    expect(p.aparencia).toEqual(PERFIL.aparencia)
    expect(p.diaUm).toBeNull()
  })

  it('recusa números fora da faixa e data impossível', () => {
    expect(normalizarPerfil({ ...PERFIL, pessoa: { ...PESSOA, pesoInicial: 900 } }).pessoa).toBeNull()
    expect(normalizarPerfil({ ...PERFIL, pessoa: { ...PESSOA, idade: '30' } }).pessoa).toBeNull()
    expect(normalizarPerfil({ ...PERFIL, diaUm: '2026-13-40' }).diaUm).toBeNull()
  })

  it('descarta troca inválida e item comprado desconhecido ou repetido', () => {
    const p = normalizarPerfil({ ...PERFIL, trocas: { '2026-11-16:jantar': 'almoco1', '2026-11-16:ceia': 'ceia2', '1:ceia': 'ceia2' }, comprados: ['arroz', 'arroz', 'x', 3] })
    expect(p.trocas).toEqual({ '2026-11-16:ceia': 'ceia2' })
    expect(p.comprados).toEqual(['arroz'])
  })

  it('sem dados da pessoa, a primeira abertura continua pendente mesmo com data', () => {
    expect(normalizarPerfil({ ...PERFIL, pessoa: null }).diaUm).toBeNull()
  })
})

describe('registro dos dias', () => {
  it('grava missões e água e lê de volta', async () => {
    await mudarDia('2026-11-12', (r) => alternarMissao(r, 'cafe'))
    await mudarDia('2026-11-12', (r) => mudarCopos(r, 1))
    expect((await lerDias()).get('2026-11-12')).toEqual({ data: '2026-11-12', feitas: ['cafe'], copos: 1 })
  })

  it('toques simultâneos não se perdem', async () => {
    await Promise.all([
      mudarDia('2026-11-12', (r) => alternarMissao(r, 'cafe')),
      mudarDia('2026-11-12', (r) => alternarMissao(r, 'almoco')),
      mudarDia('2026-11-12', (r) => mudarCopos(r, 1)),
    ])
    const r = (await lerDias()).get('2026-11-12')!
    expect([...r.feitas].sort()).toEqual(['almoco', 'cafe'])
    expect(r.copos).toBe(1)
  })

  it('descarta missão desconhecida, repetida e copos inválidos', () => {
    expect(normalizarDia({ feitas: ['cafe', 'cafe', 'hack', 7], copos: 99 }, '2026-11-12')).toEqual({ data: '2026-11-12', feitas: ['cafe'], copos: 0 })
    expect(normalizarDia(undefined, '2026-11-12')).toEqual({ data: '2026-11-12', feitas: [], copos: 0 })
  })
})
