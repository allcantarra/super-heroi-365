import type { IdMissao } from '../dominio/rotina'
import type { Fase } from '../dominio/tempo'
import type { Categoria, IdPrato } from './pratos'

export type IdRefeicao = Exclude<IdMissao, 'treino'>

export const REFEICOES: readonly IdRefeicao[] = ['pre', 'cafe', 'lancheManha', 'almoco', 'lancheTarde', 'trajeto', 'jantar', 'ceia']

/** De qual categoria de prato cada refeição do dia é servida. Os três lanches saem da mesma lista, toda portátil. */
export const CATEGORIA_DA_REFEICAO: Record<IdRefeicao, Categoria> = {
  pre: 'pre',
  cafe: 'cafe',
  lancheManha: 'lanche',
  almoco: 'almoco',
  lancheTarde: 'lanche',
  trajeto: 'lanche',
  jantar: 'jantar',
  ceia: 'ceia',
}

export type Formato = 'casa' | 'marmita' | 'portátil'

/** Como o prato de cada categoria é levado. É o que garante que refeição de trabalho nunca peça fogão. */
export const FORMATO: Record<Categoria, Formato> = { pre: 'casa', cafe: 'casa', lanche: 'portátil', almoco: 'marmita', jantar: 'casa', ceia: 'casa' }

export interface MetaDaFase {
  kcal: number
  p: number
  c: number
  g: number
  foco: string
  dicas: readonly string[]
}

/**
 * Metas diárias por fase. As calorias mandam; proteína, carboidrato e gordura são o centro do que os pratos entregam.
 * A proteína é alta (whey, carne, ovo e leite em quase toda refeição); quem quiser baixar tira o whey do café.
 */
export const METAS: Record<Fase, MetaDaFase> = {
  1: { kcal: 2750, p: 165, c: 320, g: 90, foco: 'Reativar o apetite e encher o músculo. Meta do mês: 2 a 3 kg a mais, sem barriga.', dicas: ['Sem fome? Troque a refeição por uma vitamina: líquido desce mais fácil.', 'Água o dia todo: músculo hidratado parece maior e mais firme.', 'Creatina todo dia, junto com o café reforçado.'] },
  2: { kcal: 3050, p: 185, c: 350, g: 100, foco: 'Superávit limpo: ganhar de 0,6 a 1 kg por mês. Acima de 1,2 kg por mês é gordura.', dicas: ['Pese-se toda semana, em jejum, no mesmo dia.', 'Proteína em todas as refeições, não só no café.', 'Subiu rápido demais? Tire a ceia por uma semana.'] },
  3: { kcal: 3250, p: 195, c: 370, g: 110, foco: 'Treino no volume máximo pede comida no máximo. É aqui que ombros, costas e pernas ganham densidade.', dicas: ['Peso parado por 2 semanas? Uma colher a mais de arroz no almoço.', 'Não pule o lanche de trajeto: são 3 horas até o jantar.', 'Refeição livre uma vez por semana, sem culpa.'] },
  4: { kcal: 2600, p: 175, c: 280, g: 87, foco: 'Baixar a gordura sem perder músculo: menos carboidrato, mais proteína. Ritmo ideal: 0,3 a 0,5 kg a menos por semana.', dicas: ['Batata frita vira batata assada.', 'Refeição livre passa a ser quinzenal.', 'Sono e água em dia: sem isso a definição trava.'] },
}

/** Sete modelos de dia, de domingo (0) a sábado (6). */
export const MODELOS: Record<number, Record<IdRefeicao, IdPrato>> = {
  1: { pre: 'pre1', cafe: 'cafe1', lancheManha: 'lanche1', almoco: 'almoco1', lancheTarde: 'lanche5', trajeto: 'lanche2', jantar: 'jantar4', ceia: 'ceia1' },
  2: { pre: 'pre2', cafe: 'cafe2', lancheManha: 'lanche3', almoco: 'almoco2', lancheTarde: 'lanche4', trajeto: 'lanche8', jantar: 'jantar3', ceia: 'ceia2' },
  3: { pre: 'pre3', cafe: 'cafe3', lancheManha: 'lanche5', almoco: 'almoco3', lancheTarde: 'lanche7', trajeto: 'lanche1', jantar: 'jantar7', ceia: 'ceia3' },
  4: { pre: 'pre4', cafe: 'cafe4', lancheManha: 'lanche2', almoco: 'almoco4', lancheTarde: 'lanche1', trajeto: 'lanche6', jantar: 'jantar6', ceia: 'ceia4' },
  5: { pre: 'pre1', cafe: 'cafe5', lancheManha: 'lanche4', almoco: 'almoco5', lancheTarde: 'lanche3', trajeto: 'lanche8', jantar: 'jantar2', ceia: 'ceia1' },
  6: { pre: 'pre2', cafe: 'cafe1', lancheManha: 'lanche9', almoco: 'almoco6', lancheTarde: 'lanche6', trajeto: 'lanche2', jantar: 'jantar5', ceia: 'ceia2' },
  0: { pre: 'pre3', cafe: 'cafe2', lancheManha: 'lanche7', almoco: 'almoco7', lancheTarde: 'lanche9', trajeto: 'lanche4', jantar: 'jantar1', ceia: 'ceia3' },
}

export const DIAS_DA_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const

export const REFEICAO_LIVRE = {
  titulo: 'Refeição livre',
  regras: [
    'Uma refeição por semana (sábado, no jantar) é livre: pizza, churrasco completo ou batata frita à vontade.',
    'É uma refeição, não um dia: as outras seguem o cardápio.',
    'Na Fase 4 ela passa a ser a cada duas semanas.',
    'No dia seguinte, água em dia e treino normal. O inchaço some em 24 horas.',
  ],
} as const
