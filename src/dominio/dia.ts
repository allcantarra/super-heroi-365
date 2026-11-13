import { missoesDoDia, type IdMissao, type Missao, type Rotina } from './rotina'
import { minutos, somarDias } from './tempo'

/** O que o usuário marcou em um dia. É o único dado gravado; todo o resto é calculado daqui. */
export interface RegistroDia {
  data: string
  feitas: IdMissao[]
  copos: number
  /** Hora (HH:MM) do primeiro toque do dia; o dia se ajusta a ela. Ausente nos registros da versão 1. */
  inicio?: string
}

export const META_COPOS = 12
export const ML_POR_COPO = 250
export const XP_COPO = 10
export const XP_DIA_VENCIDO = 80
/** Para vencer o dia: 3/4 das refeições que existem naquele dia, arredondado para cima (6 de 8, 6 de 7). */
export const PARTE_DAS_REFEICOES = 0.75
export const DIAS_POR_ESCUDO = 7
export const MAXIMO_DE_ESCUDOS = 2
export const HORA_CORTE_CAFEINA = 15

export const registroVazio = (data: string): RegistroDia => ({ data, feitas: [], copos: 0 })

export interface ResumoDia {
  refeicoesFeitas: number
  refeicoesTotal: number
  temTreino: boolean
  treinoFeito: boolean
  copos: number
  vencido: boolean
  completo: boolean
  xp: number
}

export function resumoDoDia(registro: RegistroDia, missoes: Missao[]): ResumoDia {
  const feitas = new Set(registro.feitas)
  const refeicoes = missoes.filter((m) => m.tipo === 'refeicao')
  const treino = missoes.find((m) => m.tipo === 'treino')
  const refeicoesFeitas = refeicoes.filter((m) => feitas.has(m.id)).length
  const treinoFeito = !!treino && feitas.has(treino.id)
  const copos = Math.max(0, Math.min(META_COPOS, Math.floor(registro.copos)))
  const vencido = refeicoesFeitas >= Math.ceil(refeicoes.length * PARTE_DAS_REFEICOES) && (!treino || treinoFeito)
  const xpMissoes = missoes.filter((m) => feitas.has(m.id)).reduce((s, m) => s + m.xp, 0)
  return {
    refeicoesFeitas,
    refeicoesTotal: refeicoes.length,
    temTreino: !!treino,
    treinoFeito,
    copos,
    vencido,
    completo: missoes.every((m) => feitas.has(m.id)),
    xp: xpMissoes + copos * XP_COPO + (vencido ? XP_DIA_VENCIDO : 0),
  }
}

/**
 * Primeira missão pendente na ordem do dia; null quando tudo foi feito.
 * O treino não se marca com um toque: passada a hora da missão que vem depois dele, cede a vez às refeições
 * e continua na lista. Só volta a ser a missão de agora quando não sobrar refeição pendente.
 */
export function missaoDeAgora(registro: RegistroDia, missoes: Missao[], hora?: string): Missao | null {
  const pendentes = missoes.filter((m) => !registro.feitas.includes(m.id))
  const depoisDoTreino = missoes[missoes.findIndex((m) => m.tipo === 'treino') + 1]
  if (pendentes[0]?.tipo === 'treino' && pendentes[1] && hora && depoisDoTreino && minutos(hora) >= minutos(depoisDoTreino.hora)) return pendentes[1]
  return pendentes[0] ?? null
}

/**
 * Marca ou desmarca uma missão. O primeiro toque do dia guarda a hora (`hora`), que ajusta os horários.
 * Desmarcar tudo apaga a hora de início: o dia volta à rotina normal.
 */
export function alternarMissao(registro: RegistroDia, id: IdMissao, hora?: string): RegistroDia {
  const marcando = !registro.feitas.includes(id)
  const feitas = marcando ? [...registro.feitas, id] : registro.feitas.filter((x) => x !== id)
  const { inicio: _inicio, ...semInicio } = registro
  if (feitas.length === 0) return { ...semInicio, feitas }
  if (marcando && !registro.inicio && registro.feitas.length === 0 && hora) return { ...registro, feitas, inicio: hora }
  return { ...registro, feitas }
}

/** Corrige a hora em que o dia começou, ou volta aos horários normais (`hora` igual à de acordar da rotina). */
export function definirInicio(registro: RegistroDia, hora: string): RegistroDia {
  return { ...registro, inicio: hora }
}

export function mudarCopos(registro: RegistroDia, delta: number): RegistroDia {
  return { ...registro, copos: Math.max(0, Math.min(META_COPOS, registro.copos + delta)) }
}

export function cafeinaLiberada(agora: Date): boolean {
  return agora.getHours() < HORA_CORTE_CAFEINA
}

export interface Jornada {
  xpTotal: number
  sequencia: number
  escudos: number
  diasVencidos: number
}

/**
 * Percorre do dia 1 até hoje e devolve XP total, sequência e escudos.
 * Dia passado não vencido gasta um escudo (a sequência fica como está) ou, sem escudo, zera a sequência.
 * Hoje ainda não vencido não quebra nada.
 */
export function jornada(diaUm: string, hoje: string, rotina: Rotina, registros: Map<string, RegistroDia>): Jornada {
  let xpTotal = 0, sequencia = 0, escudos = 0, diasVencidos = 0
  for (let data = diaUm; data <= hoje; data = somarDias(data, 1)) {
    const registro = registros.get(data) ?? registroVazio(data)
    const resumo = resumoDoDia(registro, missoesDoDia(rotina, data, registro))
    xpTotal += resumo.xp
    if (resumo.vencido) {
      sequencia++
      diasVencidos++
      if (sequencia % DIAS_POR_ESCUDO === 0) escudos = Math.min(MAXIMO_DE_ESCUDOS, escudos + 1)
    } else if (data !== hoje) {
      if (escudos > 0) escudos--
      else sequencia = 0
    }
  }
  return { xpTotal, sequencia, escudos, diasVencidos }
}
