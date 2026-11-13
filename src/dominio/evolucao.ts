/**
 * Evolução: pesagens, medidas, fotos e atributos do herói. Funções puras; o banco só guarda os registros.
 */
import { EXERCICIOS, type IdExercicio } from '../conteudo/treinos'
import { semanaDe } from './cardapio'
import { resumoDoDia, type RegistroDia } from './dia'
import { missoesDoDia, type Rotina } from './rotina'
import { dataValida, diasEntre, faseDoDia, numeroDoDia, somarDias, type Fase } from './tempo'
import type { Sessao } from './treino'

// ---------------- pesagens ----------------

export interface Pesagem {
  data: string
  kg: number
}

export const PESO_MINIMO = 30
export const PESO_MAXIMO = 200

/** Peso com uma casa decimal, dentro da faixa; null se não for um peso possível. */
export function pesoValido(valor: unknown): number | null {
  const n = typeof valor === 'string' ? Number(valor.trim().replace(',', '.')) : valor
  if (typeof n !== 'number' || !Number.isFinite(n) || n < PESO_MINIMO || n > PESO_MAXIMO) return null
  return Math.round(n * 10) / 10
}

export function normalizarPesagem(dado: unknown): Pesagem | null {
  const d = (dado ?? {}) as Partial<Record<keyof Pesagem, unknown>>
  // gravado é sempre número; texto só vem do formulário, que passa por pesoValido antes
  const kg = typeof d.kg === 'number' ? pesoValido(d.kg) : null
  return dataValida(d.data) && kg !== null ? { data: d.data, kg } : null
}

/**
 * Série de pesos em ordem de data. O peso do cadastro entra como ponto do dia 1, a não ser que haja pesagem nesse dia.
 * Pesagens de antes do dia 1 ficam de fora.
 */
export function serieDePeso(diaUm: string, pesoInicial: number, pesagens: Iterable<Pesagem>): Pesagem[] {
  const porData = new Map<string, number>([[diaUm, pesoInicial]])
  for (const p of pesagens) if (p.data >= diaUm) porData.set(p.data, p.kg)
  return [...porData].map(([data, kg]) => ({ data, kg })).sort((a, b) => a.data.localeCompare(b.data))
}

/** Quanto a tendência anda em direção a cada nova pesagem, por dia de intervalo. */
export const SUAVIZACAO_DIARIA = 0.1

export interface PontoDeTendencia extends Pesagem {
  tendencia: number
}

/**
 * Média móvel exponencial do peso: tira o sobe e desce de água e intestino e mostra a direção real.
 * Com pesagens espaçadas, o peso de cada dia de intervalo conta (1 - 0,9 elevado ao número de dias).
 */
export function tendencia(serie: Pesagem[]): PontoDeTendencia[] {
  const saida: PontoDeTendencia[] = []
  for (const p of serie) {
    const anterior = saida[saida.length - 1]
    if (!anterior) {
      saida.push({ ...p, tendencia: p.kg })
      continue
    }
    const dias = Math.max(1, diasEntre(anterior.data, p.data))
    const peso = 1 - Math.pow(1 - SUAVIZACAO_DIARIA, dias)
    saida.push({ ...p, tendencia: anterior.tendencia + peso * (p.kg - anterior.tendencia) })
  }
  return saida
}

/** Ganho (ou perda, negativo) esperado por semana em cada fase, em kg. É estimativa, não regra. */
export const RITMO_ESPERADO: Record<Fase, readonly [number, number]> = {
  1: [0.3, 0.75],
  2: [0.15, 0.3],
  3: [0.1, 0.25],
  4: [-0.5, -0.25],
}

export type Avaliacao = 'abaixo' | 'dentro' | 'acima'

export interface Ritmo {
  kgPorSemana: number
  fase: Fase
  avaliacao: Avaliacao
}

/**
 * Ritmo da tendência nas últimas duas a quatro semanas. Precisa de pelo menos 10 dias entre a primeira e a última
 * pesagem consideradas; antes disso a variação de água engana.
 */
