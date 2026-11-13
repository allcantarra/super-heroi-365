import type { PratoNovo, ReceitaDoPrato } from './tipos.ts'

const POS = 'Misture a beterraba e o guaraná em pó em meio copo de água e beba junto.'
const POS_BATIDO = 'Junte a beterraba e o guaraná em pó no liquidificador.'
const AGUA = ['água']

/** Receita de cada prato atual desta categoria, pelo id. */
export const RECEITAS: Record<string, ReceitaDoPrato> = {
  pre1: { tempo: 3, passos: ['Descasque a banana.', 'Passe a pasta de amendoim em fio sobre a banana, ou mergulhe cada pedaço na pasta.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre2: { tempo: 3, passos: ['Passe o mel em uma fatia de pão de forma.', 'Cubra com a outra fatia e feche como sanduíche.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre3: { tempo: 3, passos: ['Coloque o suco de laranja no liquidificador.', 'Junte a aveia, a beterraba e o guaraná em pó.', 'Bata por 30 segundos.', 'Beba logo, antes de a aveia assentar.'], etiquetas: ['doce', 'vegetariano'] },
  pre4: { tempo: 3, passos: ['Coloque o leite e o Mucilon no liquidificador.', POS_BATIDO, 'Bata por 30 segundos e beba.'], etiquetas: ['doce', 'vegetariano'] },
  pre5: { tempo: 3, passos: ['Amasse a banana com um garfo em uma tigela.', 'Misture a aveia e o mel até formar um creme grosso.', 'Coma de colher.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre6: { tempo: 3, passos: ['Lave a maçã e corte em gomos, sem tirar a casca.', 'Passe a pasta de amendoim em cada gomo ou use como molho.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre7: { tempo: 4, passos: ['Aqueça uma frigideira antiaderente em fogo médio, sem óleo.', 'Espalhe a goma de tapioca em camada fina e uniforme.', 'Espere 1 minuto, vire e deixe mais 1 minuto até firmar.', 'Regue com o mel e dobre ao meio.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre8: { tempo: 3, passos: ['Passe a geleia sobre as torradas.', 'Coma em seguida, para manter o crocante.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre9: { tempo: 3, passos: ['Descasque a banana e corte em rodelas em uma tigela.', 'Cubra com a granola.', 'Coma na hora, para a granola ficar crocante.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre10: { tempo: 3, passos: ['Coloque o iogurte em um copo ou tigela.', 'Regue com o mel e mexa.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre11: { tempo: 4, passos: ['Coloque o leite, o mamão e o mel no liquidificador.', POS_BATIDO, 'Bata por 40 segundos até ficar liso.', 'Beba na hora.'], etiquetas: ['doce', 'vegetariano'] },
  pre12: { tempo: 3, passos: ['Abra o pão francês ao meio.', 'Passe a geleia nas duas metades e feche.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre13: { tempo: 5, passos: ['Coloque o cuscuz em um pote próprio para micro-ondas.', 'Leve ao micro-ondas por 3 minutos.', 'Junte a manteiga e mexa com um garfo até derreter.', 'Salgue a gosto e coma quente.', POS], etiquetas: ['salgado', 'vegetariano'], temperos: ['sal', 'água'] },
  pre14: { tempo: 3, passos: ['Abra as bisnaguinhas ao meio.', 'Passe o requeijão nas duas metades.', 'Feche e coma.', POS], etiquetas: ['salgado', 'vegetariano'], temperos: AGUA },
  pre15: { tempo: 3, passos: ['Coloque o suco de laranja em um copo.', 'Misture a beterraba e o guaraná em pó dentro do suco.', 'Beba o suco e coma as torradas em seguida.'], etiquetas: ['doce', 'vegetariano'] },
  pre16: { tempo: 3, passos: ['Descasque a banana e corte ao meio no sentido do comprimento.', 'Espalhe o doce de leite sobre as metades.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre17: { tempo: 3, passos: ['Coloque o cereal em uma tigela.', 'Cubra com o leite gelado.', 'Coma na hora, para o cereal não amolecer.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre18: { tempo: 4, passos: ['Lave o morango e tire as folhinhas.', 'Coloque o leite, o morango e o mel no liquidificador.', POS_BATIDO, 'Bata por 40 segundos e beba.'], etiquetas: ['doce', 'vegetariano'] },
  pre19: { tempo: 3, passos: ['Coloque o leite em um copo.', 'Mergulhe o biscoito maisena no leite e coma aos poucos.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre20: { tempo: 3, passos: ['Passe a pasta de amendoim na fatia de pão de forma.', 'Dobre o pão ao meio.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre21: { tempo: 3, passos: ['Corte a manga em cubos e coloque em uma tigela.', 'Junte o iogurte e mexa.', 'Coma de colher.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre22: { tempo: 3, passos: ['Passe o requeijão sobre as torradas.', 'Coma em seguida, para manter o crocante.', POS], etiquetas: ['salgado', 'vegetariano'], temperos: AGUA },
  pre23: { tempo: 3, passos: ['Esmigalhe a paçoca dentro de um copo.', 'Junte o leite e mexa para dissolver.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre24: { tempo: 3, passos: ['Misture a beterraba e o guaraná em pó no suco de laranja.', 'Beba o suco.', 'Coma a barra de cereal em seguida.'], etiquetas: ['doce', 'vegetariano'] },
  pre25: { tempo: 5, passos: ['Aqueça uma frigideira antiaderente em fogo médio, sem óleo.', 'Espalhe a goma de tapioca em camada fina e deixe 1 minuto de cada lado.', 'Amasse a banana com um garfo e espalhe sobre a tapioca.', 'Dobre ao meio e coma.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre26: { tempo: 4, passos: ['Esquente o leite no micro-ondas por 1 minuto.', 'Junte a Farinha Láctea e mexa com uma colher até desmanchar.', 'Espere 1 minuto para engrossar.', 'Misture a beterraba e o guaraná em pó no mingau e mexa bem.'], etiquetas: ['doce', 'vegetariano'] },
  pre27: { tempo: 3, passos: ['Passe a manteiga fina nas torradas.', 'Regue com o mel.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre28: { tempo: 4, passos: ['Tire a polpa do abacate com uma colher.', 'Coloque no liquidificador com o leite e o mel.', POS_BATIDO, 'Bata por 40 segundos até ficar cremoso e beba.'], etiquetas: ['doce', 'vegetariano'] },
  pre29: { tempo: 5, passos: ['Coloque o leite e a aveia em uma tigela própria para micro-ondas.', 'Leve ao micro-ondas por 1 minuto e meio e mexa.', 'Junte o mel e deixe a aveia amolecer por 2 minutos.', 'Coma de colher.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
  pre30: { tempo: 3, passos: ['Passe a geleia sobre os biscoitos cream cracker.', 'Monte como mini sanduíches, se quiser.', POS], etiquetas: ['doce', 'vegetariano'], temperos: AGUA },
}

/** Pratos novos desta categoria. */
export const NOVOS: PratoNovo[] = [
  {
    id: 'pre31', nome: 'Tapioca com doce de leite', itens: [['tapioca', 40], ['doceLeite', 15], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Tapioca na frigideira seca com doce de leite; pós em meio copo de água.', tempo: 5,
    passos: ['Aqueça uma frigideira antiaderente em fogo médio, sem óleo.', 'Espalhe a goma de tapioca em camada fina e uniforme.', 'Espere 1 minuto, vire e deixe mais 1 minuto até firmar.', 'Espalhe o doce de leite e dobre ao meio.', POS],
    etiquetas: ['doce', 'vegetariano'], temperos: AGUA,
  },
  {
    id: 'pre32', nome: 'Pão de queijo com mel', itens: [['paoQueijo', 2], ['mel', 10], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Pão de queijo pequeno, quente, com fio de mel; pós em meio copo de água.', tempo: 4,
    passos: ['Separe os pães de queijo já assados, do dia anterior ou do congelador.', 'Esquente no micro-ondas por 30 a 40 segundos, ou na airfryer a 180 graus por 4 minutos.', 'Abra ao meio e regue com o mel.', POS],
    etiquetas: ['doce', 'vegetariano'], temperos: AGUA,
  },
  {
    id: 'pre33', nome: 'Açaí pequeno com banana', itens: [['acai', 100], ['banana', 1], ['aveia', 10], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Açaí batido com banana, aveia por cima; pós misturados na batida.', tempo: 5,
    passos: ['Deixe a polpa de açaí 2 minutos fora do congelador para amolecer.', 'Bata no liquidificador o açaí com metade da banana, pulsando até ficar espesso.', 'Junte a beterraba e o guaraná em pó e bata mais 10 segundos.', 'Passe para uma tigela e corte o resto da banana em rodelas por cima.', 'Finalize com a aveia e coma de colher.'],
    etiquetas: ['doce', 'vegetariano'],
  },
  {
    id: 'pre34', nome: 'Vitamina rápida de banana com iogurte', itens: [['leite', 150], ['banana', 1], ['iogurte', 60], ['mel', 5], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Bata tudo junto, com os pós, e beba.', tempo: 3,
    passos: ['Coloque o leite, o iogurte e o mel no liquidificador.', 'Junte a banana descascada e em pedaços.', POS_BATIDO, 'Bata por 40 segundos até ficar liso e beba na hora.'],
    etiquetas: ['doce', 'vegetariano'],
  },
  {
    id: 'pre35', nome: 'Vitamina de manga com iogurte', itens: [['leite', 100], ['manga', 80], ['iogurte', 50], ['mel', 5], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Bata o leite, a manga, o iogurte e o mel, com os pós, e beba.', tempo: 4,
    passos: ['Corte a manga em cubos, sem casca.', 'Coloque o leite, o iogurte e o mel no liquidificador e junte a manga.', POS_BATIDO, 'Bata por 40 segundos até ficar liso e beba na hora.'],
    etiquetas: ['doce', 'vegetariano'],
  },
  {
    id: 'pre36', nome: 'Vitamina gelada de maçã e aveia', itens: [['leite', 100], ['macaFruta', 1], ['aveia', 10], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Bata o leite, a maçã e a aveia, com os pós, e beba.', tempo: 4,
    passos: ['Lave a maçã e corte em pedaços, sem tirar a casca.', 'Coloque o leite e a aveia no liquidificador e junte a maçã.', POS_BATIDO, 'Bata por 1 minuto para triturar bem a casca e beba na hora.'],
    etiquetas: ['doce', 'vegetariano'],
  },
  {
    id: 'pre37', nome: 'Vitamina de morango com banana', itens: [['leite', 100], ['morango', 60], ['banana', 1], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Bata o leite, o morango e a banana, com os pós, e beba.', tempo: 4,
    passos: ['Lave o morango e tire as folhinhas.', 'Coloque o leite, o morango e a banana descascada no liquidificador.', POS_BATIDO, 'Bata por 40 segundos até ficar cremoso e beba na hora.'],
    etiquetas: ['doce', 'vegetariano'],
  },
  {
    id: 'pre38', nome: 'Vitamina gelada de mamão, aveia e mel', itens: [['leite', 120], ['mamao', 80], ['aveia', 12], ['mel', 5], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Bata o leite, o mamão, a aveia e o mel, com os pós, e beba.', tempo: 4,
    passos: ['Tire a casca e as sementes do mamão e corte em cubos.', 'Coloque o leite, a aveia e o mel no liquidificador e junte o mamão.', POS_BATIDO, 'Bata por 40 segundos e beba logo, antes de a aveia assentar.'],
    etiquetas: ['doce', 'vegetariano'],
  },
  {
    id: 'pre39', nome: 'Torradas com pasta de amendoim e mel', itens: [['torrada', 2], ['pastaAmendoim', 10], ['mel', 5], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Torradas com pasta de amendoim e fio de mel; pós em meio copo de água.', tempo: 3,
    passos: ['Passe a pasta de amendoim sobre as torradas.', 'Regue com o mel.', 'Coma em seguida, para manter o crocante.', POS],
    etiquetas: ['doce', 'vegetariano'], temperos: AGUA,
  },
  {
    id: 'pre40', nome: 'Sanduíche de banana com doce de leite', itens: [['paoForma', 1], ['banana', 1], ['doceLeite', 10], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Fatia de pão com doce de leite e banana amassada; pós em meio copo de água.', tempo: 3,
    passos: ['Amasse a banana com um garfo em um prato.', 'Espalhe o doce de leite na fatia de pão de forma.', 'Cubra com a banana amassada e dobre o pão ao meio.', POS],
    etiquetas: ['doce', 'vegetariano'], temperos: AGUA,
  },
  {
    id: 'pre41', nome: 'Pão francês com requeijão', itens: [['paoFrances', 1], ['requeijao', 8], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Pão francês aberto com requeijão; pós em meio copo de água.', tempo: 3,
    passos: ['Abra o pão francês ao meio.', 'Passe o requeijão nas duas metades.', 'Feche e coma.', POS],
    etiquetas: ['salgado', 'vegetariano'], temperos: AGUA,
  },
  {
    id: 'pre42', nome: 'Tapioca de queijo minas', itens: [['tapioca', 40], ['minas', 25], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Tapioca na frigideira seca com queijo minas em lascas; pós em meio copo de água.', tempo: 5,
    passos: ['Aqueça uma frigideira antiaderente em fogo médio, sem óleo.', 'Espalhe a goma de tapioca em camada fina e uniforme.', 'Espere 1 minuto, vire e deixe mais 1 minuto até firmar.', 'Coloque o queijo minas em lascas finas no centro, dobre ao meio e deixe 30 segundos para amolecer.', POS],
    etiquetas: ['salgado', 'vegetariano'], temperos: AGUA,
  },
  {
    id: 'pre43', nome: 'Tapioca com iogurte e morango', itens: [['tapioca', 30], ['iogurte', 60], ['morango', 60], ['mel', 10], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Tapioca na frigideira seca recheada com iogurte, morango e mel; pós em meio copo de água.', tempo: 6,
    passos: ['Lave o morango, tire as folhinhas e corte em fatias.', 'Aqueça uma frigideira antiaderente em fogo médio, sem óleo.', 'Espalhe a goma de tapioca, espere 1 minuto, vire e deixe mais 1 minuto.', 'Recheie com o iogurte e o morango, regue com o mel e dobre ao meio.', POS],
    etiquetas: ['doce', 'vegetariano'], temperos: AGUA,
  },
  {
    id: 'pre44', nome: 'Cuscuz doce com leite e canela', itens: [['cuscuz', 100], ['leite', 80], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Cuscuz de micro-ondas com leite quente e canela; pós em meio copo de água.', tempo: 5,
    passos: ['Coloque o cuscuz em um pote próprio para micro-ondas.', 'Hidrate o cuscuz com 3 colheres de sopa de água e uma pitada de sal (ou de açúcar), mexa e deixe 2 minutos.', 'Tampe e leve ao micro-ondas por 2 minutos.', 'Esquente o leite por 40 segundos e despeje sobre o cuscuz.', 'Polvilhe canela a gosto e mexa com um garfo.', POS],
    etiquetas: ['doce', 'vegetariano'], temperos: ['canela', 'sal', 'água'],
  },
  {
    id: 'pre45', nome: 'Iogurte com banana e aveia', itens: [['iogurte', 120], ['banana', 1], ['aveia', 8], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Iogurte com banana amassada e aveia; pós em meio copo de água.', tempo: 3,
    passos: ['Coloque o iogurte em uma tigela.', 'Amasse a banana com um garfo e misture ao iogurte.', 'Polvilhe a aveia por cima e coma de colher.', POS],
    etiquetas: ['doce', 'vegetariano'], temperos: AGUA,
  },
  {
    id: 'pre46', nome: 'Iogurte com granola e morango', itens: [['iogurte', 120], ['granola', 20], ['morango', 50], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Iogurte com morango fatiado e granola crocante; pós em meio copo de água.', tempo: 4,
    passos: ['Lave o morango, tire as folhinhas e corte em fatias.', 'Coloque o iogurte em uma tigela e junte o morango.', 'Cubra com a granola na hora de comer, para ficar crocante.', POS],
    etiquetas: ['doce', 'vegetariano'], temperos: AGUA,
  },
  {
    id: 'pre47', nome: 'Mamão com aveia e mel', itens: [['mamao', 150], ['aveia', 20], ['mel', 10], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Mamão em cubos com aveia e mel; pós em meio copo de água.', tempo: 4,
    passos: ['Tire a casca e as sementes do mamão e corte em cubos em uma tigela.', 'Polvilhe a aveia por cima.', 'Regue com o mel e coma de colher.', POS],
    etiquetas: ['doce', 'vegetariano'], temperos: AGUA,
  },
  {
    id: 'pre48', nome: 'Manga com aveia e leite', itens: [['manga', 100], ['leite', 100], ['aveia', 10], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Manga em cubos com leite gelado e aveia; pós misturados no leite.', tempo: 4,
    passos: ['Corte a manga em cubos, sem casca, e coloque em uma tigela.', 'Junte a aveia.', 'Misture a beterraba e o guaraná em pó no leite gelado.', 'Despeje o leite sobre a manga e a aveia e coma de colher.'],
    etiquetas: ['doce', 'vegetariano'],
  },
  {
    id: 'pre49', nome: 'Maçã com iogurte e mel', itens: [['macaFruta', 1], ['iogurte', 100], ['mel', 10], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Maçã em cubos com iogurte e mel; pós em meio copo de água.', tempo: 4,
    passos: ['Lave a maçã e corte em cubos pequenos, sem tirar a casca.', 'Coloque o iogurte em uma tigela e junte a maçã.', 'Regue com o mel e mexa.', POS],
    etiquetas: ['doce', 'vegetariano'], temperos: AGUA,
  },
  {
    id: 'pre50', nome: 'Mamão com iogurte e granola', itens: [['mamao', 100], ['iogurte', 100], ['granola', 20], ['beterraba', 5], ['guarana', 2]],
    preparo: 'Mamão em cubos com iogurte e granola crocante; pós em meio copo de água.', tempo: 4,
    passos: ['Tire a casca e as sementes do mamão e corte em cubos.', 'Coloque o iogurte em uma tigela e junte o mamão.', 'Cubra com a granola na hora de comer, para ficar crocante.', POS],
    etiquetas: ['doce', 'vegetariano'], temperos: AGUA,
  },
]
