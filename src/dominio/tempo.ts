/** Datas e horas sempre no fuso local do aparelho. Data é texto 'AAAA-MM-DD'; hora é 'HH:MM'. */

const dois = (n: number) => String(n).padStart(2, '0')

export function dataLocal(d: Date): string {
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`
}

/** Meio-dia local da data, para somar dias sem cair em borda de horário de verão. */
function meioDia(data: string): Date {
  const [a, m, d] = data.split('-').map(Number)
  return new Date(a, m - 1, d, 12)
}

export function somarDias(data: string, n: number): string {
  const d = meioDia(data)
  d.setDate(d.getDate() + n)
  return dataLocal(d)
}

/** Dias inteiros de a até b (b - a). */
export function diasEntre(a: string, b: string): number {
  return Math.round((meioDia(b).getTime() - meioDia(a).getTime()) / 864e5)
}

/** 0 = domingo ... 6 = sábado. */
export function diaDaSemana(data: string): number {
  return meioDia(data).getDay()
}

export function dataValida(texto: unknown): texto is string {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false
  return dataLocal(meioDia(texto)) === texto
}

export function horaValida(texto: unknown): texto is string {
  return typeof texto === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(texto)
}

export function minutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

export function horaDeMinutos(total: number): string {
  const t = ((Math.round(total) % 1440) + 1440) % 1440
  return `${dois(Math.floor(t / 60))}:${dois(t % 60)}`
}

export function horaLocal(d: Date): string {
  return `${dois(d.getHours())}:${dois(d.getMinutes())}`
}

/** Dia do projeto: 1 no dia de início. Antes do início devolve 0 ou negativo. */
export function numeroDoDia(diaUm: string, hoje: string): number {
  return diasEntre(diaUm, hoje) + 1
}

export type Fase = 1 | 2 | 3 | 4

export const FASES: Record<Fase, { nome: string; ultimoDia: number }> = {
  1: { nome: 'Protocolo de Choque', ultimoDia: 30 },
  2: { nome: 'Ganho Acelerado', ultimoDia: 120 },
  3: { nome: 'Volume Atlético', ultimoDia: 240 },
  4: { nome: 'Definição', ultimoDia: 365 },
}

export function faseDoDia(numero: number): Fase {
  if (numero <= FASES[1].ultimoDia) return 1
  if (numero <= FASES[2].ultimoDia) return 2
  if (numero <= FASES[3].ultimoDia) return 3
  return 4
}
