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
]
