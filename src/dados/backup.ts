/**
 * Backup em arquivo: tudo que o app guarda no aparelho, inclusive as fotos (em base64), num único JSON.
 * O arquivo é dado de fora na hora de restaurar: cada registro passa pelas mesmas normalizações da leitura do banco,
 * e o que não for válido é descartado e contado. Nada é gravado antes de o arquivo inteiro ser validado.
 */
import type { RegistroDia } from '../dominio/dia'
import { normalizarFoto, normalizarMedida, normalizarPesagem, type Foto, type Medida, type Pesagem } from '../dominio/evolucao'
import { dataValida } from '../dominio/tempo'
import { normalizarSessao, type Sessao } from '../dominio/treino'
import { banco, normalizarDia, normalizarPerfil, type Perfil } from './banco'

export const APP = 'super-heroi-365'
export const VERSAO_DO_BACKUP = 1
/** Um ano de fotos reduzidas cabe com folga; acima disso o arquivo não é deste app. */
export const TAMANHO_MAXIMO = 60 * 1024 * 1024

interface FotoNoArquivo {
  mes: number
  data: string
  tipo: string
  base64: string
}

export interface ArquivoDeBackup {
  app: typeof APP
  versao: number
  exportadoEm: string
  perfil: Perfil
  dias: RegistroDia[]
  sessoes: Sessao[]
  pesagens: Pesagem[]
  medidas: Medida[]
  fotos: FotoNoArquivo[]
}

export interface ConteudoRestauravel {
  perfil: Perfil
  dias: RegistroDia[]
  sessoes: Sessao[]
  pesagens: Pesagem[]
  medidas: Medida[]
  fotos: Foto[]
  /** Registros do arquivo que não passaram na validação e ficaram de fora. */
  descartados: number
}

export class ErroDeBackup extends Error {}

async function paraBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binario = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binario)
}

function deBase64(texto: string, tipo: string): Blob {
  const binario = atob(texto)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return new Blob([bytes], { type: tipo })
}

/** Lê tudo do banco e monta o arquivo. */
export async function montarBackup(agora: Date): Promise<ArquivoDeBackup> {
  const [perfil, dias, sessoes, pesagens, medidas, fotos] = await Promise.all([
    banco.perfil.get('eu'), banco.dias.toArray(), banco.sessoes.toArray(), banco.pesagens.toArray(), banco.medidas.toArray(), banco.fotos.toArray(),
  ])
  const fotosValidas = fotos.map(normalizarFoto).filter((f): f is Foto => f !== null)
  return {
    app: APP,
    versao: VERSAO_DO_BACKUP,
    exportadoEm: agora.toISOString(),
    perfil: normalizarPerfil(perfil),
    dias: dias.filter((d) => dataValida(d?.data)).map((d) => normalizarDia(d, d.data)),
    sessoes: sessoes.map(normalizarSessao).filter((s): s is Sessao => s !== null),
    pesagens: pesagens.map(normalizarPesagem).filter((p): p is Pesagem => p !== null),
    medidas: medidas.map(normalizarMedida).filter((m): m is Medida => m !== null),
    fotos: await Promise.all(fotosValidas.map(async (f) => ({ mes: f.mes, data: f.data, tipo: f.imagem.type, base64: await paraBase64(f.imagem) }))),
  }
}

export function nomeDoArquivo(agora: Date): string {
  const d = (n: number) => String(n).padStart(2, '0')
  return `super-heroi-365-backup-${agora.getFullYear()}-${d(agora.getMonth() + 1)}-${d(agora.getDate())}.json`
}

const lista = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])

/** Valida o texto de um arquivo de backup. Lança ErroDeBackup com mensagem pronta para a tela. */
export function lerArquivoDeBackup(texto: string): ConteudoRestauravel {
  if (texto.length > TAMANHO_MAXIMO * 1.4) throw new ErroDeBackup('Arquivo grande demais para ser um backup deste app.')
  let bruto: unknown
  try {
    bruto = JSON.parse(texto)
  } catch {
    throw new ErroDeBackup('Esse arquivo não é um backup válido (não abriu como JSON).')
  }
  const d = (bruto ?? {}) as Record<string, unknown>
  if (d.app !== APP) throw new ErroDeBackup('Esse arquivo não é um backup do Super-Herói 365.')
  if (typeof d.versao !== 'number' || d.versao > VERSAO_DO_BACKUP) throw new ErroDeBackup('Esse backup foi feito por uma versão mais nova do app. Atualize o app e tente de novo.')
  const perfil = normalizarPerfil(d.perfil)
  if (!perfil.diaUm || !perfil.pessoa) throw new ErroDeBackup('O backup não tem o cadastro completo e não pode ser restaurado.')

  let descartados = 0
  const filtrar = <T>(itens: unknown[], normalizar: (x: unknown) => T | null): T[] => {
    const ok: T[] = []
    for (const x of itens) {
      const n = normalizar(x)
      if (n === null) descartados++
      else ok.push(n)
    }
    return ok
  }
  const dias = filtrar(lista(d.dias), (x) => {
    const r = (x ?? {}) as { data?: unknown }
    return dataValida(r.data) ? normalizarDia(x, r.data) : null
  })
  const fotos = filtrar(lista(d.fotos), (x) => {
    const f = (x ?? {}) as Partial<FotoNoArquivo>
    if (typeof f.base64 !== 'string' || typeof f.tipo !== 'string' || !/^image\/(jpeg|png|webp)$/.test(f.tipo)) return null
    try {
      return normalizarFoto({ mes: f.mes, data: f.data, imagem: deBase64(f.base64, f.tipo) })
    } catch {
      return null
    }
  })
  return {
    perfil,
    dias,
    sessoes: filtrar(lista(d.sessoes), normalizarSessao),
    pesagens: filtrar(lista(d.pesagens), normalizarPesagem),
    medidas: filtrar(lista(d.medidas), normalizarMedida),
    fotos,
    descartados,
  }
}

/** Substitui tudo que está no aparelho pelo conteúdo do backup, numa transação só: ou grava tudo, ou nada. */
export async function restaurar(c: ConteudoRestauravel): Promise<void> {
  await banco.transaction('rw', [banco.perfil, banco.dias, banco.sessoes, banco.pesagens, banco.medidas, banco.fotos], async () => {
    await Promise.all([banco.perfil.clear(), banco.dias.clear(), banco.sessoes.clear(), banco.pesagens.clear(), banco.medidas.clear(), banco.fotos.clear()])
    await banco.perfil.put(c.perfil)
    await banco.dias.bulkPut(c.dias)
    await banco.sessoes.bulkPut(c.sessoes)
    await banco.pesagens.bulkPut(c.pesagens)
    await banco.medidas.bulkPut(c.medidas)
    await banco.fotos.bulkPut(c.fotos)
  })
}

/** Conta o que há no aparelho, para mostrar antes de exportar ou de substituir. */
export async function resumoDoAparelho(): Promise<{ dias: number; treinos: number; pesagens: number; medidas: number; fotos: number }> {
  const [dias, treinos, pesagens, medidas, fotos] = await Promise.all([banco.dias.count(), banco.sessoes.count(), banco.pesagens.count(), banco.medidas.count(), banco.fotos.count()])
  return { dias, treinos, pesagens, medidas, fotos }
}
