/**
 * Tabela de alimentos. Valores por 100 g (ou 100 ml) do alimento pronto para comer.
 * Fonte: TACO 4ª edição (NEPA/Unicamp), conferida item a item em 2026-11-12.
 * Fora da TACO, por rótulo ou estimativa: leite integral líquido, macarrão cozido (derivado do cru), purê, pizza,
 * esfiha, Mucilon, pasta de amendoim, whey, maca e beterraba em pó. Pão de forma usa a linha do integral.
 * Trate os totais como guia: a margem real, somando porção e preparo, é de cerca de 10%.
 * Lista fechada de propósito. Desde a versão 2 entram alface e tomate no lanche, cenoura ralada ou batida e a salada caesar;
 * peixe, fruto do mar, feijão, verdura cozida e legume em pedaço continuam fora.
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
  // esfiha de frango: valor médio de rótulo de padaria (2026-11-13), fora da TACO
  esfihaFrango: { nome: 'Esfiha de frango', kcal: 245, p: 11.0, c: 31.0, g: 8.5, medida: { singular: 'unidade', plural: 'unidades', gramas: 80 }, classe: 'carbo', setor: 'Padaria' },
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
  // ---- ampliação para variedade: conferida na TACO em 2026-11-12. Fora da TACO, por rótulo ou estimativa:
  // goma de tapioca, granola, bisnaguinha, pão de hambúrguer, wrap, barra de cereal, geleia, peito de peru, salsicha.
  // Calabresa usa a linha de linguiça de porco grelhada; bolo usa a de bolo de milho.
  tapioca: { nome: 'Tapioca (goma hidratada)', kcal: 240, p: 0, c: 60, g: 0, medida: 'g', classe: 'carbo', setor: 'Mercearia', compra: 'Goma de tapioca' },
  cuscuz: { nome: 'Cuscuz de milho', kcal: 113, p: 2.2, c: 25.3, g: 0.7, medida: 'g', classe: 'carbo', setor: 'Mercearia', compra: 'Flocão de milho', fatorCompra: 0.4 },
  polenta: { nome: 'Polenta cremosa', kcal: 103, p: 2.3, c: 23.3, g: 0.3, medida: 'g', classe: 'carbo', setor: 'Mercearia', compra: 'Fubá', fatorCompra: 0.25 },
  nhoque: { nome: 'Nhoque de batata cozido', kcal: 181, p: 5.9, c: 36.8, g: 1.9, medida: 'g', classe: 'carbo', setor: 'Mercearia', compra: 'Nhoque de batata' },
  granola: { nome: 'Granola', kcal: 420, p: 10.0, c: 68.0, g: 12.0, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  cerealMatinal: { nome: 'Cereal matinal de milho', kcal: 365, p: 7.2, c: 83.8, g: 1.0, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  torrada: { nome: 'Torrada', kcal: 377, p: 10.5, c: 74.6, g: 3.3, medida: un('torrada', 'torradas', 10), classe: 'carbo', setor: 'Padaria' },
  bolo: { nome: 'Bolo simples', kcal: 311, p: 4.8, c: 45.1, g: 12.4, medida: un('fatia', 'fatias', 60), classe: 'carbo', setor: 'Padaria' },
  maisena: { nome: 'Biscoito maisena', kcal: 443, p: 8.1, c: 75.2, g: 12.0, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  bisnaguinha: { nome: 'Bisnaguinha', kcal: 300, p: 8.0, c: 55.0, g: 5.0, medida: un('unidade', 'unidades', 20), classe: 'carbo', setor: 'Padaria' },
  paoHamburguer: { nome: 'Pão de hambúrguer', kcal: 280, p: 9.0, c: 50.0, g: 4.0, medida: un('pão', 'pães', 50), classe: 'carbo', setor: 'Padaria' },
  wrap: { nome: 'Massa de wrap ou panqueca', kcal: 290, p: 8.0, c: 50.0, g: 6.0, medida: un('disco', 'discos', 40), classe: 'carbo', setor: 'Padaria' },
  barraCereal: { nome: 'Barra de cereal', kcal: 400, p: 5.0, c: 75.0, g: 9.0, medida: un('barra', 'barras', 22), classe: 'carbo', setor: 'Mercearia' },
  pacoca: { nome: 'Paçoca', kcal: 487, p: 16.0, c: 52.4, g: 26.1, medida: un('unidade', 'unidades', 20), classe: 'carbo', setor: 'Mercearia' },
  amendoim: { nome: 'Amendoim torrado', kcal: 606, p: 22.5, c: 18.7, g: 54.0, medida: 'g', classe: 'gordura', setor: 'Mercearia' },
  doceLeite: { nome: 'Doce de leite', kcal: 306, p: 5.5, c: 59.5, g: 6.0, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  goiabada: { nome: 'Goiabada', kcal: 286, p: 0.4, c: 78.7, g: 0.1, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  geleia: { nome: 'Geleia de fruta', kcal: 250, p: 0.3, c: 65.0, g: 0, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  leitePo: { nome: 'Leite em pó integral', kcal: 497, p: 25.4, c: 39.2, g: 26.9, medida: 'g', classe: 'laticinio', setor: 'Mercearia' },
  leiteCondensado: { nome: 'Leite condensado', kcal: 313, p: 7.7, c: 57.0, g: 6.7, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  queijoPrato: { nome: 'Queijo prato', kcal: 360, p: 22.7, c: 1.9, g: 29.1, medida: un('fatia', 'fatias', 20), classe: 'proteina', setor: 'Frios e laticínios' },
  peitoPeru: { nome: 'Peito de peru', kcal: 105, p: 20.0, c: 2.0, g: 2.0, medida: un('fatia', 'fatias', 15), classe: 'proteina', setor: 'Frios e laticínios' },
  mortadela: { nome: 'Mortadela', kcal: 269, p: 12.0, c: 5.8, g: 21.6, medida: un('fatia', 'fatias', 15), classe: 'proteina', setor: 'Frios e laticínios' },
  salsicha: { nome: 'Salsicha', kcal: 257, p: 13.0, c: 2.0, g: 22.0, medida: un('salsicha', 'salsichas', 50), classe: 'proteina', setor: 'Frios e laticínios' },
  linguica: { nome: 'Linguiça de frango grelhada', kcal: 244, p: 18.2, c: 0, g: 18.5, medida: 'g', classe: 'proteina', setor: 'Açougue', compra: 'Linguiça de frango (crua)', fatorCompra: 1.3 },
  calabresa: { nome: 'Linguiça calabresa', kcal: 296, p: 23.2, c: 0, g: 21.9, medida: 'g', classe: 'proteina', setor: 'Açougue' },
  lombo: { nome: 'Lombo de porco assado', kcal: 210, p: 35.7, c: 0, g: 6.4, medida: 'g', classe: 'proteina', setor: 'Açougue', compra: 'Lombo de porco (cru)', fatorCompra: 1.4 },
  bisteca: { nome: 'Bisteca de porco grelhada', kcal: 280, p: 28.9, c: 0, g: 17.4, medida: 'g', classe: 'proteina', setor: 'Açougue', compra: 'Bisteca de porco (crua)', fatorCompra: 1.6 },
  costela: { nome: 'Costela bovina assada', kcal: 373, p: 28.8, c: 0, g: 27.7, medida: 'g', classe: 'proteina', setor: 'Açougue', compra: 'Costela bovina (crua, com osso)', fatorCompra: 2.2 },
  carnePanela: { nome: 'Carne de panela', kcal: 194, p: 31.2, c: 0, g: 6.7, medida: 'g', classe: 'proteina', setor: 'Açougue', compra: 'Músculo ou acém em cubos (cru)', fatorCompra: 1.5 },
  coxa: { nome: 'Coxa de frango assada', kcal: 215, p: 28.5, c: 0, g: 10.4, medida: 'g', classe: 'proteina', setor: 'Açougue', compra: 'Coxa de frango (crua, com osso)', fatorCompra: 1.9 },
  milanesaFrango: { nome: 'Filé de frango à milanesa', kcal: 221, p: 28.5, c: 7.5, g: 7.8, medida: 'g', classe: 'proteina', setor: 'Açougue', compra: 'Filé de frango para empanar (cru)', fatorCompra: 1.1 },
  milanesaBoi: { nome: 'Bife à milanesa', kcal: 352, p: 20.6, c: 12.2, g: 24.0, medida: 'g', classe: 'proteina', setor: 'Açougue', compra: 'Bife para empanar (cru)', fatorCompra: 1.1 },
  macaFruta: { nome: 'Maçã', kcal: 56, p: 0.3, c: 15.2, g: 0, medida: un('maçã', 'maçãs', 130), classe: 'carbo', setor: 'Hortifruti' },
  morango: { nome: 'Morango', kcal: 30, p: 0.9, c: 6.8, g: 0.3, medida: 'g', classe: 'carbo', setor: 'Hortifruti' },
  manga: { nome: 'Manga', kcal: 72, p: 0.4, c: 19.4, g: 0.2, medida: 'g', classe: 'carbo', setor: 'Hortifruti' },
  abacate: { nome: 'Abacate', kcal: 96, p: 1.2, c: 6.0, g: 8.4, medida: 'g', classe: 'gordura', setor: 'Hortifruti' },
  mamao: { nome: 'Mamão', kcal: 40, p: 0.5, c: 10.4, g: 0.1, medida: 'g', classe: 'carbo', setor: 'Hortifruti' },
  whey: { nome: 'Whey protein', kcal: 400, p: 80.0, c: 7.0, g: 6.0, medida: 'g', classe: 'suplemento', setor: 'Suplementos' },
  creatina: { nome: 'Creatina', kcal: 0, p: 0, c: 0, g: 0, medida: 'g', classe: 'suplemento', setor: 'Suplementos' },
  guarana: { nome: 'Guaraná em pó', kcal: 0, p: 0, c: 0, g: 0, medida: 'g', classe: 'suplemento', setor: 'Suplementos', cafeina: true },
  maca: { nome: 'Maca peruana em pó', kcal: 325, p: 14.0, c: 60.0, g: 2.0, medida: 'g', classe: 'suplemento', setor: 'Suplementos' },
  beterraba: { nome: 'Beterraba em pó', kcal: 300, p: 10.0, c: 65.0, g: 0.5, medida: 'g', classe: 'suplemento', setor: 'Suplementos' },
  // ---- versão 2 (receitas e besteiras planejadas): conferida em 2026-11-13. Da TACO: alface crespa crua, tomate com semente cru,
  // cenoura crua, carne seca cozida (fator de compra estimado), parmesão, açaí (polpa congelada), farinha de trigo, farinha de rosca,
  // maionese tradicional, chocolate ao leite, coxinha frita e empada de frango assada. Fora da TACO, por rótulo ou estimativa:
  // catupiry, croutons, massa de pizza, ketchup, batata palha, queijo coalho, joelho, pão de cachorro-quente, pão sírio e bacon
  // (bacon frito usa a média de tabelas internacionais; a TACO só tem toucinho). Pesos das unidades são estimativas de padaria. ----
  alface: { nome: 'Alface', kcal: 11, p: 1.3, c: 1.7, g: 0.2, medida: un('folha', 'folhas', 10), classe: 'outro', setor: 'Hortifruti' },
  tomate: { nome: 'Tomate', kcal: 15, p: 1.1, c: 3.1, g: 0.2, medida: un('rodela', 'rodelas', 20), classe: 'outro', setor: 'Hortifruti' },
  cenoura: { nome: 'Cenoura ralada', kcal: 34, p: 1.3, c: 7.7, g: 0.2, medida: 'g', classe: 'outro', setor: 'Hortifruti', compra: 'Cenoura' },
  catupiry: { nome: 'Requeijão cremoso tipo catupiry', kcal: 260, p: 9.0, c: 3.0, g: 24.0, medida: 'g', classe: 'gordura', setor: 'Frios e laticínios' },
  carneSeca: { nome: 'Carne seca desfiada', kcal: 313, p: 26.9, c: 0, g: 21.9, medida: 'g', classe: 'proteina', setor: 'Açougue', compra: 'Carne seca (crua)', fatorCompra: 1.25 },
  parmesao: { nome: 'Queijo parmesão ralado', kcal: 453, p: 35.6, c: 1.7, g: 33.5, medida: 'g', classe: 'proteina', setor: 'Frios e laticínios' },
  crouton: { nome: 'Croutons', kcal: 410, p: 11.0, c: 70.0, g: 9.0, medida: 'g', classe: 'carbo', setor: 'Padaria' },
  acai: { nome: 'Polpa de açaí', kcal: 58, p: 0.8, c: 6.2, g: 3.9, medida: 'g', classe: 'gordura', setor: 'Hortifruti' },
  massaPizza: { nome: 'Massa de pizza', kcal: 270, p: 8.0, c: 52.0, g: 3.0, medida: un('disco', 'discos', 110), classe: 'carbo', setor: 'Padaria' },
  farinhaTrigo: { nome: 'Farinha de trigo', kcal: 360, p: 9.8, c: 75.1, g: 1.4, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  farinhaRosca: { nome: 'Farinha de rosca', kcal: 371, p: 11.4, c: 75.8, g: 1.5, medida: 'g', classe: 'carbo', setor: 'Mercearia' },
  maionese: { nome: 'Maionese', kcal: 302, p: 0.6, c: 7.9, g: 30.5, medida: 'g', classe: 'gordura', setor: 'Mercearia' },
  ketchup: { nome: 'Ketchup', kcal: 110, p: 1.0, c: 26.0, g: 0.1, medida: 'g', classe: 'outro', setor: 'Mercearia' },
  batataPalha: { nome: 'Batata palha', kcal: 540, p: 6.0, c: 52.0, g: 34.0, medida: 'g', classe: 'gordura', setor: 'Mercearia' },
  queijoCoalho: { nome: 'Queijo coalho', kcal: 330, p: 23.3, c: 3.0, g: 24.5, medida: un('espeto', 'espetos', 50), classe: 'proteina', setor: 'Frios e laticínios' },
  chocolate: { nome: 'Chocolate ao leite', kcal: 540, p: 7.2, c: 59.6, g: 30.3, medida: 'g', classe: 'gordura', setor: 'Mercearia' },
  coxinha: { nome: 'Coxinha de frango', kcal: 283, p: 9.6, c: 34.5, g: 11.8, medida: un('coxinha pequena', 'coxinhas pequenas', 40), classe: 'carbo', setor: 'Padaria' },
  joelho: { nome: 'Joelho de presunto e queijo', kcal: 300, p: 11.0, c: 38.0, g: 11.0, medida: un('joelho pequeno', 'joelhos pequenos', 50), classe: 'carbo', setor: 'Padaria' },
  empada: { nome: 'Empada de frango', kcal: 358, p: 6.9, c: 47.5, g: 15.6, medida: un('empadinha', 'empadinhas', 35), classe: 'carbo', setor: 'Padaria' },
  paoHotDog: { nome: 'Pão de cachorro-quente', kcal: 280, p: 9.0, c: 50.0, g: 4.0, medida: un('pão', 'pães', 50), classe: 'carbo', setor: 'Padaria' },
  paoSirio: { nome: 'Pão sírio', kcal: 275, p: 9.1, c: 55.7, g: 1.2, medida: un('pão', 'pães', 60), classe: 'carbo', setor: 'Padaria' },
  bacon: { nome: 'Bacon frito', kcal: 541, p: 37.0, c: 1.4, g: 42.0, medida: 'g', classe: 'gordura', setor: 'Frios e laticínios' },
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

/**
 * Termos que nunca podem aparecer em nome de alimento, prato ou receita.
 * Desde a versão 2 entram alface e tomate no lanche, cenoura ralada ou batida e a salada caesar; prato de salada solta continua fora.
 */
export const PROIBIDOS = /feij|verdura|salada(?! caesar)|couve|br[oó]colis|abobrinha|chuchu|vagem|ervilha|legume|peixe|atum|sardinha|salm[aã]o|til[aá]pia|camar[aã]o|fruto do mar|lula|polvo|mexilh/i
