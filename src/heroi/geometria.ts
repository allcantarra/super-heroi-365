import type { Estagio } from '../dominio/jogo'

export type Pose = 'civil' | 'quadril' | 'vitoria'
export type Ponto = readonly [number, number]

/** Eixo vertical de simetria do desenho (viewBox 240 x 304). */
export const CX = 120

export interface Geometria {
  /** 0 no civil, 1 na lenda. */
  massa: number
  ombro: number
  peito: number
  cintura: number
  quadril: number
  antebraco: number
  braco: number
  coxa: number
  canela: number
  pescoco: number
  /** Pontos do lado esquerdo do desenho; o direito é espelhado. */
  pOmbro: Ponto
  pCotovelo: Ponto
  pPunho: Ponto
  pQuadril: Ponto
  pJoelho: Ponto
  pPe: Ponto
}

const MASSA: Record<Estagio, number> = { 1: 0, 2: 0.35, 3: 0.7, 4: 1 }

export function poseNatural(estagio: Estagio): Pose {
  return estagio === 1 ? 'civil' : 'quadril'
}

export function geometria(estagio: Estagio, pose: Pose): Geometria {
  const m = MASSA[estagio]
  const ombro = 30 + m * 24
  const quadril = 23 + m * 5
  const antebraco = 8 + m * 8
  let pCotovelo: Ponto
  let pPunho: Ponto
  if (pose === 'vitoria') {
    pCotovelo = [CX - ombro - 22 - m * 4, 108]
    pPunho = [CX - ombro - 15, 70 - m * 4]
  } else if (pose === 'civil') {
    pCotovelo = [CX - ombro - 4, 152]
    pPunho = [CX - ombro - 2, 192]
  } else {
    pCotovelo = [CX - ombro - 15 - m * 7, 152]
    pPunho = [CX - quadril - 4, 190]
  }
  return {
    massa: m,
    ombro,
    peito: 27 + m * 19,
    cintura: 21 + m * 5,
    quadril,
    antebraco,
    braco: antebraco + m * 8,
    coxa: 13 + m * 10,
    canela: 11 + m * 6,
    pescoco: 13 + m * 10,
    pOmbro: [CX - ombro, 110],
    pCotovelo,
    pPunho,
    pQuadril: [CX - 12 - m * 2, 204],
    pJoelho: [CX - 20 - m * 3, 252],
    pPe: [CX - 24 - m * 3, 294],
  }
}

export const espelhar = (p: Ponto): Ponto => [2 * CX - p[0], p[1]]
export const entre = (a: Ponto, b: Ponto, t: number): Ponto => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
export const pontos = (...ps: Ponto[]): string => ps.map((p) => `${+p[0].toFixed(1)},${+p[1].toFixed(1)}`).join(' ')
