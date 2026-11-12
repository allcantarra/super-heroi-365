/** Opções de personalização do herói. Só valores destas listas são aceitos. */

export const PELES = { Clara: '#f3cfb0', Média: '#e8b48a', Morena: '#c68c5e', Escura: '#8a5a3b' } as const
export const CABELOS = { Castanho: '#2b1d14', Preto: '#111111', Loiro: '#d9a441', Ruivo: '#a4421f' } as const
export const UNIFORMES = { Azul: '#3a86ff', Verde: '#1fa187', Roxo: '#8338ec', Grafite: '#3d405b' } as const
export const CORTES = ['Topete', 'Curto', 'Careca'] as const

export interface Aparencia {
  pele: keyof typeof PELES
  cabelo: keyof typeof CABELOS
  uniforme: keyof typeof UNIFORMES
  corte: (typeof CORTES)[number]
}

export const APARENCIA_PADRAO: Aparencia = { pele: 'Média', cabelo: 'Castanho', uniforme: 'Azul', corte: 'Topete' }

/** Devolve uma aparência válida a partir de dado gravado, que pode estar incompleto ou corrompido. */
export function normalizarAparencia(dado: unknown): Aparencia {
  const d = (dado ?? {}) as Partial<Record<keyof Aparencia, unknown>>
  const em = <T extends string>(valor: unknown, opcoes: readonly T[], padrao: T): T =>
    typeof valor === 'string' && (opcoes as readonly string[]).includes(valor) ? (valor as T) : padrao
  return {
    pele: em(d.pele, Object.keys(PELES) as (keyof typeof PELES)[], APARENCIA_PADRAO.pele),
    cabelo: em(d.cabelo, Object.keys(CABELOS) as (keyof typeof CABELOS)[], APARENCIA_PADRAO.cabelo),
    uniforme: em(d.uniforme, Object.keys(UNIFORMES) as (keyof typeof UNIFORMES)[], APARENCIA_PADRAO.uniforme),
    corte: em(d.corte, CORTES, APARENCIA_PADRAO.corte),
  }
}

export function escurecer(hex: string, fator: number): string {
  const n = parseInt(hex.slice(1), 16)
  const c = (v: number) => Math.round(v * fator)
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`
}
