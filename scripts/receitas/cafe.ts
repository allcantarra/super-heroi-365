import type { PratoNovo, ReceitaDoPrato } from './tipos.ts'

const SHAKE = 'Bata no liquidificador o leite, o whey e a creatina por 20 segundos.'
const SHAKE_FINAL = 'Bata o shake de whey e creatina no leite e beba junto.'

/** Receita de cada prato atual desta categoria, pelo id. */
export const RECEITAS: Record<string, ReceitaDoPrato> = {
  cafe1: {
    tempo: 10,
    passos: [
      'Bata os ovos com uma pitada de sal.',
      'Despeje em frigideira antiaderente em fogo baixo e mexa sem parar por 2 a 3 minutos, até firmar cremoso.',
      'Abra o pão francês ao meio e aqueça na frigideira ou na sanduicheira por 1 minuto.',
      SHAKE,
    ],
    etiquetas: ['salgado', 'vegetariano'],
    temperos: ['sal'],
  },
  cafe2: {
    tempo: 4,
    passos: [
      'Coloque no liquidificador o leite, a banana, a aveia, o whey e a maca.',
      'Bata por 30 segundos.',
      'Junte a creatina por último e bata mais 5 segundos.',
      'Beba logo depois do treino.',
    ],
    etiquetas: ['doce', 'vegetariano'],
  },
  cafe3: {
    tempo: 8,
    passos: [
      'Monte o sanduíche: pão, presunto e mussarela, outra fatia de pão.',
      'Leve à sanduicheira por 3 a 4 minutos, até dourar e o queijo derreter.',
      SHAKE,
      'Corte ao meio e coma com o shake.',
    ],
    etiquetas: ['salgado'],
  },
  cafe4: {
    tempo: 12,
    passos: [
      'Amasse a banana com um garfo e misture com os ovos e a aveia.',
      'Aqueça a frigideira antiaderente em fogo médio.',
      'Despeje a massa e deixe 2 minutos de cada lado, até dourar.',
      'Bata no liquidificador o leite, o whey e a creatina.',
      'Sirva a panqueca com o shake.',
    ],
    etiquetas: ['doce', 'vegetariano'],
    temperos: ['canela'],
  },
  cafe5: {
    tempo: 15,
    passos: [
      'Leve os pães de queijo à airfryer a 180 graus por 8 minutos, ou ao forno a 200 graus por 12 minutos, se forem congelados.',
      'Bata no liquidificador o leite, o achocolatado, o whey e a creatina.',
      'Sirva os pães quentes com o shake.',
    ],
    etiquetas: ['salgado', 'vegetariano'],
  },
  cafe6: {
    tempo: 10,
    passos: [
      'Frite o ovo em frigideira antiaderente com uma pitada de sal, até a clara firmar.',
      'Torre as fatias de pão na frigideira ou na torradeira.',
      'Monte o sanduíche com o ovo e a mussarela; aqueça 1 minuto para derreter o queijo.',
      SHAKE,
    ],
    etiquetas: ['salgado', 'vegetariano'],
    temperos: ['sal'],
  },
  cafe7: {
    tempo: 10,
    passos: [
      'Espalhe a goma de tapioca em frigideira antiaderente seca, em fogo médio, formando um disco.',
      'Quando firmar, 1 minuto, vire por mais 30 segundos.',
      'Em outra frigideira, frite o ovo com uma pitada de sal.',
      'Recheie a tapioca com o ovo e a mussarela, dobre e deixe 1 minuto para derreter.',
      SHAKE,
    ],
    etiquetas: ['salgado', 'vegetariano'],
    temperos: ['sal'],
  },
  cafe8: {
    tempo: 10,
    passos: [
      'Misture o flocão com uma pitada de sal e água suficiente para umedecer, cerca de meio copo; deixe 2 minutos.',
      'Cozinhe no micro-ondas em pote tampado por 3 minutos.',
      'Mexa os ovos na frigideira antiaderente em fogo baixo por 2 a 3 minutos.',
      'Sirva o cuscuz com os ovos por cima.',
      SHAKE,
    ],
    etiquetas: ['salgado', 'vegetariano'],
    temperos: ['sal', 'água'],
  },
  cafe9: {
    tempo: 6,
    passos: [
      'Abra o pão francês ao meio e aqueça na frigideira ou na sanduicheira por 1 minuto.',
      'Recheie com o queijo minas em fatias.',
      SHAKE,
    ],
    etiquetas: ['salgado', 'vegetariano'],
  },
  cafe10: {
    tempo: 8,
    passos: [
      'Aqueça o leite no micro-ondas por 2 minutos, sem ferver.',
      'Misture a aveia e cozinhe mais 1 minuto, mexendo.',
      'Deixe amornar 2 minutos e junte o whey e a creatina, mexendo bem.',
      'Corte a banana por cima.',
    ],
    etiquetas: ['doce', 'vegetariano'],
    temperos: ['canela'],
  },
  cafe11: {
    tempo: 10,
    passos: [
      'Bata os ovos com uma pitada de sal.',
      'Despeje em frigideira antiaderente em fogo médio e distribua o presunto picado e a mussarela.',
      'Dobre a omelete quando firmar por baixo e tampe por 1 minuto.',
      'Torre a torrada.',
      SHAKE,
    ],
    etiquetas: ['salgado'],
    temperos: ['sal'],
  },
  cafe12: {
    tempo: 6,
    passos: [
      'Passe o requeijão nas fatias de pão.',
      'Distribua o peito de peru e feche o sanduíche.',
      'Se quiser quente, aqueça 3 minutos na sanduicheira.',
      SHAKE,
    ],
    etiquetas: ['salgado'],
  },
  cafe13: {
    tempo: 5,
    passos: [
      'Misture o whey e a creatina no iogurte até ficar liso.',
      'Corte a banana em rodelas.',
      'Monte no pote: iogurte, banana e granola por cima, para não amolecer.',
    ],
    etiquetas: ['doce', 'vegetariano'],
  },
  cafe14: {
    tempo: 10,
    passos: [
      'Misture a goma de tapioca com os ovos e uma pitada de sal.',
      'Despeje em frigideira antiaderente em fogo médio e espalhe em disco.',
      'Quando firmar embaixo, 2 minutos, ponha o queijo prato, dobre e deixe 1 minuto.',
      SHAKE_FINAL,
    ],
    etiquetas: ['salgado', 'vegetariano'],
    temperos: ['sal'],
  },
  cafe15: {
    tempo: 10,
    passos: [
      'Bata os ovos com uma pitada de sal.',
      'Mexa na frigideira antiaderente em fogo baixo por 2 a 3 minutos.',
      'Torre as torradas e sirva os ovos por cima.',
      SHAKE,
    ],
    etiquetas: ['salgado', 'vegetariano'],
    temperos: ['sal'],
  },
  cafe16: {
    tempo: 4,
    passos: [
      'Lave os morangos e tire as folhas.',
      'Coloque no liquidificador o leite, os morangos, a aveia e o whey.',
      'Bata por 40 segundos e junte a creatina por último.',
    ],
    etiquetas: ['doce', 'vegetariano'],
  },
  cafe17: {
    tempo: 8,
    passos: [
      'Abra o pão francês ao meio e passe a manteiga nas duas metades.',
      'Doure na frigideira antiaderente em fogo médio, com o lado da manteiga para baixo, por 2 minutos.',
      'Bata no liquidificador o leite, o achocolatado, o whey e a creatina.',
      'Sirva o pão quente com o shake.',
    ],
    etiquetas: ['salgado', 'vegetariano'],
  },
  cafe18: {
    tempo: 10,
    passos: [
      'Frite o ovo em frigideira antiaderente com uma pitada de sal.',
      'Monte o sanduíche com o ovo e o queijo prato entre as fatias de pão.',
      'Leve à sanduicheira por 3 minutos, até o queijo derreter.',
      SHAKE,
    ],
    etiquetas: ['salgado', 'vegetariano'],
    temperos: ['sal'],
  },
  cafe19: {
    tempo: 5,
    passos: [
      'Bata o leite com o whey e a creatina até dissolver.',
      'Despeje numa tigela e junte o cereal.',
      'Corte a banana por cima e coma na hora, para o cereal não amolecer.',
    ],
    etiquetas: ['doce', 'vegetariano'],
  },
  cafe20: {
    tempo: 4,
    passos: [
      'Tire a polpa do abacate e coloque no liquidificador.',
      'Junte o leite, o mel e o whey.',
      'Bata por 40 segundos e acrescente a creatina por último.',
    ],
    etiquetas: ['doce', 'vegetariano'],
  },
  cafe21: {
    tempo: 5,
    passos: [
      'Bata o leite com o whey e a creatina por 20 segundos.',
      'Sirva a fatia de bolo e a banana ao lado.',
      'Coma e beba o shake em seguida.',
    ],
    etiquetas: ['doce', 'vegetariano'],
  },
  cafe22: {
    tempo: 10,
    passos: [
      'Misture o flocão com uma pitada de sal e meio copo de água; deixe 2 minutos.',
      'Cozinhe no micro-ondas em pote tampado por 3 minutos.',
      'Corte o queijo minas em cubos e misture ao cuscuz quente para amolecer.',
      SHAKE,
    ],
    etiquetas: ['salgado', 'vegetariano'],
    temperos: ['sal', 'água'],
  },
  cafe23: {
    tempo: 14,
    passos: [
      'Leve os pães de queijo à airfryer a 180 graus por 8 minutos, ou ao forno a 200 graus por 12 minutos, se forem congelados.',
      'Frite o ovo em frigideira antiaderente com uma pitada de sal.',
      SHAKE,
      'Coma o ovo com os pães de queijo e o shake.',
    ],
    etiquetas: ['salgado', 'vegetariano'],
    temperos: ['sal'],
  },
  cafe24: {
    tempo: 8,
    passos: [
      'Aqueça o leite no micro-ondas por 2 minutos, sem ferver.',
      'Misture o Mucilon e cozinhe mais 1 minuto, mexendo.',
      'Deixe amornar 2 minutos e junte o whey e a creatina, mexendo bem.',
      'Corte a banana por cima.',
    ],
    etiquetas: ['doce', 'vegetariano'],
    temperos: ['canela'],
  },
  cafe25: {
    tempo: 8,
    passos: [
      'Abra as bisnaguinhas ao meio.',
      'Recheie cada uma com presunto e mussarela.',
      'Leve à sanduicheira por 2 a 3 minutos, ou aqueça no micro-ondas por 20 segundos.',
      SHAKE,
    ],
    etiquetas: ['salgado'],
  },
  cafe26: {
    tempo: 4,
    passos: [
      'Corte o mamão em cubos, sem casca nem sementes.',
      'Coloque no liquidificador com o leite, a aveia e o whey.',
      'Bata por 40 segundos e junte a creatina por último.',
    ],
    etiquetas: ['doce', 'vegetariano'],
  },
  cafe27: {
    tempo: 10,
    passos: [
      'Frite o ovo em frigideira antiaderente com uma pitada de sal.',
      'Aqueça o disco de wrap 20 segundos na frigideira.',
      'Coloque o ovo e a mussarela no centro, dobre e deixe 1 minuto para derreter.',
      SHAKE,
    ],
    etiquetas: ['salgado', 'vegetariano'],
    temperos: ['sal'],
  },
  cafe28: {
    tempo: 6,
    passos: [
      'Torre as fatias de pão, se quiser.',
      'Passe a pasta de amendoim e coloque a banana em rodelas.',
      'Feche o sanduíche.',
      SHAKE,
    ],
    etiquetas: ['doce', 'vegetariano'],
  },
  cafe29: {
    tempo: 5,
    passos: [
      'Coloque no liquidificador o iogurte, a banana, o mel, a aveia e o whey.',
      'Bata por 40 segundos.',
      'Junte a creatina por último e bata mais 5 segundos.',
    ],
    etiquetas: ['doce', 'vegetariano'],
  },
  cafe30: {
    tempo: 10,
    passos: [
      'Bata os ovos com uma pitada de sal.',
      'Mexa na frigideira antiaderente em fogo baixo e, quando estiver quase firme, junte a mussarela picada.',
      'Torre as torradas e sirva os ovos por cima.',
      SHAKE,
    ],
    etiquetas: ['salgado', 'vegetariano'],
    temperos: ['sal'],
  },
}

