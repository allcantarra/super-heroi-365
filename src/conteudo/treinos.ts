/**
 * Fichas de treino: calistenia e corrida em casa, sem aparelho de academia.
 * Objetos de casa que aparecem: sofá, cadeira firme, mesa resistente, toalha, mochila com livros e garrafas de água.
 * Objetivo: corpo atlético e definido (ombros, costas em V, abdômen, fôlego), partindo do zero.
 */

import { CORE } from './exercicios/core'
import { EMPURRAR } from './exercicios/empurrar'
import { FOLEGO } from './exercicios/folego'
import { MOBILIDADE } from './exercicios/mobilidade'
import { PERNAS } from './exercicios/pernas'
import { PUXAR } from './exercicios/puxar'
import type { Exercicio } from './exercicios/tipos'

export type { Dificuldade, Exercicio, Grupo, Unidade } from './exercicios/tipos'

/** Catálogo inteiro. Cada grupo mora no próprio arquivo, com o passo a passo de cada exercício. */
const E = { ...EMPURRAR, ...PUXAR, ...PERNAS, ...CORE, ...FOLEGO, ...MOBILIDADE } satisfies Record<string, Exercicio>

export type IdExercicio = keyof typeof E
export const EXERCICIOS: Record<IdExercicio, Exercicio> = E

/** Séries, mínimo e máximo do alvo (na unidade do exercício). */
export type Nivel = readonly [series: number, minimo: number, maximo: number]

export interface ItemFicha {
  exercicio: IdExercicio
  /** Descanso depois de cada série, em segundos. */
  descanso: number
  /** Um nível por semana da ficha; a última entrada vale para as semanas seguintes. */
  niveis: readonly Nivel[]
}

export type Letra = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export interface TreinoFicha {
  letra: Letra
  nome: string
  foco: string
  itens: ItemFicha[]
}

export type IdFicha = 'choque' | 't1' | 't2' | 't3' | 't4'

export interface Ficha {
  id: IdFicha
  nome: string
  /** Último dia do projeto em que a ficha vale. */
  ultimoDia: number
  nota: string
  /** Seis treinos, de segunda a sábado. Domingo é descanso. */
  treinos: TreinoFicha[]
}

const i = (exercicio: IdExercicio, descanso: number, ...niveis: Nivel[]): ItemFicha => ({ exercicio, descanso, niveis })

/** Um movimento do aquecimento ou do alongamento. Em exercício por lado, os segundos valem para cada lado. */
export interface PassoDoRoteiro {
  exercicio: IdExercicio
  segundos: number
}

/** 3 minutos antes da primeira série, fora da contagem de duração do treino. */
export const AQUECIMENTO: readonly PassoDoRoteiro[] = [
  { exercicio: 'corridaNoLugar', segundos: 30 },
  { exercicio: 'giroBracos', segundos: 30 },
  { exercicio: 'circulosQuadril', segundos: 30 },
  { exercicio: 'balancoPernas', segundos: 15 },
  { exercicio: 'giroTronco', segundos: 20 },
  { exercicio: 'polichinelo', segundos: 20 },
  { exercicio: 'skipping', segundos: 20 },
]

/** 3 minutos depois de concluir, também fora da contagem. */
export const ALONGAMENTO: readonly PassoDoRoteiro[] = [
  { exercicio: 'peitoralParede', segundos: 15 },
  { exercicio: 'posteriorCoxa', segundos: 15 },
  { exercicio: 'quadricepsParede', segundos: 15 },
  { exercicio: 'flexorQuadril', segundos: 15 },
  { exercicio: 'gatoVaca', segundos: 30 },
  { exercicio: 'posturaCrianca', segundos: 30 },
]

