import type { IdAlimento } from '../../src/conteudo/alimentos.ts'

export type Etiqueta = 'doce' | 'salgado' | 'besteira' | 'marmita' | 'vegetariano'

/** Receita completa de um prato. As quantidades dos ingredientes vêm dos itens do prato, já ajustadas para cada fase. */
export interface ReceitaDoPrato {
  /** Minutos do começo até estar pronto para comer (sem contar o preparo de domingo, quando houver). */
  tempo: number
  /** 3 a 7 passos, cada um uma frase de ação. */
  passos: readonly string[]
  etiquetas: readonly Etiqueta[]
  /** Ingredientes sem peso na conta: sal, alho em pó, orégano, páprica, canela, água. */
  temperos?: readonly string[]
  /** Como levar para o trabalho. Obrigatório em lanche e almoço. */
  levar?: string
  /** Versão na airfryer. Obrigatória quando o prato leva algo frito. */
  airfryer?: string
  /** Id da receita de domingo em src/conteudo/receitas.ts quando os passos remetem a ela ("veja o preparo de domingo"). */
  domingo?: string
}

/** Prato novo: proporção dos ingredientes (o gerador ajusta para o orçamento de cada fase) mais a receita. */
export interface PratoNovo extends ReceitaDoPrato {
  id: string
  nome: string
  itens: [IdAlimento, number][]
  /** Resumo de uma frase mostrado no cardápio do dia. */
  preparo: string
}
