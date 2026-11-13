import { EXERCICIOS, FICHAS, type Ficha, type IdExercicio, type IdFicha, type Unidade } from '../conteudo/treinos'
import type { RegistroDia } from './dia'
import { dataValida, diaDaSemana, numeroDoDia } from './tempo'

/** Regras do treino. Funções puras: nada aqui lê relógio nem banco. */

export interface ItemTreino {
  exercicio: IdExercicio
  series: number
  alvo: [minimo: number, maximo: number]
  /** Descanso depois de cada série, em segundos. */
  descanso: number
}

export interface TreinoDoDia {
  /** Identifica o "treino igual" de uma semana para a outra, por exemplo 'choque-A'. */
  id: string
  ficha: IdFicha
  nomeFicha: string
  nota: string
  /** Semana dentro da ficha, a partir de 1. */
  semana: number
  semanasDaFicha: number
  nome: string
  foco: string
  itens: ItemTreino[]
}

export function fichaDoDia(numero: number): Ficha {
  return FICHAS.find((f) => numero <= f.ultimoDia) ?? FICHAS[FICHAS.length - 1]
}

/** Treino de uma data. Null no domingo (descanso) e antes do dia 1. */
export function treinoDaData(diaUm: string, data: string): TreinoDoDia | null {
  const numero = numeroDoDia(diaUm, data)
  const semanaDia = diaDaSemana(data)
  if (numero < 1 || semanaDia === 0) return null
  const ficha = fichaDoDia(numero)
  const anterior = FICHAS[FICHAS.indexOf(ficha) - 1]
  const primeiroDia = anterior ? anterior.ultimoDia + 1 : 1
  const semana = Math.floor((numero - primeiroDia) / 7) + 1
  const modelo = ficha.treinos[semanaDia - 1]
  return {
    id: `${ficha.id}-${modelo.letra}`,
    ficha: ficha.id,
    nomeFicha: ficha.nome,
    nota: ficha.nota,
    semana,
    semanasDaFicha: Math.ceil((ficha.ultimoDia - primeiroDia + 1) / 7),
    nome: modelo.nome,
    foco: modelo.foco,
    itens: modelo.itens.map((item) => {
      const [series, minimo, maximo] = item.niveis[Math.min(semana, item.niveis.length) - 1]
      return { exercicio: item.exercicio, series, alvo: [minimo, maximo], descanso: item.descanso }
    }),
  }
}

const SEGUNDOS_POR_SERIE = 40
const TROCA_DE_EXERCICIO = 20

/** Estimativa em minutos, contando execução, descansos e troca de exercício. */
export function duracaoEstimada(itens: ItemTreino[]): number {
  let segundos = 0
  for (const item of itens) {
    const { unidade, porLado } = EXERCICIOS[item.exercicio]
    const execucao = unidade === 'min' ? item.alvo[1] * 60 : unidade === 'seg' ? item.alvo[1] : SEGUNDOS_POR_SERIE
    segundos += item.series * (execucao * (porLado ? 2 : 1) + item.descanso) + TROCA_DE_EXERCICIO
  }
  return Math.round(segundos / 60)
}

const NOME_UNIDADE: Record<Unidade, [um: string, varios: string]> = { reps: ['repetição', 'repetições'], seg: ['segundo', 'segundos'], min: ['minuto', 'minutos'] }
const SIGLA: Record<Unidade, string> = { reps: 'rep', seg: 's', min: 'min' }

/** "8 a 12 repetições por lado", "30 segundos". */
export function textoAlvo(item: ItemTreino): string {
  const { unidade, porLado } = EXERCICIOS[item.exercicio]
  const [minimo, maximo] = item.alvo
  const faixa = minimo === maximo ? `${maximo}` : `${minimo} a ${maximo}`
  return `${faixa} ${NOME_UNIDADE[unidade][maximo === 1 ? 0 : 1]}${porLado ? ' por lado' : ''}`
}

/** "3 x 8 a 12 rep", para listas. */
export function textoCurto(item: ItemTreino): string {
  const [minimo, maximo] = item.alvo
  return `${item.series} x ${minimo === maximo ? maximo : `${minimo} a ${maximo}`} ${SIGLA[EXERCICIOS[item.exercicio].unidade]}`
}

export const siglaDe = (exercicio: IdExercicio): string => SIGLA[EXERCICIOS[exercicio].unidade]