export const FICHAS: Ficha[] = [
  {
    id: 'choque',
    nome: 'Protocolo de Choque',
    ultimoDia: 28,
    nota: 'Quatro semanas para o corpo aprender os movimentos. A cada semana a ficha sobe um degrau. Pare cada série com 2 repetições de folga.',
    treinos: [
      { letra: 'A', nome: 'Empurrar', foco: 'Peito, ombros e tríceps', itens: [
        i('flexaoInclinada', 60, [2, 6, 8], [3, 6, 8], [3, 8, 10], [3, 10, 12]),
        i('pike', 60, [2, 4, 6], [3, 4, 6], [3, 5, 8], [3, 6, 8]),
        i('mergulho', 60, [2, 6, 8], [3, 6, 8], [3, 8, 10], [3, 8, 12]),
        i('toqueOmbro', 45, [2, 8, 12], [2, 10, 14], [3, 10, 14], [3, 12, 16]),
        i('prancha', 45, [2, 15, 20], [3, 15, 20], [3, 20, 30], [3, 25, 35]),
      ] },
      { letra: 'B', nome: 'Fôlego e abdômen', foco: 'Caminhada, trote e core', itens: [
        i('caminhadaTrote', 60, [1, 12, 15], [1, 15, 18], [1, 18, 20], [1, 20, 22]),
        i('deadBug', 45, [2, 6, 8], [2, 8, 10], [3, 8, 10], [3, 10, 12]),
        i('elevacaoPernas', 45, [2, 6, 8], [2, 8, 10], [3, 8, 10], [3, 10, 12]),
        i('vacuum', 30, [2, 10, 15], [3, 10, 15], [3, 15, 20], [3, 15, 20]),
      ] },
      { letra: 'C', nome: 'Puxar', foco: 'Costas e postura', itens: [
        i('remadaToalha', 60, [2, 6, 8], [3, 6, 8], [3, 8, 10], [3, 10, 12]),
        i('remadaMesa', 60, [2, 3, 5], [2, 4, 6], [3, 4, 6], [3, 5, 8]),
        i('superman', 45, [2, 8, 10], [3, 8, 10], [3, 10, 12], [3, 10, 12]),
        i('ytw', 45, [2, 5, 6], [2, 6, 8], [3, 6, 8], [3, 6, 8]),
        i('pranchaLateral', 30, [2, 10, 15], [2, 15, 20], [3, 15, 20], [3, 20, 25]),
      ] },
      { letra: 'D', nome: 'Pernas', foco: 'Coxas, glúteos e panturrilhas', itens: [
        i('agachamento', 60, [2, 8, 10], [3, 8, 12], [3, 10, 15], [3, 12, 15]),
        i('afundo', 60, [2, 5, 6], [2, 6, 8], [3, 6, 8], [3, 8, 10]),
        i('ponteGluteo', 45, [2, 10, 12], [3, 10, 12], [3, 12, 15], [3, 12, 15]),
        i('panturrilha', 30, [2, 12, 15], [3, 12, 15], [3, 15, 20], [3, 15, 20]),
        i('cadeiraParede', 45, [2, 15, 20], [2, 20, 30], [3, 20, 30], [3, 30, 40]),
      ] },
      { letra: 'E', nome: 'Corpo todo', foco: 'Os movimentos da semana, juntos', itens: [
        i('flexaoJoelhos', 60, [2, 5, 8], [3, 5, 8], [3, 6, 10], [3, 8, 12]),
        i('remadaToalha', 60, [2, 6, 8], [3, 6, 8], [3, 8, 10], [3, 10, 12]),
        i('agachamento', 60, [2, 8, 10], [3, 8, 12], [3, 10, 15], [3, 12, 15]),
        i('pike', 60, [2, 4, 6], [2, 4, 6], [3, 5, 8], [3, 6, 8]),
        i('escalador', 30, [2, 15, 20], [3, 15, 20], [3, 20, 25], [3, 20, 30]),
      ] },
      { letra: 'F', nome: 'Fôlego', foco: 'Caminhada e trote mais longos', itens: [
        i('caminhadaTrote', 60, [1, 15, 18], [1, 18, 20], [1, 20, 25], [1, 25, 28]),
        i('prancha', 45, [2, 15, 20], [2, 20, 25], [3, 20, 30], [3, 25, 35]),
      ] },
    ],
  },
  {
    id: 't1',
    nome: 'Trimestre 1: Base Atlética',
    ultimoDia: 91,
    nota: 'Desça em 3 segundos em toda repetição. Chegou ao topo do alvo em todas as séries? Na próxima vez, desça mais devagar ou pause embaixo.',
    treinos: [
      { letra: 'A', nome: 'Empurrar', foco: 'Peito, ombros e tríceps', itens: [
        i('flexao', 60, [4, 6, 12]),
        i('pike', 60, [3, 6, 10]),
        i('mergulho', 60, [3, 8, 12]),
        i('flexaoDiamante', 60, [2, 6, 10]),
        i('elevacaoLateral', 45, [3, 12, 15]),
        i('toqueOmbro', 45, [3, 16, 20]),
      ] },
      { letra: 'B', nome: 'Fôlego e abdômen', foco: 'Trote e core', itens: [
        i('caminhadaTrote', 60, [1, 18, 22]),
        i('elevacaoPernas', 45, [3, 10, 12]),
        i('prancha', 45, [3, 30, 45]),
        i('vacuum', 30, [2, 15, 20]),
      ] },
      { letra: 'C', nome: 'Puxar', foco: 'Costas, bíceps e postura', itens: [
        i('remadaMesa', 60, [4, 6, 10]),
        i('remadaToalha', 60, [3, 10, 12]),
        i('superman', 45, [3, 10, 12]),
        i('anjoInvertido', 45, [3, 8, 12]),
        i('roscaMochila', 45, [3, 10, 12]),
        i('pranchaLateral', 30, [2, 20, 30]),
      ] },
      { letra: 'D', nome: 'Pernas', foco: 'Coxas, glúteos e panturrilhas', itens: [
        i('agachamento', 60, [4, 12, 15]),
        i('afundo', 60, [3, 8, 10]),
        i('ponteGluteo', 45, [3, 12, 15]),
        i('panturrilha', 30, [3, 15, 20]),
        i('cadeiraParede', 45, [3, 30, 40]),
        i('deadBug', 45, [2, 10, 12]),
      ] },
      { letra: 'E', nome: 'Corpo todo', foco: 'Ombros e costas em destaque', itens: [
        i('flexao', 60, [3, 6, 12]),
        i('remadaMesa', 60, [3, 6, 10]),
        i('pike', 60, [3, 6, 10]),
        i('agachamento', 60, [3, 12, 15]),
        i('mergulho', 60, [3, 8, 12]),
        i('escalador', 30, [3, 20, 30]),
      ] },
      { letra: 'F', nome: 'Fôlego', foco: 'Trote mais longo', itens: [
        i('caminhadaTrote', 60, [1, 25, 30]),
        i('vacuum', 30, [3, 15, 20]),
      ] },
    ],
  },
  {
    id: 't2',
    nome: 'Trimestre 2: Ombros e Costas em V',
    ultimoDia: 182,
    nota: 'Versões mais difíceis dos mesmos movimentos. Ficou fácil? Desça em 4 segundos e pause embaixo antes de aumentar as repetições.',
    treinos: [
      { letra: 'A', nome: 'Empurrar', foco: 'Ombros largos e peito', itens: [
        i('flexaoDeclinada', 75, [4, 8, 12]),
        i('pikeElevado', 75, [4, 6, 8]),
        i('flexaoArqueiro', 75, [3, 4, 6]),
        i('mergulhoElevado', 60, [3, 10, 12]),
        i('elevacaoLateral', 45, [3, 12, 15]),
      ] },
      { letra: 'B', nome: 'Tiros e abdômen', foco: 'Corrida com tiros e core', itens: [
        i('corridaTiros', 60, [1, 20, 22]),
        i('hollow', 45, [3, 20, 30]),
        i('elevacaoPernas', 45, [3, 12, 15]),
        i('pranchaLateral', 30, [2, 25, 30]),
      ] },
      { letra: 'C', nome: 'Puxar', foco: 'Costas em V e bíceps', itens: [
        i('remadaMesaElevada', 75, [4, 8, 12]),
        i('remadaMochila', 60, [3, 8, 10]),
        i('remadaSupinada', 60, [3, 8, 10]),
        i('anjoInvertido', 45, [3, 10, 12]),
        i('roscaMochila', 45, [3, 10, 12]),
        i('remadaIsometrica', 45, [2, 15, 20]),
      ] },
      { letra: 'D', nome: 'Pernas', foco: 'Uma perna de cada vez', itens: [
        i('bulgaro', 75, [4, 8, 10]),
        i('agachamentoSalto', 60, [3, 10, 12]),
        i('ponteUnilateral', 45, [3, 10, 12]),
        i('stiffUnilateral', 45, [3, 8, 10]),
        i('panturrilhaUnilateral', 30, [3, 12, 15]),
      ] },
      { letra: 'E', nome: 'Corpo todo', foco: 'Força com fôlego', itens: [
        i('flexaoPausa', 60, [3, 6, 8]),
        i('remadaSupinada', 75, [4, 8, 10]),
        i('pikeElevado', 75, [3, 6, 8]),
        i('bulgaro', 60, [3, 8, 10]),
        i('pranchaAlcance', 45, [3, 30, 40]),
        i('burpee', 45, [3, 8, 10]),
      ] },
      { letra: 'F', nome: 'Fôlego', foco: 'Corrida contínua', itens: [
        i('corridaLeve', 60, [1, 25, 30]),
        i('vacuum', 30, [3, 15, 20]),
      ] },
    ],
  },
  {
    id: 't3',
    nome: 'Trimestre 3: Força e Controle',
    ultimoDia: 273,
    nota: 'Mais repetições nas versões difíceis e pausas mais longas. A última repetição de cada série tem de sair tão limpa quanto a primeira.',
    treinos: [
      { letra: 'A', nome: 'Empurrar', foco: 'Ombros, peito e tríceps', itens: [
        i('flexaoDeclinada', 75, [4, 10, 15]),
        i('flexaoArqueiro', 75, [3, 6, 8]),
        i('pikeElevado', 75, [4, 8, 10]),
        i('mergulhoElevado', 60, [3, 12, 15]),
        i('flexaoDiamante', 60, [3, 10, 15]),
      ] },
      { letra: 'B', nome: 'Tiros e abdômen', foco: 'Corrida com tiros e core', itens: [
        i('corridaTiros', 60, [1, 22, 25]),
        i('hollow', 45, [3, 30, 40]),
        i('elevacaoQuadril', 45, [3, 10, 15]),
        i('giroRusso', 45, [3, 20, 24]),
      ] },
      { letra: 'C', nome: 'Puxar', foco: 'Costas em V e bíceps', itens: [
        i('remadaMesaElevada', 75, [4, 10, 15]),
        i('remadaMochila', 60, [3, 10, 12]),
        i('remadaSupinada', 60, [3, 10, 12]),
        i('remadaIsometrica', 45, [3, 20, 30]),
        i('anjoInvertido', 45, [3, 12, 15]),
        i('roscaMochila', 45, [3, 12, 15]),
      ] },
      { letra: 'D', nome: 'Pernas', foco: 'Força em uma perna', itens: [
        i('bulgaro', 75, [4, 10, 12]),
        i('pistolSofa', 75, [3, 4, 6]),
        i('agachamentoSalto', 60, [3, 12, 15]),
        i('stiffUnilateral', 45, [3, 10, 12]),
        i('panturrilhaUnilateral', 30, [3, 15, 20]),
      ] },
      { letra: 'E', nome: 'Corpo todo', foco: 'Potência e fôlego', itens: [
        i('flexaoExplosiva', 75, [4, 5, 8]),
        i('remadaMesaElevada', 75, [3, 10, 12]),
        i('pikeElevado', 75, [3, 8, 10]),
        i('agachamentoSalto', 60, [3, 12, 15]),
        i('pranchaAlcance', 45, [3, 40, 45]),
        i('burpee', 45, [3, 10, 12]),
      ] },
      { letra: 'F', nome: 'Fôlego', foco: 'Corrida contínua', itens: [
        i('corridaLeve', 60, [1, 30, 35]),
        i('vacuum', 30, [2, 15, 20]),
      ] },
    ],
  },
  {
    id: 't4',
    nome: 'Trimestre 4: Definição',
    ultimoDia: 365,
    nota: 'Mesma força, menos descanso. O músculo fica, a gordura sai. Mantenha as repetições do trimestre anterior com o relógio mais curto.',
    treinos: [
      { letra: 'A', nome: 'Empurrar', foco: 'Ombros e peito, descanso curto', itens: [
        i('flexaoDeclinada', 45, [4, 12, 15]),
        i('flexaoArqueiro', 45, [3, 8, 10]),
        i('pikeElevado', 45, [4, 8, 12]),
        i('mergulhoElevado', 45, [3, 12, 15]),
        i('flexaoDiamante', 45, [3, 10, 15]),
        i('burpee', 30, [3, 10, 12]),
      ] },
      { letra: 'B', nome: 'Tiros e abdômen', foco: 'Corrida com tiros e core', itens: [
        i('corridaTiros', 60, [1, 20, 22]),
        i('hollow', 30, [3, 30, 45]),
        i('elevacaoQuadril', 30, [3, 12, 15]),
        i('escalador', 30, [3, 30, 40]),
        i('vacuum', 30, [2, 15, 20]),
      ] },
      { letra: 'C', nome: 'Puxar', foco: 'Costas em V, descanso curto', itens: [
        i('remadaMesaElevada', 45, [4, 12, 15]),
        i('remadaMochila', 45, [3, 10, 12]),
        i('remadaSupinada', 45, [4, 10, 12]),
        i('anjoInvertido', 30, [3, 12, 15]),
        i('roscaMochila', 30, [3, 12, 15]),
        i('remadaIsometrica', 30, [3, 20, 30]),
      ] },
      { letra: 'D', nome: 'Pernas', foco: 'Pernas e fôlego', itens: [
        i('bulgaro', 45, [4, 10, 12]),
        i('pistolSofa', 60, [3, 5, 8]),
        i('agachamentoSalto', 45, [4, 12, 15]),
        i('ponteUnilateral', 30, [3, 12, 15]),
        i('cadeiraParede', 30, [2, 45, 60]),
      ] },
      { letra: 'E', nome: 'Circuito', foco: 'Corpo todo em ritmo alto', itens: [
        i('flexaoExplosiva', 45, [3, 6, 8]),
        i('remadaSupinada', 45, [3, 10, 12]),
        i('pikeElevado', 45, [3, 8, 10]),
        i('agachamentoSalto', 45, [3, 12, 15]),
        i('burpee', 30, [4, 10, 12]),
        i('escalador', 30, [3, 30, 40]),
      ] },
      { letra: 'F', nome: 'Fôlego', foco: 'Corrida contínua', itens: [
        i('corridaLeve', 60, [1, 30, 35]),
        i('pranchaLateral', 30, [2, 30, 40]),
      ] },
    ],
  },
]
