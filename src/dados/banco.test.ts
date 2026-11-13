import { beforeEach, describe, expect, it } from 'vitest'
import { alternarMissao, mudarCopos } from '../dominio/dia'
import { ROTINA_PADRAO } from '../dominio/rotina'
import { APARENCIA_PADRAO } from '../heroi/aparencia'
import { concluir, registrarSerie, sessaoNova } from '../dominio/treino'
import {
  apagarFoto, apagarMedida, apagarPesagem, banco, lerDias, lerFotos, lerMedidas, lerMesesComFoto, lerPerfil, lerPesagens, lerSessoes, mudarDia, mudarSessao,
  normalizarDia, normalizarPerfil, salvarFoto, salvarMedida, salvarPerfil, salvarPesagem, type Perfil,
} from './banco'

const PESSOA = { pesoInicial: 60, metaPeso: 70, altura: 175, idade: 30 }
const PERFIL: Perfil = { id: 'eu', aparencia: { pele: 'Morena', cabelo: 'Preto', uniforme: 'Grafite', corte: 'Curto' }, pessoa: PESSOA, rotina: ROTINA_PADRAO, diaUm: '2026-11-12', som: false, trocas: { '2026-11-16:jantar': 'jantar7', 's1:A': 'almoco2' }, comprados: ['arroz'] }

beforeEach(async () => {
  await banco.perfil.clear()
  await banco.dias.clear()
  await banco.sessoes.clear()
  await banco.pesagens.clear()
  await banco.medidas.clear()
  await banco.fotos.clear()
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

describe('sessões de treino', () => {
  const DATA = '2026-11-12'
  const nova = sessaoNova(DATA, 'choque-D', 1_800_000_000_000)

  it('grava série por série e lê de volta', async () => {
    await mudarSessao(DATA, nova, (s) => s)
    await mudarSessao(DATA, nova, (s) => registrarSerie(s, 'agachamento', 10))
    await mudarSessao(DATA, nova, (s) => concluir(registrarSerie(s, 'agachamento', 9), nova.inicio + 60_000))
    expect((await lerSessoes()).get(DATA)).toEqual({ data: DATA, treino: 'choque-D', inicio: nova.inicio, fim: nova.inicio + 60_000, series: [{ exercicio: 'agachamento', valor: 10 }, { exercicio: 'agachamento', valor: 9 }] })
  })

  it('toques simultâneos não perdem série', async () => {
    await Promise.all([8, 7, 6].map((valor) => mudarSessao(DATA, nova, (s) => registrarSerie(s, 'afundo', valor))))
    expect((await lerSessoes()).get(DATA)!.series.map((s) => s.valor).sort()).toEqual([6, 7, 8])
  })

  it('ignora registro corrompido sem derrubar a leitura', async () => {
    await banco.sessoes.put({ data: DATA, treino: 'choque-D', inicio: 'x', series: 'y' } as never)
    await banco.sessoes.put({ data: '2026-11-13', treino: 'choque-E', inicio: 5, fim: null, series: [{ exercicio: 'pike', valor: 4 }, { exercicio: 'nada', valor: 4 }] } as never)
    const lidas = await lerSessoes()
    expect([...lidas.keys()]).toEqual(['2026-11-13'])
    expect(lidas.get('2026-11-13')!.series).toEqual([{ exercicio: 'pike', valor: 4 }])
  })
})

describe('evolução no aparelho', () => {
  it('pesagem por data: gravar de novo na mesma data substitui, e apagar remove', async () => {
    await salvarPesagem({ data: '2026-11-20', kg: 56 })
    await salvarPesagem({ data: '2026-11-20', kg: 56.4 })
    await salvarPesagem({ data: '2026-11-27', kg: 57 })
    expect([...(await lerPesagens()).values()]).toEqual([{ data: '2026-11-20', kg: 56.4 }, { data: '2026-11-27', kg: 57 }])
    await apagarPesagem('2026-11-20')
    expect([...(await lerPesagens()).keys()]).toEqual(['2026-11-27'])
  })

  it('recusa gravar pesagem ou medida inválida', async () => {
    await expect(salvarPesagem({ data: '2026-11-20', kg: 900 })).rejects.toThrow()
    await expect(salvarMedida({ data: '2026-11-20' })).rejects.toThrow()
    expect((await lerPesagens()).size + (await lerMedidas()).size).toBe(0)
  })

  it('medida por data, editável e apagável', async () => {
    await salvarMedida({ data: '2026-11-20', braco: 27 })
    await salvarMedida({ data: '2026-11-20', braco: 27.5, peito: 86 })
    expect((await lerMedidas()).get('2026-11-20')).toEqual({ data: '2026-11-20', braco: 27.5, peito: 86 })
    await apagarMedida('2026-11-20')
    expect((await lerMedidas()).size).toBe(0)
  })

  it('foto por mês: lista os meses sem ler as imagens, e ignora registro corrompido', async () => {
    // o Blob do jsdom vira objeto vazio no banco de teste; o do Node sobrevive à cópia, como o do navegador
    const { Blob: BlobDoNode } = await import(/* @vite-ignore */ ['node', 'buffer'].join(':'))
    const imagem = new BlobDoNode(['x'], { type: 'image/jpeg' }) as Blob
    await salvarFoto({ mes: 2, data: '2026-12-15', imagem })
    await salvarFoto({ mes: 1, data: '2026-11-12', imagem })
    await banco.fotos.put({ mes: 3, data: 'x', imagem } as never)
    expect((await lerMesesComFoto()).sort()).toEqual([1, 2, 3])
    expect((await lerFotos()).map((f) => f.mes)).toEqual([1, 2])
    await apagarFoto(2)
    expect((await lerFotos()).map((f) => f.mes)).toEqual([1])
  })
})
