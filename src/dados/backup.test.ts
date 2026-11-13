import { beforeEach, describe, expect, it } from 'vitest'
import { ROTINA_PADRAO } from '../dominio/rotina'
import { APARENCIA_PADRAO } from '../heroi/aparencia'
import { banco, lerDias, lerMedidas, lerMesesComFoto, lerPerfil, lerPesagens, lerSessoes, salvarFoto, salvarMedida, salvarPerfil, salvarPesagem, type Perfil } from './banco'
import { APP, ErroDeBackup, lerArquivoDeBackup, montarBackup, nomeDoArquivo, restaurar, resumoDoAparelho } from './backup'

const PERFIL: Perfil = { id: 'eu', aparencia: APARENCIA_PADRAO, pessoa: { pesoInicial: 60.5, metaPeso: 70, altura: 175, idade: 30 }, rotina: ROTINA_PADRAO, diaUm: '2026-11-09', som: true, trocas: {}, comprados: [] }

/** Blob do Node: o do jsdom vira objeto vazio no banco de teste e não tem arrayBuffer. */
async function imagem(conteudo: string): Promise<Blob> {
  const { Blob: BlobDoNode } = await import(/* @vite-ignore */ ['node', 'buffer'].join(':'))
  return new BlobDoNode([conteudo], { type: 'image/jpeg' }) as Blob
}

async function preencher() {
  await salvarPerfil(PERFIL)
  await banco.dias.put({ data: '2026-11-09', feitas: ['pre', 'cafe'], copos: 5 })
  await banco.sessoes.put({ data: '2026-11-09', treino: 'choque-A', inicio: 1, fim: 2, series: [{ exercicio: 'flexao', valor: 8 }] })
  await salvarPesagem({ data: '2026-11-16', kg: 61 })
  await salvarMedida({ data: '2026-11-16', braco: 30 })
  await salvarFoto({ mes: 1, data: '2026-11-09', imagem: await imagem('foto do mês 1') })
}

async function limpar() {
  await Promise.all([banco.perfil.clear(), banco.dias.clear(), banco.sessoes.clear(), banco.pesagens.clear(), banco.medidas.clear(), banco.fotos.clear()])
}

beforeEach(limpar)

describe('backup', () => {
  it('ida e volta: exportar, apagar tudo e restaurar devolve os mesmos dados, foto inclusive', async () => {
    await preencher()
    const texto = JSON.stringify(await montarBackup(new Date(2026, 10, 20)))
    await limpar()
    expect(await resumoDoAparelho()).toEqual({ dias: 0, treinos: 0, pesagens: 0, medidas: 0, fotos: 0 })
    const conteudo = lerArquivoDeBackup(texto)
    expect(conteudo.descartados).toBe(0)
    expect(conteudo.fotos.map((f) => [f.mes, f.imagem.type, f.imagem.size])).toEqual([[1, 'image/jpeg', 'foto do mês 1'.length + 1]])
    await restaurar(conteudo)
    expect(await lerPerfil()).toEqual(PERFIL)
    expect((await lerDias()).get('2026-11-09')).toEqual({ data: '2026-11-09', feitas: ['pre', 'cafe'], copos: 5 })
    expect((await lerSessoes()).get('2026-11-09')?.series).toEqual([{ exercicio: 'flexao', valor: 8 }])
    expect((await lerPesagens()).get('2026-11-16')?.kg).toBe(61)
    expect((await lerMedidas()).get('2026-11-16')?.braco).toBe(30)
    // o Blob criado na restauração é o do jsdom, que o banco de teste não guarda; no navegador ele é guardado inteiro
    expect(await lerMesesComFoto()).toEqual([1])
  })

  it('restaurar substitui: o que estava no aparelho e não está no backup some', async () => {
    await preencher()
    const texto = JSON.stringify(await montarBackup(new Date()))
    await salvarPesagem({ data: '2026-11-23', kg: 62 })
    await restaurar(lerArquivoDeBackup(texto))
    expect([...(await lerPesagens()).keys()]).toEqual(['2026-11-16'])
  })

  it('recusa arquivo que não é JSON, de outro app, de versão mais nova ou sem cadastro', () => {
    expect(() => lerArquivoDeBackup('olá')).toThrow(ErroDeBackup)
    expect(() => lerArquivoDeBackup(JSON.stringify({ app: 'outro' }))).toThrow(/não é um backup do Super-Herói 365/)
    expect(() => lerArquivoDeBackup(JSON.stringify({ app: APP, versao: 99 }))).toThrow(/versão mais nova/)
    expect(() => lerArquivoDeBackup(JSON.stringify({ app: APP, versao: 1, perfil: { id: 'eu' } }))).toThrow(/cadastro completo/)
  })

  it('descarta registro inválido e conta quantos ficaram de fora, sem recusar o arquivo inteiro', () => {
    const arquivo = {
      app: APP, versao: 1, exportadoEm: 'x', perfil: PERFIL,
      dias: [{ data: '2026-11-09', feitas: ['cafe'], copos: 2 }, { data: 'ontem' }],
      sessoes: [{ data: '2026-11-09', treino: 'x', inicio: 'a' }],
      pesagens: [{ data: '2026-11-16', kg: 61 }, { data: '2026-11-17', kg: 9000 }],
      medidas: [],
      fotos: [{ mes: 1, data: '2026-11-09', tipo: 'image/svg+xml', base64: btoa('<svg onload="alert(1)"/>') }, { mes: 2, data: '2026-12-09', tipo: 'image/jpeg', base64: '%%%' }],
    }
    const c = lerArquivoDeBackup(JSON.stringify(arquivo))
    expect(c.dias).toHaveLength(1)
    expect(c.pesagens).toHaveLength(1)
    expect(c.sessoes).toHaveLength(0)
    expect(c.fotos).toHaveLength(0)
    // 1 dia sem data, 1 sessão quebrada, 1 peso impossível, 1 SVG (tipo não aceito) e 1 base64 inválido
    expect(c.descartados).toBe(5)
  })

  it('o nome do arquivo leva a data, sem dado pessoal', () => {
    expect(nomeDoArquivo(new Date(2026, 10, 9))).toBe('super-heroi-365-backup-2026-11-09.json')
  })
})
