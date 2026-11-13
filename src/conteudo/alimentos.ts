/**
 * Tabela de alimentos. Valores por 100 g (ou 100 ml) do alimento pronto para comer.
 * Fonte: TACO 4ª edição (NEPA/Unicamp), conferida item a item em 2026-11-12.
 * Fora da TACO, por rótulo ou estimativa: creme de leite (valor da TACO citado de memória, não conferido), leite integral líquido, macarrão cozido (derivado do cru), purê, pizza,
 * esfiha, Mucilon, pasta de amendoim, whey, maca e beterraba em pó. Pão de forma usa a linha do integral.
 * Trate os totais como guia: a margem real, somando porção e preparo, é de cerca de 10%.
 * Lista fechada de propósito: nada de verdura, legume em pedaço, salada, peixe, fruto do mar ou feijão.
 */

export type Setor = 'Açougue' | 'Frios e laticínios' | 'Padaria' | 'Mercearia' | 'Hortifruti' | 'Suplementos'
export type Classe = 'carbo' | 'proteina' | 'gordura' | 'laticinio' | 'suplemento' | 'outro'

export interface Alimento {
  nome: string
  kcal: number
  p: number
  c: number
  g: number
  /** 'g' ou 'ml' quando medido por peso/volume; unidade quando contado (ovo, fatia, pão). */
  medida: 'g' | 'ml' | { singular: string; plural: string; gramas: number }
  classe: Classe
  setor: Setor
  /** Nome na lista de compras, quando difere (ex.: "Arroz cru"). */
  compra?: string
  /** Gramas a comprar para cada grama consumido (arroz cru rende quase 3 vezes; carne perde água). Padrão 1. */
  fatorCompra?: number
  /** Tem cafeína: bloqueado depois das 15h. */
  cafeina?: boolean
}

const un = (singular: string, plural: string, gramas: number) => ({ singular, plural, gramas })