/** "12 rep", "30 s", "20 min". */
export function textoValor(exercicio: IdExercicio, valor: number): string {
  return `${valor} ${SIGLA[EXERCICIOS[exercicio].unidade]}`
}

// ---------- sessão: o que foi feito em um dia ----------

export interface SerieFeita {
  exercicio: IdExercicio
  /** Repetições, segundos ou minutos, conforme a unidade do exercício. */
  valor: number
}

/** Único dado gravado do treino. Uma sessão por data; a ordem das séries é a ordem em que foram registradas. */
export interface Sessao {
  data: string
  treino: string
  /** Instantes em milissegundos. `fim` é null enquanto o treino está em andamento. */
  inicio: number
  fim: number | null
  series: SerieFeita[]
}

export const VALOR_MAXIMO = 999

export function sessaoNova(data: string, treino: string, agora: number): Sessao {
  return { data, treino, inicio: agora, fim: null, series: [] }
}

const instante = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0

/** Dado lido do banco passa por aqui. Devolve null quando não dá para aproveitar. */
export function normalizarSessao(dado: unknown): Sessao | null {
  const d = (dado ?? {}) as Partial<Record<keyof Sessao, unknown>>
  if (!dataValida(d.data) || typeof d.treino !== 'string' || !d.treino || !instante(d.inicio)) return null
  const series = (Array.isArray(d.series) ? d.series : []).flatMap((s: unknown): SerieFeita[] => {
    const { exercicio, valor } = (s ?? {}) as { exercicio?: unknown; valor?: unknown }
    if (typeof exercicio !== 'string' || !Object.hasOwn(EXERCICIOS, exercicio)) return []
    if (typeof valor !== 'number' || !Number.isInteger(valor) || valor < 1 || valor > VALOR_MAXIMO) return []
    return [{ exercicio: exercicio as IdExercicio, valor }]
  })
  const fim = instante(d.fim) && d.fim >= d.inicio && series.length > 0 ? d.fim : null
  return { data: d.data, treino: d.treino, inicio: d.inicio, fim, series }
}

export function registrarSerie(sessao: Sessao, exercicio: IdExercicio, valor: number): Sessao {
  const limitado = Math.max(1, Math.min(VALOR_MAXIMO, Math.round(valor)))
  return { ...sessao, series: [...sessao.series, { exercicio, valor: limitado }] }
}

/** Apaga a última série registrada do exercício. Sem série nenhuma, a sessão não pode ficar concluída. */
export function desfazerSerie(sessao: Sessao, exercicio: IdExercicio): Sessao {
  const ultima = sessao.series.map((s) => s.exercicio).lastIndexOf(exercicio)
  if (ultima < 0) return sessao
  const series = sessao.series.filter((_, n) => n !== ultima)
  return { ...sessao, series, fim: series.length ? sessao.fim : null }
}

export function concluir(sessao: Sessao, agora: number): Sessao {
  return sessao.series.length ? { ...sessao, fim: Math.max(agora, sessao.inicio) } : sessao
}

export function reabrir(sessao: Sessao): Sessao {
  return { ...sessao, fim: null }
}

export function seriesDe(sessao: Sessao | undefined, exercicio: IdExercicio): number[] {
  return sessao ? sessao.series.filter((s) => s.exercicio === exercicio).map((s) => s.valor) : []
}

/** Índice do primeiro exercício com série faltando; null quando a ficha do dia foi toda cumprida. */
export function proximoItem(itens: ItemTreino[], sessao: Sessao | undefined): number | null {
  const n = itens.findIndex((item) => seriesDe(sessao, item.exercicio).length < item.series)
  return n < 0 ? null : n
}

/**
 * O treino conta como feito quando tem série registrada e foi concluído.
 * Treino de dia que já passou conta mesmo sem o toque em "concluir": quem fechou o app no fim da última série não perde o dia.
 */
export function treinoFeito(sessao: Sessao | undefined, hoje?: string): boolean {
  if (!sessao || sessao.series.length === 0) return false
  return sessao.fim !== null || (hoje !== undefined && sessao.data < hoje)
}

/**
 * Registros dos dias com a missão `treino` derivada das sessões.
 * Dia em que a missão foi marcada à mão (antes de existir a tela de treino) continua valendo.
 */