export function ritmo(diaUm: string, pontos: PontoDeTendencia[]): Ritmo | null {
  const ultimo = pontos[pontos.length - 1]
  if (!ultimo) return null
  const desde = somarDias(ultimo.data, -28)
  const janela = pontos.filter((p) => p.data >= desde)
  const primeiro = janela[0]
  const dias = diasEntre(primeiro.data, ultimo.data)
  if (dias < 10) return null
  const kgPorSemana = ((ultimo.tendencia - primeiro.tendencia) / dias) * 7
  const fase = faseDoDia(Math.max(1, numeroDoDia(diaUm, ultimo.data)))
  const [min, max] = RITMO_ESPERADO[fase]
  return { kgPorSemana, fase, avaliacao: kgPorSemana < min ? 'abaixo' : kgPorSemana > max ? 'acima' : 'dentro' }
}

// ---------------- medidas ----------------

export const PARTES = ['peito', 'braco', 'cintura', 'coxa'] as const
export type Parte = (typeof PARTES)[number]
export const NOMES_DAS_PARTES: Record<Parte, string> = { peito: 'Peito', braco: 'Braço', cintura: 'Cintura', coxa: 'Coxa' }
export const MEDIDA_MINIMA = 15
export const MEDIDA_MAXIMA = 200

export interface Medida {
  data: string
  peito?: number
  braco?: number
  cintura?: number
  coxa?: number
}

export function medidaValida(valor: unknown): number | null {
  const n = typeof valor === 'string' ? Number(valor.trim().replace(',', '.')) : valor
  if (typeof n !== 'number' || !Number.isFinite(n) || n < MEDIDA_MINIMA || n > MEDIDA_MAXIMA) return null
  return Math.round(n * 10) / 10
}

/** Medida com pelo menos uma parte válida; partes inválidas são descartadas. */
export function normalizarMedida(dado: unknown): Medida | null {
  const d = (dado ?? {}) as Record<string, unknown>
  if (!dataValida(d.data)) return null
  const m: Medida = { data: d.data }
  for (const parte of PARTES) {
    const v = medidaValida(d[parte])
    if (v !== null) m[parte] = v
  }
  return PARTES.some((p) => m[p] !== undefined) ? m : null
}

/** Diferença de cada parte entre a primeira e a última medida que a registraram. */
export function variacaoDasMedidas(medidas: Medida[]): Partial<Record<Parte, { de: number; para: number }>> {
  const ordenadas = [...medidas].sort((a, b) => a.data.localeCompare(b.data))
  const saida: Partial<Record<Parte, { de: number; para: number }>> = {}
  for (const parte of PARTES) {
    const com = ordenadas.filter((m) => m[parte] !== undefined)
    if (com.length >= 2) saida[parte] = { de: com[0][parte]!, para: com[com.length - 1][parte]! }
  }
  return saida
}

// ---------------- fotos ----------------

/** Mês do projeto: 1 para os dias 1 a 30, 2 para os dias 31 a 60, e assim por diante. Mês 13 cobre o fim do ano. */
export function mesDoProjeto(diaUm: string, data: string): number {
  return Math.max(1, Math.floor((numeroDoDia(diaUm, data) - 1) / 30) + 1)
}

export interface Foto {
  mes: number
  data: string
  imagem: Blob
}

export function normalizarFoto(dado: unknown): Foto | null {
  const d = (dado ?? {}) as Partial<Record<keyof Foto, unknown>>
  if (typeof d.mes !== 'number' || !Number.isInteger(d.mes) || d.mes < 1 || d.mes > 13) return null
  // checa a forma, não a classe: o Blob que volta do banco pode vir de outro contexto (instanceof falharia)
  const img = d.imagem as Blob | undefined
  const ehImagem = !!img && typeof img === 'object' && typeof img.size === 'number' && typeof img.type === 'string' && img.type.startsWith('image/')
  if (!dataValida(d.data) || !ehImagem) return null
  return { mes: d.mes, data: d.data, imagem: img }
}

// ---------------- XP da evolução ----------------

export const XP_PESAGEM = 60
export const XP_FOTO = 100

