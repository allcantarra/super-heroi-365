import { beforeEach, describe, expect, it } from 'vitest'
import { APARENCIA_PADRAO } from '../heroi/aparencia'
import { banco, lerAparencia, salvarAparencia } from './banco'

beforeEach(async () => {
  await banco.perfil.clear()
})

describe('aparência gravada no aparelho', () => {
  it('devolve o padrão quando nada foi salvo', async () => {
    expect(await lerAparencia()).toEqual(APARENCIA_PADRAO)
  })

  it('lê de volta o que foi salvo', async () => {
    const a = { pele: 'Morena', cabelo: 'Preto', uniforme: 'Grafite', corte: 'Curto' } as const
    await salvarAparencia(a)
    expect(await lerAparencia()).toEqual(a)
  })

  it('conserta registro corrompido na leitura', async () => {
    await banco.perfil.put({ id: 'eu', aparencia: { pele: 'X' } as never })
    expect(await lerAparencia()).toEqual(APARENCIA_PADRAO)
  })
})
