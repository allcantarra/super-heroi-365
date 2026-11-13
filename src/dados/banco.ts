import Dexie, { type Table } from 'dexie'
import { ALIMENTOS } from '../conteudo/alimentos'
import { normalizarTrocas, type Trocas } from '../dominio/cardapio'
import { META_COPOS, registroVazio, type RegistroDia } from '../dominio/dia'
import { normalizarRotina, type IdMissao, type Rotina } from '../dominio/rotina'
import { dataValida } from '../dominio/tempo'
import { normalizarFoto, normalizarMedida, normalizarPesagem, type Foto, type Medida, type Pesagem } from '../dominio/evolucao'
import { normalizarSessao, type Sessao } from '../dominio/treino'
import { normalizarAparencia, type Aparencia } from '../heroi/aparencia'

export interface Pessoa {
  pesoInicial: number
  metaPeso: number
  altura: number
  idade: number
}

/** Registro único com tudo que é do usuário. Fica só no aparelho. */
export interface Perfil {
  id: 'eu'
  aparencia: Aparencia
  pessoa: Pessoa | null
  rotina: Rotina
  /** Data do dia 1; null enquanto a primeira abertura não foi concluída. */
  diaUm: string | null
  som: boolean
  /** Pratos que o usuário trocou no cardápio, por dia da semana e refeição. */
  trocas: Trocas
  /** Itens já marcados na lista de compras. */
  comprados: string[]
}

class Banco extends Dexie {
  perfil!: Table<Perfil, 'eu'>
  dias!: Table<RegistroDia, string>
  sessoes!: Table<Sessao, string>
  pesagens!: Table<Pesagem, string>
  medidas!: Table<Medida, string>
  fotos!: Table<Foto, number>

  constructor() {
    super('super-heroi-365')
    // Cada etapa acrescenta coleções com uma nova versão; nunca edite uma versão já publicada.
    this.version(1).stores({ perfil: 'id' })
    this.version(2).stores({ perfil: 'id', dias: 'data' })
    this.version(3).stores({ perfil: 'id', dias: 'data', sessoes: 'data' })
    this.version(4).stores({ perfil: 'id', dias: 'data', sessoes: 'data', pesagens: 'data', medidas: 'data', fotos: 'mes' })
  }
}

export const banco = new Banco()

const IDS: IdMissao[] = ['pre', 'treino', 'cafe', 'lancheManha', 'almoco', 'lancheTarde', 'trajeto', 'jantar', 'ceia']

const numeroEntre = (v: unknown, min: number, max: number): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : null

export const LIMITES = { peso: [30, 200], altura: [120, 220], idade: [14, 90] } as const

export function normalizarPessoa(dado: unknown): Pessoa | null {
  const d = (dado ?? {}) as Partial<Record<keyof Pessoa, unknown>>
  const pesoInicial = numeroEntre(d.pesoInicial, ...LIMITES.peso)
  const metaPeso = numeroEntre(d.metaPeso, ...LIMITES.peso)
  const altura = numeroEntre(d.altura, ...LIMITES.altura)
  const idade = numeroEntre(d.idade, ...LIMITES.idade)
  if (pesoInicial === null || metaPeso === null || altura === null || idade === null) return null
  return { pesoInicial, metaPeso, altura, idade }
}

/** Dado gravado pode estar incompleto (versão antiga) ou corrompido: sempre passa por aqui. */
export function normalizarPerfil(dado: unknown): Perfil {
  const d = (dado ?? {}) as Partial<Record<keyof Perfil, unknown>>
  const pessoa = normalizarPessoa(d.pessoa)
  const diaUm = dataValida(d.diaUm) ? d.diaUm : null
  return {
    id: 'eu',
    aparencia: normalizarAparencia(d.aparencia),
    pessoa,
    rotina: normalizarRotina(d.rotina),
    diaUm: pessoa ? diaUm : null,
    som: d.som !== false,
    trocas: normalizarTrocas(d.trocas),
    comprados: Array.isArray(d.comprados) ? [...new Set(d.comprados.filter((x): x is string => typeof x === 'string' && Object.hasOwn(ALIMENTOS, x)))] : [],
  }
}

export function normalizarDia(dado: unknown, data: string): RegistroDia {
  const d = (dado ?? {}) as Partial<Record<keyof RegistroDia, unknown>>
  const feitas = Array.isArray(d.feitas) ? IDS.filter((id) => (d.feitas as unknown[]).includes(id)) : []
  return { data, feitas, copos: numeroEntre(d.copos, 0, META_COPOS) === null ? 0 : Math.floor(d.copos as number) }
}

