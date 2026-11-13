export type Unidade = 'reps' | 'seg' | 'min'
/** `mobilidade` só aparece no aquecimento e no alongamento, fora das fichas. */
export type Grupo = 'empurrar' | 'puxar' | 'pernas' | 'core' | 'folego' | 'mobilidade'

/** 1 é o primeiro degrau de quem parte do zero; 5 é o mais difícil que dá para fazer em casa. A troca na hora aceita uma diferença de até 1. */
export type Dificuldade = 1 | 2 | 3 | 4 | 5

export interface Exercicio {
  nome: string
  unidade: Unidade
  grupo: Grupo
  /** Série feita de um lado e depois do outro; o número registrado é o de cada lado. */
  porLado?: true
  dificuldade: Dificuldade
  /** Resumo em uma ou duas frases, mostrado logo abaixo do nome. */
  execucao: string
  /** Passo a passo completo. */
  inicio: string
  passos: readonly string[]
  respiracao: string
  erros: readonly string[]
  maisFacil: string
  maisDificil: string
}