/** Pesagem dá XP uma vez por semana do projeto; foto, uma vez por mês. Só conta o que vai do dia 1 até hoje. */
export function xpDaEvolucao(diaUm: string, hoje: string, datasDePesagem: Iterable<string>, mesesComFoto: Iterable<number>): number {
  const semanas = new Set<number>()
  for (const data of datasDePesagem) if (data >= diaUm && data <= hoje) semanas.add(semanaDe(diaUm, data))
  const mesAtual = mesDoProjeto(diaUm, hoje)
  const meses = new Set([...mesesComFoto].filter((m) => m >= 1 && m <= mesAtual))
  return semanas.size * XP_PESAGEM + meses.size * XP_FOTO
}

// ---------------- atributos do herói ----------------

export type IdAtributo = 'forca' | 'energia' | 'folego' | 'foco'

export interface Atributo {
  id: IdAtributo
  nome: string
  /** O que conta para o atributo, em linguagem do usuário. */
  fonte: string
  pontos: number
  nivel: number
  /** Pontos já feitos dentro do nível atual e quantos o nível pede. */
  noNivel: number
  doNivel: number
  /** Pontos dos últimos 7 dias, para mostrar o ritmo. */
  semana: number
}

/** Pontos para chegar ao nível n: base × (n - 1)². Cada nível pede um pouco mais que o anterior. */
const BASE: Record<IdAtributo, number> = { forca: 20, energia: 30, folego: 15, foco: 3 }

export function nivelDoAtributo(id: IdAtributo, pontos: number): { nivel: number; noNivel: number; doNivel: number } {
  const base = BASE[id]
  const nivel = Math.floor(Math.sqrt(Math.max(0, pontos) / base)) + 1
  const inicio = base * (nivel - 1) ** 2, proximo = base * nivel ** 2
  return { nivel, noNivel: pontos - inicio, doNivel: proximo - inicio }
}

/**
 * Atributos calculados dos registros, do dia 1 até hoje:
 * Força = séries de força (empurrar, puxar, pernas e abdômen); Fôlego = minutos de corrida e cardio;
 * Energia = refeições cumpridas; Foco = dias vencidos.
 */
export function atributos(diaUm: string, hoje: string, rotina: Rotina, dias: Map<string, RegistroDia>, sessoes: Map<string, Sessao>): Atributo[] {
  const semanaPassada = somarDias(hoje, -6)
  const soma = { forca: 0, energia: 0, folego: 0, foco: 0 }
  const recente = { forca: 0, energia: 0, folego: 0, foco: 0 }
  const somar = (id: IdAtributo, valor: number, data: string) => {
    soma[id] += valor
    if (data >= semanaPassada) recente[id] += valor
  }
  for (const [data, sessao] of sessoes) {
    if (data < diaUm || data > hoje) continue
    for (const s of sessao.series) {
      const e = EXERCICIOS[s.exercicio as IdExercicio]
      if (!e) continue
      if (e.grupo === 'folego') somar('folego', e.unidade === 'min' ? s.valor : e.unidade === 'seg' ? s.valor / 60 : 0, data)
      else somar('forca', 1, data)
    }
  }
  for (let data = diaUm; data <= hoje; data = somarDias(data, 1)) {
    const registro = dias.get(data)
    if (!registro) continue
    const resumo = resumoDoDia(registro, missoesDoDia(rotina, data, registro))
    somar('energia', resumo.refeicoesFeitas, data)
    if (resumo.vencido) somar('foco', 1, data)
  }
  const montar = (id: IdAtributo, nome: string, fonte: string): Atributo => {
    const pontos = Math.round(soma[id])
    return { id, nome, fonte, pontos, ...nivelDoAtributo(id, pontos), semana: Math.round(recente[id]) }
  }
  return [
    montar('forca', 'Força', 'séries de força registradas'),
    montar('folego', 'Fôlego', 'minutos de corrida e cardio'),
    montar('energia', 'Energia', 'refeições cumpridas'),
    montar('foco', 'Foco', 'dias vencidos'),
  ]
}
