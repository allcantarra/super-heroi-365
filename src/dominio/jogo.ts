/** Regras de progressão do jogo. Funções puras: XP e nível são sempre derivados dos registros. */

export const NIVEL_MAXIMO = 50

/** XP para subir do nível n para n+1 (spec 4.6). */
export function xpParaSubir(nivel: number): number {
  return 400 + 160 * (nivel - 1)
}

export interface Progresso {
  nivel: number
  /** XP acumulado dentro do nível atual. */
  xpNoNivel: number
  /** XP necessário para o próximo nível; 0 no nível máximo. */
  xpDoNivel: number
}

export function progressoDe(xpTotal: number): Progresso {
  let nivel = 1
  let resto = Math.max(0, Math.floor(xpTotal))
  while (nivel < NIVEL_MAXIMO && resto >= xpParaSubir(nivel)) {
    resto -= xpParaSubir(nivel)
    nivel++
  }
  if (nivel === NIVEL_MAXIMO) return { nivel, xpNoNivel: 0, xpDoNivel: 0 }
  return { nivel, xpNoNivel: resto, xpDoNivel: xpParaSubir(nivel) }
}

export type Estagio = 1 | 2 | 3 | 4

export const TITULOS: Record<Estagio, string> = { 1: 'Civil', 2: 'Recruta', 3: 'Vigilante', 4: 'Lenda' }

/** Nível em que cada estágio do herói começa. */
export const NIVEL_DO_ESTAGIO: Record<Estagio, number> = { 1: 1, 2: 4, 3: 20, 4: 38 }

export function estagioDoNivel(nivel: number): Estagio {
  if (nivel >= NIVEL_DO_ESTAGIO[4]) return 4
  if (nivel >= NIVEL_DO_ESTAGIO[3]) return 3
  if (nivel >= NIVEL_DO_ESTAGIO[2]) return 2
  return 1
}