/** Pratos novos desta categoria. */
export const NOVOS: PratoNovo[] = [
  {
    id: 'cafe31',
    nome: 'Tapioca de frango com catupiry e shake de whey',
    itens: [['tapioca', 60], ['frango', 50], ['catupiry', 20], ['leite', 200], ['whey', 30], ['creatina', 5]],
    preparo: 'Tapioca recheada com frango desfiado e catupiry, shake de whey ao lado.',
    tempo: 10,
    passos: [
      'Desfie o frango (use o da marmita ou aqueça 1 minuto no micro-ondas) e misture com o catupiry e uma pitada de sal.',
      'Espalhe a goma de tapioca em frigideira antiaderente seca, em fogo médio, formando um disco.',
      'Quando firmar, 1 minuto, vire por 30 segundos.',
      'Recheie com o frango, dobre ao meio e deixe 30 segundos.',
      SHAKE,
    ],
    etiquetas: ['salgado'],
    temperos: ['sal'],
  },
  {
    id: 'cafe32',
    nome: 'Tapioca de queijo coalho e shake de whey',
    itens: [['tapioca', 60], ['queijoCoalho', 1], ['leite', 200], ['whey', 30], ['creatina', 5]],
    preparo: 'Tapioca recheada com queijo coalho derretido, shake de whey ao lado.',
    tempo: 10,
    passos: [
      'Corte o queijo coalho em fatias finas.',
      'Espalhe a goma de tapioca em frigideira antiaderente seca, em fogo médio, formando um disco.',
      'Quando firmar, 1 minuto, vire e distribua o queijo em metade do disco.',
      'Dobre e deixe 1 minuto, até o queijo amolecer.',
      SHAKE,
    ],
    etiquetas: ['salgado', 'vegetariano'],
  },
  {
    id: 'cafe33',
    nome: 'Tapioca de presunto e queijo e shake de whey',
    itens: [['tapioca', 60], ['presunto', 2], ['mussarela', 1], ['leite', 200], ['whey', 30], ['creatina', 5]],
    preparo: 'Tapioca recheada com presunto e mussarela, shake de whey ao lado.',
    tempo: 8,
    passos: [
      'Espalhe a goma de tapioca em frigideira antiaderente seca, em fogo médio, formando um disco.',
      'Quando firmar, 1 minuto, vire e cubra metade com o presunto e a mussarela.',
      'Dobre e deixe 1 minuto, até o queijo derreter.',
      SHAKE,
    ],
    etiquetas: ['salgado'],
  },
  {
    id: 'cafe34',
    nome: 'Crepioca de frango com catupiry e shake de whey',
    itens: [['tapioca', 30], ['ovo', 2], ['frango', 40], ['catupiry', 15], ['leite', 150], ['whey', 30], ['creatina', 5]],
    preparo: 'Crepioca recheada com frango e catupiry, shake de whey ao lado.',
    tempo: 12,
    passos: [
      'Desfie o frango e misture com o catupiry.',
      'Bata os ovos com a goma de tapioca e uma pitada de sal.',
      'Despeje em frigideira antiaderente em fogo médio e espalhe em disco.',
      'Quando firmar embaixo, 2 minutos, vire por 1 minuto.',
      'Recheie com o frango, dobre e deixe 30 segundos.',
      SHAKE_FINAL,
    ],
    etiquetas: ['salgado'],
    temperos: ['sal'],
  },
  {
    id: 'cafe35',
    nome: 'Cuscuz recheado com ovo e queijo e shake de whey',
    itens: [['cuscuz', 150], ['ovo', 2], ['mussarela', 1], ['leite', 200], ['whey', 30], ['creatina', 5]],
    preparo: 'Cuscuz com ovo mexido e queijo derretido no meio, shake de whey ao lado.',
    tempo: 12,
    passos: [
      'Misture o flocão com uma pitada de sal e só a água necessária para umedecer; deixe 2 minutos.',
      'Cozinhe no micro-ondas em pote tampado por 3 minutos e solte com um garfo.',
      'Mexa os ovos na frigideira antiaderente em fogo baixo por 2 a 3 minutos.',
      'Monte em camadas no prato: metade do cuscuz, os ovos e a mussarela, e o resto do cuscuz por cima. Deixe 1 minuto tampado para derreter.',
      SHAKE,
    ],
    etiquetas: ['salgado', 'vegetariano'],
    temperos: ['sal', 'água'],
  },
  {
    id: 'cafe36',
    nome: 'Sanduíche natural de frango com cenoura e shake de whey',
    itens: [['paoForma', 2], ['frango', 60], ['cenoura', 20], ['requeijao', 10], ['alface', 2], ['tomate', 2], ['leite', 200], ['whey', 30], ['creatina', 5]],
    preparo: 'Frango desfiado com cenoura ralada e requeijão, com alface e tomate.',
    tempo: 8,
    passos: [
      'Desfie o frango e misture com a cenoura ralada, o requeijão e uma pitada de sal.',
      'Passe a pasta em uma fatia de pão.',
      'Coloque a alface e as rodelas de tomate e feche com a outra fatia.',
      'Corte ao meio na diagonal.',
      SHAKE,
    ],
    etiquetas: ['salgado'],
    temperos: ['sal'],
  },
  {
    id: 'cafe37',
    nome: 'Pão francês na chapa com ovo e queijo e shake de whey',
    itens: [['paoFrances', 1], ['manteiga', 5], ['ovo', 2], ['mussarela', 1], ['leite', 100], ['whey', 30], ['creatina', 5]],
    preparo: 'Pão com manteiga dourado na chapa, recheado com ovo e queijo.',
    tempo: 10,
    passos: [
      'Abra o pão ao meio e passe a manteiga nas duas metades.',
      'Doure na frigideira antiaderente em fogo médio, com o lado da manteiga para baixo, por 2 minutos.',
      'Na mesma frigideira, frite o ovo com uma pitada de sal.',
      'Monte com o ovo e a mussarela e aqueça 1 minuto tampado, para derreter.',
      SHAKE,
    ],
    etiquetas: ['salgado', 'vegetariano'],
    temperos: ['sal'],
  },
]
