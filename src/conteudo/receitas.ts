export interface Receita {
  nome: string
  tipo: 'Shake' | 'Prato' | 'Marmita da semana'
  tempo: string
  rende: string
  ingredientes: readonly string[]
  passos: readonly string[]
}

export const RECEITAS = {
  vitaminaFarinhaLactea: {
    nome: 'Vitamina de Farinha Láctea', tipo: 'Shake', tempo: '3 min', rende: '1 copo',
    ingredientes: ['250 ml de leite integral', '2 colheres de sopa de Farinha Láctea (25 g)'],
    passos: ['Bata no liquidificador por 30 segundos.', 'Para levar: garrafa térmica, bem gelada, e agite antes de beber.', 'Quer mais calorias? Some uma banana ou uma colher de aveia.'],
  },
  mucilonNoturno: {
    nome: 'Vitamina de Mucilon com banana', tipo: 'Shake', tempo: '3 min', rende: '1 copo',
    ingredientes: ['250 ml de leite integral', '2 colheres de sopa de Mucilon (20 g)', '1 banana'],
    passos: ['Bata tudo por 30 segundos.', 'Beba devagar, uns 30 minutos antes de dormir: fecha as calorias do dia sem pesar.'],
  },
  shakePosTreino: {
    nome: 'Vitamina de whey, banana e aveia', tipo: 'Shake', tempo: '3 min', rende: '1 copo grande',
    ingredientes: ['300 ml de leite integral', '1 medida de whey (30 g)', '1 banana', '2 colheres de sopa de aveia', '1 colher de chá de maca peruana (5 g)', '1 colher de chá de creatina (5 g)'],
    passos: ['Bata tudo, deixando a creatina por último.', 'Beba logo depois do treino.', 'A maca é estimulante: use só de manhã.'],
  },
  shakePump: {
    nome: 'Shake de beterraba e guaraná', tipo: 'Shake', tempo: '2 min', rende: '1 copo pequeno',
    ingredientes: ['150 ml de água ou suco de laranja', '1 colher de chá de beterraba em pó (5 g)', '1/2 colher de chá de guaraná em pó (2 g)'],
    passos: ['Misture bem e beba ao acordar, antes do treino.', 'O guaraná tem cafeína: nunca depois das 15h.'],
  },
  panquecaAveia: {
    nome: 'Panqueca de aveia e banana', tipo: 'Prato', tempo: '10 min', rende: '1 porção',
    ingredientes: ['2 ovos', '1 banana amassada', '3 colheres de sopa de aveia'],
    passos: ['Misture tudo com um garfo.', 'Frigideira antiaderente em fogo médio, 2 minutos de cada lado.', 'Dá para fazer duas menores, mais fáceis de virar.'],
  },
  omelete: {
    nome: 'Omelete de queijo', tipo: 'Prato', tempo: '8 min', rende: '1 porção',
    ingredientes: ['3 ovos', '2 fatias de mussarela', '1 pitada de sal'],
    passos: ['Bata os ovos com o sal.', 'Despeje na frigideira untada, fogo médio.', 'Quando firmar por baixo, ponha o queijo, dobre e tampe por 1 minuto.'],
  },
  hamburguer: {
    nome: 'Hambúrguer caseiro', tipo: 'Prato', tempo: '12 min', rende: '1 porção',
    ingredientes: ['150 g de carne moída crua', '1 pão francês', '1 fatia de mussarela', 'Sal'],
    passos: ['Modele um disco e salgue só por fora.', 'Frigideira bem quente, 4 minutos de cada lado, sem apertar.', 'Queijo por cima no último minuto. Pão aquecido na mesma frigideira.'],
  },
  frangoCremoso: {
    nome: 'Frango cremoso com requeijão', tipo: 'Prato', tempo: '15 min', rende: '1 porção',
    ingredientes: ['150 g de peito de frango cru em cubos', '1 colher de sopa cheia de requeijão', '3 colheres de sopa de molho de tomate liso', 'Sal, alho em pó e páprica'],
    passos: ['Tempere e grelhe o frango por 8 minutos.', 'Baixe o fogo, junte o molho e o requeijão e mexa por 2 minutos.', 'Sirva sobre o macarrão.'],
  },
  estrogonofe: {
    nome: 'Estrogonofe de frango', tipo: 'Marmita da semana', tempo: '25 min', rende: '4 porções',
    ingredientes: ['700 g de peito de frango cru em cubos', '1 caixinha de creme de leite (200 g)', '4 colheres de sopa de molho de tomate liso', '1 colher de sopa de azeite', 'Sal, alho em pó e páprica'],
    passos: ['Tempere o frango e doure no azeite, em duas levas.', 'Junte o molho de tomate e deixe 3 minutos.', 'Desligue o fogo e misture o creme de leite.', 'Guarde separado do arroz. Dura 3 dias na geladeira.'],
  },
  lasanha: {
    nome: 'Lasanha de carne moída', tipo: 'Marmita da semana', tempo: '50 min', rende: '4 porções',
    ingredientes: ['300 g de massa de lasanha direto ao forno', '550 g de carne moída crua', '340 g de molho de tomate liso (1 sachê)', '8 fatias de mussarela', '8 fatias de presunto', '1 copo de água', 'Sal e alho em pó'],
    passos: ['Doure a carne, junte o molho e a água e deixe 5 minutos: o molho precisa ficar ralo para cozinhar a massa.', 'Em uma travessa: molho, massa, presunto, queijo. Repita e termine com molho e queijo.', 'Forno a 200 graus, 30 minutos coberta com papel-alumínio e 10 sem ele.', 'Espere esfriar para cortar. Dura 4 dias na geladeira e congela bem.'],
  },
  batataAssada: {
    nome: 'Batata assada crocante', tipo: 'Prato', tempo: '25 min', rende: '2 porções',
    ingredientes: ['350 g de batata em gomos', '1 colher de sopa de azeite', 'Sal e páprica'],
    passos: ['Seque bem a batata e misture com azeite e tempero.', 'Airfryer a 200 graus por 20 a 25 minutos, sacudindo na metade.', 'Na Fase 4, é ela que substitui a batata frita.'],
  },
  carneMoida: {
    nome: 'Carne moída da semana', tipo: 'Marmita da semana', tempo: '25 min', rende: '5 porções',
    ingredientes: ['800 g de carne moída crua', '1 colher de sopa de azeite', '1 colher de chá de sal', 'Alho em pó, páprica e cominho'],
    passos: ['Panela larga bem quente com o azeite.', 'Coloque a carne em duas levas, para dourar em vez de cozinhar na água.', 'Tempere e mexa por 10 minutos.', 'Divida em 5 potes. Dura 4 dias na geladeira; congele o quinto.'],
  },
  bolonhesa: {
    nome: 'Molho à bolonhesa', tipo: 'Marmita da semana', tempo: '25 min', rende: '4 porções',
    ingredientes: ['550 g de carne moída crua', '320 g de molho de tomate liso (1 sachê)', '1 colher de sopa de azeite', 'Sal e alho em pó'],
    passos: ['Doure a carne no azeite por 8 minutos.', 'Junte o molho e deixe 8 minutos em fogo baixo.', 'Guarde o molho separado do macarrão: ele fica melhor cozido na véspera.'],
  },
  pureBatata: {
    nome: 'Purê de batata', tipo: 'Marmita da semana', tempo: '25 min', rende: '4 porções',
    ingredientes: ['800 g de batata descascada', '100 ml de leite quente', '1 colher de sopa de manteiga', 'Sal'],
    passos: ['Cozinhe a batata em água com sal por 15 minutos.', 'Escorra e amasse ainda quente com leite e manteiga, até ficar liso.', 'Dura 3 dias na geladeira. Para o escondidinho: carne embaixo, purê em cima e queijo.'],
  },
  arrozDaSemana: {
    nome: 'Arroz para a semana', tipo: 'Marmita da semana', tempo: '25 min', rende: '10 porções',
    ingredientes: ['3 xícaras de arroz cru (550 g)', '6 xícaras de água', '1 colher de sopa de azeite', '1 colher de chá de sal'],
    passos: ['Refogue o arroz no azeite por 1 minuto.', 'Junte a água fervente e o sal, tampe e deixe em fogo baixo por 15 minutos.', 'Desligue e deixe 5 minutos tampado.', 'Metade vai para a geladeira; a outra metade, em porções, para o congelador.'],
  },
  frangoDaSemana: {
    nome: 'Frango grelhado para a semana', tipo: 'Marmita da semana', tempo: '20 min', rende: '5 porções',
    ingredientes: ['900 g de peito de frango cru em cubos', '1 colher de sopa de azeite', 'Sal, alho em pó e páprica'],
    passos: ['Tempere o frango e deixe 10 minutos.', 'Grelhe em duas levas, 4 minutos de cada lado.', 'Parte em cubos para a marmita, parte desfiada com requeijão para o sanduíche.'],
  },
} as const satisfies Record<string, Receita>

export type IdReceita = keyof typeof RECEITAS