export function diasComTreino(dias: Map<string, RegistroDia>, sessoes: Map<string, Sessao>, hoje?: string): Map<string, RegistroDia> {
  const resultado = new Map(dias)
  for (const [data, sessao] of sessoes) {
    if (!treinoFeito(sessao, hoje)) continue
    const registro = resultado.get(data) ?? { data, feitas: [], copos: 0 }
    if (!registro.feitas.includes('treino')) resultado.set(data, { ...registro, feitas: [...registro.feitas, 'treino'] })
  }
  return resultado
}

export interface Referencia {
  data: string
  valores: number[]
}

/**
 * O que foi feito da última vez neste exercício, antes da data dada.
 * Prefere a última sessão do mesmo treino; sem ela, a última em que o exercício apareceu.
 */
export function ultimaVez(sessoes: Map<string, Sessao>, exercicio: IdExercicio, antesDe: string, treino: string): Referencia | null {
  let igual: Referencia | null = null, qualquer: Referencia | null = null
  for (const sessao of sessoes.values()) {
    if (sessao.data >= antesDe) continue
    const valores = seriesDe(sessao, exercicio)
    if (!valores.length) continue
    if (sessao.treino === treino && (!igual || sessao.data > igual.data)) igual = { data: sessao.data, valores }
    if (!qualquer || sessao.data > qualquer.data) qualquer = { data: sessao.data, valores }
  }
  return igual ?? qualquer
}

export interface Recorde {
  valor: number
  data: string
}

/** Melhor série de cada exercício. `antesDe` deixa de fora as sessões daquela data em diante. */
export function recordes(sessoes: Map<string, Sessao>, antesDe?: string): Map<IdExercicio, Recorde> {
  const melhor = new Map<IdExercicio, Recorde>()
  const emOrdem = [...sessoes.values()].sort((a, b) => a.data.localeCompare(b.data))
  for (const sessao of emOrdem) {
    if (antesDe && sessao.data >= antesDe) continue
    for (const { exercicio, valor } of sessao.series) {
      if (valor > (melhor.get(exercicio)?.valor ?? 0)) melhor.set(exercicio, { valor, data: sessao.data })
    }
  }
  return melhor
}

/** Exercícios em que a sessão superou o recorde que existia antes dela. Primeira vez não é recorde. */
export function recordesBatidos(sessoes: Map<string, Sessao>, sessao: Sessao): IdExercicio[] {
  const antes = recordes(sessoes, sessao.data)
  const batidos = new Set<IdExercicio>()
  for (const { exercicio, valor } of sessao.series) {
    const anterior = antes.get(exercicio)
    if (anterior && valor > anterior.valor) batidos.add(exercicio)
  }
  return [...batidos]
}

export interface ResumoSessao {
  series: number
  seriesPrevistas: number
  repeticoes: number
  /** Minutos do início ao fim; null com o treino em andamento. */
  minutos: number | null
}

export function resumoDaSessao(sessao: Sessao, itens: ItemTreino[]): ResumoSessao {
  return {
    series: sessao.series.length,
    seriesPrevistas: itens.reduce((s, item) => s + item.series, 0),
    repeticoes: sessao.series.filter((s) => EXERCICIOS[s.exercicio].unidade === 'reps').reduce((s, x) => s + x.valor, 0),
    minutos: sessao.fim === null ? null : Math.max(1, Math.round((sessao.fim - sessao.inicio) / 60_000)),
  }
}

/** Valor que a tela sugere para a próxima série: o da última vez, ou o piso do alvo. */
export function sugestao(item: ItemTreino, numeroDaSerie: number, anterior: Referencia | null): number {
  const daUltimaVez = anterior?.valores[Math.min(numeroDaSerie, anterior.valores.length) - 1]
  return daUltimaVez ?? item.alvo[0]
}

// ---------- cronômetro: sempre pelo instante final, nunca contando tiques ----------

export const AJUSTE_DESCANSO = 15

/** Segundos que faltam até `fim`, arredondados para cima. Zero quando já passou. */
export function segundosRestantes(fim: number, agora: number): number {
  return Math.max(0, Math.ceil((fim - agora) / 1000))
}

export function segundosDecorridos(inicio: number, agora: number): number {
  return Math.max(0, Math.floor((agora - inicio) / 1000))
}

/** "1:05". */
export function relogio(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Novo instante final depois de somar ou tirar segundos; nunca fica no passado. */
export function ajustarFim(fim: number, deltaSegundos: number, agora: number): number {
  return Math.max(agora, fim + deltaSegundos * 1000)
}