export async function lerPerfil(): Promise<Perfil> {
  return normalizarPerfil(await banco.perfil.get('eu'))
}

export async function salvarPerfil(perfil: Perfil): Promise<void> {
  await banco.perfil.put(normalizarPerfil(perfil))
  void pedirArmazenamentoPersistente()
}

export async function lerDias(): Promise<Map<string, RegistroDia>> {
  const todos = await banco.dias.toArray()
  return new Map(todos.filter((r) => dataValida(r?.data)).map((r) => [r.data, normalizarDia(r, r.data)]))
}

/** Aplica uma mudança ao registro de um dia, dentro de uma transação, para toques rápidos não se atropelarem. */
export async function mudarDia(data: string, mudanca: (r: RegistroDia) => RegistroDia): Promise<void> {
  await banco.transaction('rw', banco.dias, async () => {
    const atual = normalizarDia(await banco.dias.get(data), data)
    await banco.dias.put(normalizarDia(mudanca(atual), data))
  })
}

export async function lerSessoes(): Promise<Map<string, Sessao>> {
  const todas = (await banco.sessoes.toArray()).flatMap((r) => normalizarSessao(r) ?? [])
  return new Map(todas.map((s) => [s.data, s]))
}

/**
 * Aplica uma mudança à sessão de treino de um dia, dentro de uma transação.
 * `nova` é usada quando ainda não há sessão na data. Sessão que fica sem série e em aberto continua gravada: é o treino em andamento.
 */
export async function mudarSessao(data: string, nova: Sessao, mudanca: (s: Sessao) => Sessao): Promise<void> {
  await banco.transaction('rw', banco.sessoes, async () => {
    const atual = normalizarSessao(await banco.sessoes.get(data)) ?? nova
    const depois = normalizarSessao({ ...mudanca(atual), data })
    if (depois) await banco.sessoes.put(depois)
  })
}

export { registroVazio }

/** Pede ao navegador para não apagar os dados sob pressão de espaço. Devolve false se não for concedido. */
// ---------------- evolução ----------------

export async function lerPesagens(): Promise<Map<string, Pesagem>> {
  const lidas = (await banco.pesagens.toArray()).map(normalizarPesagem).filter((p): p is Pesagem => p !== null)
  return new Map(lidas.map((p) => [p.data, p]))
}

export async function lerMedidas(): Promise<Map<string, Medida>> {
  const lidas = (await banco.medidas.toArray()).map(normalizarMedida).filter((m): m is Medida => m !== null)
  return new Map(lidas.map((m) => [m.data, m]))
}

/** Só os meses que têm foto, sem ler as imagens: é o que o jogo precisa para o XP. */
export async function lerMesesComFoto(): Promise<number[]> {
  return (await banco.fotos.toCollection().primaryKeys()).filter((m): m is number => typeof m === 'number' && Number.isInteger(m) && m >= 1 && m <= 13)
}

export async function lerFotos(): Promise<Foto[]> {
  return (await banco.fotos.toArray()).map(normalizarFoto).filter((f): f is Foto => f !== null).sort((a, b) => a.mes - b.mes)
}

export async function salvarPesagem(p: Pesagem): Promise<void> {
  const valida = normalizarPesagem(p)
  if (!valida) throw new Error('Pesagem inválida')
  await banco.pesagens.put(valida)
  void pedirArmazenamentoPersistente()
}

export const apagarPesagem = (data: string) => banco.pesagens.delete(data)

export async function salvarMedida(m: Medida): Promise<void> {
  const valida = normalizarMedida(m)
  if (!valida) throw new Error('Medida inválida')
  await banco.medidas.put(valida)
  void pedirArmazenamentoPersistente()
}

export const apagarMedida = (data: string) => banco.medidas.delete(data)

export async function salvarFoto(f: Foto): Promise<void> {
  const valida = normalizarFoto(f)
  if (!valida) throw new Error('Foto inválida')
  await banco.fotos.put(valida)
  void pedirArmazenamentoPersistente()
}

export const apagarFoto = (mes: number) => banco.fotos.delete(mes)

export async function pedirArmazenamentoPersistente(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false
    return (await navigator.storage.persisted()) || (await navigator.storage.persist())
  } catch {
    return false
  }
}
