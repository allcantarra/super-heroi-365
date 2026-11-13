/**
 * Pratos do cardápio com a quantidade de cada ingrediente nas 4 fases: q = [fase 1, fase 2, fase 3, fase 4].
 * Arquivo gerado por scripts/gerar-pratos.ts. Para mudar um prato, edite a base lá e rode o script.
 */
import type { IdAlimento } from './alimentos'

export type Categoria = 'pre' | 'cafe' | 'lanche' | 'almoco' | 'jantar' | 'ceia'

export interface ItemDoPrato {
  a: IdAlimento
  q: readonly [number, number, number, number]
}

export interface Prato {
  nome: string
  categoria: Categoria
  itens: readonly ItemDoPrato[]
  preparo: string
  receita?: string
}

/** Calorias de cada categoria por fase. Três lanches por dia. */
export const ORCAMENTO: Record<Categoria, readonly [number, number, number, number]> = {pre:[180,200,210,170],cafe:[480,530,560,450],lanche:[230,260,280,215],almoco:[620,690,730,600],jantar:[520,570,610,495],ceia:[260,280,300,240]}

export const PRATOS = {
  pre1: { nome: "Banana com pasta de amendoim", categoria: 'pre', itens: [{ a: 'banana', q: [1, 1, 1, 1] }, { a: 'pastaAmendoim', q: [15, 20, 20, 15] }, { a: 'beterraba', q: [5, 5, 5, 5] }, { a: 'guarana', q: [2, 2, 2, 2] }], preparo: "Beterraba e guaraná em pó misturados em meio copo de água." },
  pre2: { nome: "Pão com mel", categoria: 'pre', itens: [{ a: 'paoForma', q: [2, 2, 2, 2] }, { a: 'mel', q: [10, 20, 20, 10] }, { a: 'beterraba', q: [5, 5, 5, 5] }, { a: 'guarana', q: [2, 2, 2, 2] }], preparo: "Beterraba e guaraná em pó misturados em meio copo de água." },
  pre3: { nome: "Suco de laranja com aveia", categoria: 'pre', itens: [{ a: 'sucoLaranja', q: [250, 250, 300, 250] }, { a: 'aveia', q: [20, 25, 25, 20] }, { a: 'beterraba', q: [5, 5, 5, 5] }, { a: 'guarana', q: [2, 2, 2, 2] }], preparo: "Bata tudo junto e beba." },
  pre4: { nome: "Vitamina rápida de Mucilon", categoria: 'pre', itens: [{ a: 'leite', q: [150, 150, 150, 150] }, { a: 'mucilon', q: [20, 25, 30, 15] }, { a: 'beterraba', q: [5, 5, 5, 5] }, { a: 'guarana', q: [2, 2, 2, 2] }], preparo: "Bata tudo junto e beba." },
  cafe1: { nome: "Ovos mexidos, pão e shake de whey", categoria: 'cafe', itens: [{ a: 'ovo', q: [2, 2, 2, 2] }, { a: 'paoFrances', q: [1, 1, 1, 1] }, { a: 'leite', q: [100, 200, 250, 100] }, { a: 'whey', q: [30, 30, 30, 30] }, { a: 'creatina', q: [5, 5, 5, 5] }], preparo: "Whey e creatina batidos no leite." },
  cafe2: { nome: "Vitamina de whey, banana e aveia", categoria: 'cafe', itens: [{ a: 'leite', q: [250, 300, 300, 250] }, { a: 'banana', q: [1, 1, 1, 1] }, { a: 'aveia', q: [30, 35, 40, 20] }, { a: 'whey', q: [30, 30, 30, 30] }, { a: 'maca', q: [5, 5, 5, 5] }, { a: 'creatina', q: [5, 5, 5, 5] }], preparo: "Bata tudo no liquidificador.", receita: 'shakePosTreino' },
  cafe3: { nome: "Misto quente e shake de whey", categoria: 'cafe', itens: [{ a: 'paoForma', q: [2, 2, 2, 2] }, { a: 'mussarela', q: [2, 2, 2, 2] }, { a: 'presunto', q: [2, 2, 2, 2] }, { a: 'leite', q: [100, 200, 250, 100] }, { a: 'whey', q: [30, 30, 30, 30] }, { a: 'creatina', q: [5, 5, 5, 5] }], preparo: "Whey e creatina batidos no leite." },
  cafe4: { nome: "Panqueca de aveia e banana com whey", categoria: 'cafe', itens: [{ a: 'ovo', q: [2, 2, 2, 2] }, { a: 'banana', q: [1, 1, 1, 1] }, { a: 'aveia', q: [20, 25, 30, 15] }, { a: 'leite', q: [100, 150, 150, 100] }, { a: 'whey', q: [30, 30, 30, 30] }, { a: 'creatina', q: [5, 5, 5, 5] }], preparo: "Whey e creatina batidos no leite, para beber junto.", receita: 'panquecaAveia' },
  cafe5: { nome: "Pão de queijo e shake de whey", categoria: 'cafe', itens: [{ a: 'paoQueijo', q: [2, 2, 2, 2] }, { a: 'leite', q: [200, 250, 300, 150] }, { a: 'achocolatado', q: [5, 10, 10, 5] }, { a: 'whey', q: [30, 30, 30, 30] }, { a: 'creatina', q: [5, 5, 5, 5] }], preparo: "Whey, creatina e achocolatado batidos no leite." },
  lanche1: { nome: "Sanduíche de presunto e queijo", categoria: 'lanche', itens: [{ a: 'paoForma', q: [2, 2, 2, 2] }, { a: 'presunto', q: [2, 2, 2, 2] }, { a: 'mussarela', q: [1, 1, 1, 1] }, { a: 'requeijao', q: [5, 15, 25, 5] }], preparo: "Monte em casa e leve embrulhado." },
  lanche2: { nome: "Sanduíche de pasta de amendoim", categoria: 'lanche', itens: [{ a: 'paoForma', q: [2, 2, 2, 2] }, { a: 'pastaAmendoim', q: [20, 25, 25, 15] }], preparo: "Monte em casa e leve embrulhado." },
  lanche3: { nome: "Vitamina de Farinha Láctea na garrafa", categoria: 'lanche', itens: [{ a: 'leite', q: [200, 250, 250, 200] }, { a: 'farinhaLactea', q: [25, 25, 30, 20] }], preparo: "Bata de manhã e leve em garrafa térmica.", receita: 'vitaminaFarinhaLactea' },
  lanche4: { nome: "Banana, pasta de amendoim e leite", categoria: 'lanche', itens: [{ a: 'banana', q: [1, 1, 1, 1] }, { a: 'pastaAmendoim', q: [10, 10, 15, 10] }, { a: 'leite', q: [150, 200, 200, 150] }], preparo: "Leite em garrafa térmica; a pasta vai num potinho." },
  lanche5: { nome: "Iogurte com aveia e mel", categoria: 'lanche', itens: [{ a: 'iogurte', q: [160, 190, 220, 170] }, { a: 'aveia', q: [30, 30, 35, 25] }, { a: 'mel', q: [10, 15, 10, 10] }], preparo: "Leve a aveia separada e misture na hora." },
  lanche6: { nome: "Esfiha de carne e suco", categoria: 'lanche', itens: [{ a: 'esfiha', q: [1, 1, 1, 1] }, { a: 'sucoLaranja', q: [100, 200, 250, 100] }], preparo: "Vale comprar pronto na padaria." },
  lanche7: { nome: "Biscoito com queijo minas", categoria: 'lanche', itens: [{ a: 'creamCracker', q: [35, 40, 40, 25] }, { a: 'minas', q: [30, 35, 40, 40] }], preparo: "Queijo em fatias num pote." },
  lanche8: { nome: "Sanduíche de frango desfiado", categoria: 'lanche', itens: [{ a: 'paoFrances', q: [1, 1, 1, 1] }, { a: 'frango', q: [35, 60, 70, 35] }, { a: 'requeijao', q: [10, 5, 5, 5] }], preparo: "Use o frango da marmita, desfiado com requeijão." },
  lanche9: { nome: "Vitamina de Mucilon na garrafa", categoria: 'lanche', itens: [{ a: 'leite', q: [200, 250, 250, 250] }, { a: 'mucilon', q: [30, 30, 35, 15] }], preparo: "Bata de manhã e leve em garrafa térmica." },
  almoco1: { nome: "Arroz, bife e batata", categoria: 'almoco', itens: [{ a: 'arroz', q: [200, 210, 220, 150] }, { a: 'patinho', q: [100, 120, 130, 130] }, { a: 'batata', q: [190, 220, 230, 150] }, { a: 'azeite', q: [5, 5, 5, 5] }], preparo: "Batata assada na airfryer, com o azeite.", receita: 'batataAssada' },
  almoco2: { nome: "Arroz com carne moída e ovo", categoria: 'almoco', itens: [{ a: 'arroz', q: [230, 270, 280, 180] }, { a: 'moida', q: [120, 130, 140, 140] }, { a: 'ovo', q: [1, 1, 1, 1] }], preparo: "Ovo cozido, para aguentar a marmita.", receita: 'carneMoida' },
  almoco3: { nome: "Macarrão à bolonhesa", categoria: 'almoco', itens: [{ a: 'macarrao', q: [230, 260, 280, 190] }, { a: 'moida', q: [80, 90, 90, 100] }, { a: 'molhoTomate', q: [60, 70, 90, 60] }, { a: 'mussarela', q: [1, 1, 1, 1] }], preparo: "Queijo por cima, derrete no micro-ondas.", receita: 'bolonhesa' },
  almoco4: { nome: "Frango, purê e arroz", categoria: 'almoco', itens: [{ a: 'frango', q: [120, 140, 140, 160] }, { a: 'pure', q: [210, 220, 250, 170] }, { a: 'arroz', q: [170, 190, 200, 140] }], preparo: "Frango em cubos, grelhado.", receita: 'pureBatata' },
  almoco5: { nome: "Sobrecoxa assada, arroz e batata", categoria: 'almoco', itens: [{ a: 'sobrecoxa', q: [120, 130, 140, 140] }, { a: 'arroz', q: [200, 220, 240, 160] }, { a: 'batata', q: [160, 200, 190, 130] }], preparo: "Sobrecoxa e batata assadas juntas." },
  almoco6: { nome: "Escondidinho de carne moída", categoria: 'almoco', itens: [{ a: 'pure', q: [300, 320, 360, 230] }, { a: 'moida', q: [90, 110, 110, 110] }, { a: 'mussarela', q: [2, 2, 2, 2] }], preparo: "Camada de carne, purê por cima e queijo.", receita: 'pureBatata' },
  almoco7: { nome: "Macarrão com frango e requeijão", categoria: 'almoco', itens: [{ a: 'macarrao', q: [260, 290, 310, 220] }, { a: 'frango', q: [100, 110, 110, 130] }, { a: 'requeijao', q: [10, 15, 15, 10] }, { a: 'molhoTomate', q: [70, 60, 80, 60] }], preparo: "Misture o requeijão no molho quente.", receita: 'frangoCremoso' },
  jantar1: { nome: "Hambúrguer caseiro no pão", categoria: 'jantar', itens: [{ a: 'moida', q: [140, 170, 190, 130] }, { a: 'paoFrances', q: [1, 1, 1, 1] }, { a: 'mussarela', q: [1, 1, 1, 1] }], preparo: "Um disco de carne moída, 4 minutos de cada lado.", receita: 'hamburguer' },
  jantar2: { nome: "Bife com batata frita e arroz", categoria: 'jantar', itens: [{ a: 'patinho', q: [70, 80, 80, 90] }, { a: 'batataFrita', q: [100, 100, 110, 80] }, { a: 'arroz', q: [80, 100, 110, 70] }], preparo: "Na Fase 4, troque a batata frita pela assada." },
  jantar3: { nome: "Omelete de queijo com arroz", categoria: 'jantar', itens: [{ a: 'ovo', q: [3, 3, 3, 3] }, { a: 'mussarela', q: [2, 2, 2, 2] }, { a: 'arroz', q: [130, 170, 200, 110] }], preparo: "Pronto em 8 minutos.", receita: 'omelete' },
  jantar4: { nome: "Macarrão alho e óleo com frango", categoria: 'jantar', itens: [{ a: 'macarrao', q: [210, 230, 260, 180] }, { a: 'frango', q: [90, 100, 100, 110] }, { a: 'azeite', q: [5, 5, 5, 5] }], preparo: "Alho em pó no azeite, sem pedaços." },
  jantar5: { nome: "Arroz, frango e ovo", categoria: 'jantar', itens: [{ a: 'arroz', q: [210, 240, 260, 170] }, { a: 'frango', q: [110, 120, 130, 130] }, { a: 'ovo', q: [1, 1, 1, 1] }], preparo: "Ovo frito por cima." },
  jantar6: { nome: "Purê com carne moída", categoria: 'jantar', itens: [{ a: 'pure', q: [290, 320, 330, 220] }, { a: 'moida', q: [110, 120, 130, 130] }], preparo: "Sobra da marmita serve.", receita: 'pureBatata' },
  jantar7: { nome: "Churrasco com arroz", categoria: 'jantar', itens: [{ a: 'picanha', q: [100, 110, 120, 110] }, { a: 'arroz', q: [180, 200, 210, 140] }], preparo: "Picanha na frigideira bem quente." },
  ceia1: { nome: "Vitamina de Mucilon com banana", categoria: 'ceia', itens: [{ a: 'leite', q: [200, 200, 250, 200] }, { a: 'mucilon', q: [15, 20, 20, 10] }, { a: 'banana', q: [1, 1, 1, 1] }], preparo: "Bata e beba devagar.", receita: 'mucilonNoturno' },
  ceia2: { nome: "Vitamina de Farinha Láctea", categoria: 'ceia', itens: [{ a: 'leite', q: [250, 250, 300, 250] }, { a: 'farinhaLactea', q: [25, 30, 30, 20] }], preparo: "Bata e beba devagar.", receita: 'vitaminaFarinhaLactea' },
  ceia3: { nome: "Iogurte batido com aveia e mel", categoria: 'ceia', itens: [{ a: 'iogurte', q: [180, 210, 210, 170] }, { a: 'leite', q: [100, 100, 100, 100] }, { a: 'aveia', q: [20, 20, 25, 15] }, { a: 'mel', q: [10, 10, 10, 10] }], preparo: "Bata até ficar cremoso." },
  ceia4: { nome: "Leite com achocolatado e pasta de amendoim", categoria: 'ceia', itens: [{ a: 'leite', q: [250, 300, 300, 250] }, { a: 'achocolatado', q: [20, 15, 20, 15] }, { a: 'pastaAmendoim', q: [5, 5, 5, 5] }], preparo: "Bata para dissolver a pasta." },
} as const satisfies Record<string, Prato>

export type IdPrato = keyof typeof PRATOS