export const ALIMENTOS = {
  arroz: { nome: 'Arroz cozido', kcal: 128, p: 2.5, c: 28.1, g: 0.2, medida: 'g', classe: 'carbo', setor: 'Mercearia', compra: 'Arroz cru', fatorCompra: 0.36 },
  macarrao: { nome: 'Macarrão cozido', kcal: 157, p: 5.2, c: 31.0, g: 0.9, medida: 'g', classe: 'carbo', setor: 'Mercearia', compra: 'Macarrão cru', fatorCompra: 0.42 },
  batata: { nome: 'Batata cozida ou assada', kcal: 52, p: 1.2, c: 11.9, g: 0, medida: 'g', classe: 'carbo', setor: 'Hortifruti', compra: 'Batata', fatorCompra: 1.15 },
  batataFrita: { nome: 'Batata frita', kcal: 267, p: 5.0, c: 35.6, g: 13.1, medida: 'g', classe: 'carbo', setor: 'Hortifruti', compra: 'Batata', fatorCompra: 2 },
  pure: { nome: 'Purê de batata', kcal: 100, p: 2.0, c: 15.0, g: 3.5, medida: 'g', classe: 'carbo', setor: 'Hortifruti', compra: 'Batata', fatorCompra: 0.95 },
  patinho: { nome: 'Bife de patinho grelhado', kcal: 219, p: 35.9, c: 0, g: 7.3, medida: 'g', classe: 'proteina', setor: 'Açougue', compra: 'Patinho em bife (cru)', fatorCompra: 1.4 },
  moida: { nome: 'Carne moída refogada', kcal: 212, p: 26.7, c: 0, g: 10.9, medida: 'g', classe: 'proteina', setor: 'Açougue', compra: 'Carne moída (crua)', fatorCompra: 1.35 },
  picanha: { nome: 'Churrasco de picanha', kcal: 289, p: 26.4, c: 0, g: 19.5, medida: 'g', classe: 'proteina', setor: 'Açougue', compra: 'Picanha (crua)', fatorCompra: 1.4 },
  frango: { nome: 'Peito de frango grelhado', kcal: 159, p: 32.0, c: 0, g: 2.5, medida: 'g', classe: 'proteina', setor: 'Açougue', compra: 'Peito de frango (cru)', fatorCompra: 1.4 },
  sobrecoxa: { nome: 'Sobrecoxa de frango assada', kcal: 233, p: 29.2, c: 0, g: 12.0, medida: 'g', classe: 'proteina', setor: 'Açougue', compra: 'Sobrecoxa sem osso (crua)', fatorCompra: 1.4 },
  ovo: { nome: 'Ovo', compra: 'Ovos', kcal: 146, p: 13.3, c: 0.6, g: 9.5, medida: un('ovo', 'ovos', 50), classe: 'proteina', setor: 'Mercearia' },
  leite: { nome: 'Leite integral', kcal: 61, p: 3.2, c: 4.7, g: 3.3, medida: 'ml', classe: 'laticinio', setor: 'Frios e laticínios' },
  iogurte: { nome: 'Iogurte natural', kcal: 51, p: 4.1, c: 1.9, g: 3.0, medida: 'g', classe: 'laticinio', setor: 'Frios e laticínios' },
  mussarela: { nome: 'Mussarela', kcal: 330, p: 22.6, c: 3.0, g: 25.2, medida: un('fatia', 'fatias', 20), classe: 'proteina', setor: 'Frios e laticínios' },
  minas: { nome: 'Queijo minas', kcal: 264, p: 17.4, c: 3.2, g: 20.2, medida: 'g', classe: 'proteina', setor: 'Frios e laticínios' },
  requeijao: { nome: 'Requeijão', kcal: 257, p: 9.6, c: 2.4, g: 23.4, medida: 'g', classe: 'gordura', setor: 'Frios e laticínios' },
  presunto: { nome: 'Presunto', kcal: 94, p: 14.3, c: 2.1, g: 2.7, medida: un('fatia', 'fatias', 15), classe: 'proteina', setor: 'Frios e laticínios' },
  cremeLeite: { nome: 'Creme de leite', kcal: 221, p: 1.5, c: 4.5, g: 22.5, medida: 'g', classe: 'gordura', setor: 'Mercearia' },
  manteiga: { nome: 'Manteiga', kcal: 726, p: 0.4, c: 0.1, g: 82.4, medida: 'g', classe: 'gordura', setor: 'Frios e laticínios' },
  paoFrances: { nome: 'Pão francês', kcal: 300, p: 8.0, c: 58.6, g: 3.1, medida: un('pão', 'pães', 50), classe: 'carbo', setor: 'Padaria' },
  paoForma: { nome: 'Pão de forma', kcal: 253, p: 9.4, c: 49.9, g: 3.7, medida: un('fatia', 'fatias', 25), classe: 'carbo', setor: 'Padaria' },
  paoQueijo: { nome: 'Pão de queijo', kcal: 363, p: 5.1, c: 34.2, g: 24.6, medida: un('unidade', 'unidades', 30), classe: 'carbo', setor: 'Padaria' },
  pizza: { nome: 'Pizza de mussarela', kcal: 260, p: 11.0, c: 30.0, g: 10.5, medida: un('fatia', 'fatias', 110), classe: 'carbo', setor: 'Padaria' },
  esfiha: { nome: 'Esfiha de carne', kcal: 250, p: 10.0, c: 30.0, g: 10.0, medida: un('unidade', 'unidades', 80), classe: 'carbo', setor: 'Padaria' },
  creamCracker: { nome: 'Biscoito cream cracker', kcal: 432, p: 10.1, c: 68.7, g: 14.4, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  aveia: { nome: 'Aveia em flocos', kcal: 394, p: 13.9, c: 66.6, g: 8.5, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  farinhaLactea: { nome: 'Farinha Láctea', kcal: 415, p: 11.9, c: 77.8, g: 5.8, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  mucilon: { nome: 'Mucilon', kcal: 375, p: 6.0, c: 86.0, g: 0.8, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  banana: { nome: 'Banana', kcal: 98, p: 1.3, c: 26.0, g: 0.1, medida: un('banana', 'bananas', 80), classe: 'carbo', setor: 'Hortifruti' },
  pastaAmendoim: { nome: 'Pasta de amendoim', kcal: 590, p: 25.0, c: 20.0, g: 48.0, medida: 'g', classe: 'gordura', setor: 'Mercearia' },
  mel: { nome: 'Mel', kcal: 309, p: 0, c: 84.0, g: 0, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  achocolatado: { nome: 'Achocolatado em pó', kcal: 401, p: 4.2, c: 91.2, g: 2.2, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  sucoLaranja: { nome: 'Suco de laranja natural', kcal: 33, p: 0.7, c: 7.6, g: 0.1, medida: 'ml', classe: 'carbo', setor: 'Hortifruti', compra: 'Laranja (para suco)', fatorCompra: 2 },
  molhoTomate: { nome: 'Molho de tomate liso', kcal: 38, p: 1.4, c: 7.7, g: 0.9, medida: 'g', classe: 'outro', setor: 'Mercearia' },
  azeite: { nome: 'Azeite', kcal: 884, p: 0, c: 0, g: 100, medida: 'g', classe: 'gordura', setor: 'Mercearia' },
  whey: { nome: 'Whey protein', kcal: 400, p: 80.0, c: 7.0, g: 6.0, medida: 'g', classe: 'suplemento', setor: 'Suplementos' },
  creatina: { nome: 'Creatina', kcal: 0, p: 0, c: 0, g: 0, medida: 'g', classe: 'suplemento', setor: 'Suplementos' },
  guarana: { nome: 'Guaraná em pó', kcal: 0, p: 0, c: 0, g: 0, medida: 'g', classe: 'suplemento', setor: 'Suplementos', cafeina: true },
  maca: { nome: 'Maca peruana em pó', kcal: 325, p: 14.0, c: 60.0, g: 2.0, medida: 'g', classe: 'suplemento', setor: 'Suplementos' },
  beterraba: { nome: 'Beterraba em pó', kcal: 300, p: 10.0, c: 65.0, g: 0.5, medida: 'g', classe: 'suplemento', setor: 'Suplementos' },
} as const satisfies Record<string, Alimento>

export type IdAlimento = keyof typeof ALIMENTOS

export const alimento = (id: IdAlimento): Alimento => ALIMENTOS[id]

/** Gramas (ou ml) de uma quantidade: unidades viram peso. */
export function gramasDe(id: IdAlimento, quantidade: number): number {
  const a = alimento(id)
  return typeof a.medida === 'object' ? quantidade * a.medida.gramas : quantidade
}

export function textoQuantidade(id: IdAlimento, quantidade: number): string {
  const a = alimento(id)
  if (typeof a.medida === 'object') return `${quantidade} ${quantidade === 1 ? a.medida.singular : a.medida.plural}`
  return `${quantidade} ${a.medida}`
}

/** Termos que nunca podem aparecer em nome de alimento, prato ou receita. */
export const PROIBIDOS = /feij|verdura|salada|alface|couve|br[oó]colis|cenoura|abobrinha|legume|peixe|atum|sardinha|salm[aã]o|til[aá]pia|camar[aã]o|fruto do mar|lula|polvo|mexilh/i
