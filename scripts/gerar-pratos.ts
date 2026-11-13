/**
 * Calcula as quantidades de cada prato para as 4 fases e grava src/conteudo/pratos.ts com números explícitos.
 * Cada categoria de refeição tem um orçamento de calorias por fase; como todo prato da categoria fecha no
 * mesmo orçamento, qualquer combinação (inclusive as trocas do usuário) bate a meta do dia.
 * Rodar: node scripts/gerar-pratos.ts   (depois de mudar a base abaixo ou a tabela de alimentos)
 */
import { writeFileSync } from 'node:fs'
import { ALIMENTOS, type IdAlimento } from '../src/conteudo/alimentos.ts'
import { RECEITAS as DE_DOMINGO } from '../src/conteudo/receitas.ts'
import * as almoco from './receitas/almoco.ts'
import * as cafe from './receitas/cafe.ts'
import * as ceia from './receitas/ceia.ts'
import * as jantar from './receitas/jantar.ts'
import * as lanche from './receitas/lanche.ts'
import * as pre from './receitas/pre.ts'
import type { PratoNovo, ReceitaDoPrato } from './receitas/tipos.ts'

type Categoria = 'pre' | 'cafe' | 'lanche' | 'almoco' | 'jantar' | 'ceia'

/** kcal por fase [1, 2, 3, 4]. A soma do dia (3 lanches) dá 2750, 3050, 3250 e 2600. */
const ORCAMENTO: Record<Categoria, number[]> = {
  pre: [180, 200, 210, 170],
  cafe: [480, 530, 560, 450],
  lanche: [230, 260, 280, 215],
  almoco: [620, 690, 730, 600],
  jantar: [520, 570, 610, 495],
  ceia: [260, 280, 300, 240],
}

type Item = [IdAlimento, number]
interface Base { id: string; nome: string; categoria: Categoria; itens: Item[]; preparo: string; receita?: string }

const BASE: Base[] = [
  { id: 'pre1', nome: 'Banana com pasta de amendoim', categoria: 'pre', itens: [['banana', 1], ['pastaAmendoim', 12], ['beterraba', 5], ['guarana', 2]], preparo: 'Beterraba e guaraná em pó misturados em meio copo de água.' },
  { id: 'pre2', nome: 'Pão com mel', categoria: 'pre', itens: [['paoForma', 2], ['mel', 10], ['beterraba', 5], ['guarana', 2]], preparo: 'Beterraba e guaraná em pó misturados em meio copo de água.' },
  { id: 'pre3', nome: 'Suco de laranja com aveia', categoria: 'pre', itens: [['sucoLaranja', 250], ['aveia', 20], ['beterraba', 5], ['guarana', 2]], preparo: 'Bata tudo junto e beba.' },
  { id: 'pre4', nome: 'Vitamina rápida de Mucilon', categoria: 'pre', itens: [['leite', 150], ['mucilon', 20], ['beterraba', 5], ['guarana', 2]], preparo: 'Bata tudo junto e beba.' },
  { id: 'pre5', nome: 'Banana amassada com aveia e mel', categoria: 'pre', itens: [['banana', 1], ['aveia', 15], ['mel', 10], ['beterraba', 5], ['guarana', 2]], preparo: 'Beterraba e guaraná em pó misturados em meio copo de água.' },

  { id: 'cafe1', nome: 'Ovos mexidos, pão e shake de whey', categoria: 'cafe', itens: [['ovo', 2], ['paoFrances', 1], ['leite', 200], ['whey', 30], ['creatina', 5]], preparo: 'Whey e creatina batidos no leite.' },
  { id: 'cafe2', nome: 'Vitamina de whey, banana e aveia', categoria: 'cafe', itens: [['leite', 300], ['banana', 1], ['aveia', 30], ['whey', 30], ['maca', 5], ['creatina', 5]], preparo: 'Bata tudo no liquidificador.', receita: 'shakePosTreino' },
  { id: 'cafe3', nome: 'Misto quente e shake de whey', categoria: 'cafe', itens: [['paoForma', 2], ['mussarela', 2], ['presunto', 2], ['leite', 200], ['whey', 30], ['creatina', 5]], preparo: 'Whey e creatina batidos no leite.' },
  { id: 'cafe4', nome: 'Panqueca de aveia e banana com whey', categoria: 'cafe', itens: [['ovo', 2], ['banana', 1], ['aveia', 30], ['leite', 150], ['whey', 30], ['creatina', 5]], preparo: 'Whey e creatina batidos no leite, para beber junto.', receita: 'panquecaAveia' },
  { id: 'cafe5', nome: 'Pão de queijo e shake de whey', categoria: 'cafe', itens: [['paoQueijo', 2], ['leite', 200], ['achocolatado', 10], ['whey', 30], ['creatina', 5]], preparo: 'Whey, creatina e achocolatado batidos no leite.' },
  { id: 'cafe6', nome: 'Pão com ovo e queijo e shake de whey', categoria: 'cafe', itens: [['paoForma', 2], ['ovo', 1], ['mussarela', 1], ['leite', 200], ['whey', 30], ['creatina', 5]], preparo: 'Whey e creatina batidos no leite.' },

  { id: 'lanche1', nome: 'Sanduíche de presunto e queijo', categoria: 'lanche', itens: [['paoForma', 2], ['presunto', 2], ['mussarela', 1], ['requeijao', 10]], preparo: 'Monte em casa e leve embrulhado.' },
  { id: 'lanche2', nome: 'Sanduíche de pasta de amendoim', categoria: 'lanche', itens: [['paoForma', 2], ['pastaAmendoim', 15]], preparo: 'Monte em casa e leve embrulhado.' },
  { id: 'lanche3', nome: 'Vitamina de Farinha Láctea na garrafa', categoria: 'lanche', itens: [['leite', 250], ['farinhaLactea', 25]], preparo: 'Bata de manhã e leve em garrafa térmica.', receita: 'vitaminaFarinhaLactea' },
  { id: 'lanche4', nome: 'Banana, pasta de amendoim e leite', categoria: 'lanche', itens: [['banana', 1], ['pastaAmendoim', 15], ['leite', 150]], preparo: 'Leite em garrafa térmica; a pasta vai num potinho.' },
  { id: 'lanche5', nome: 'Iogurte com aveia e mel', categoria: 'lanche', itens: [['iogurte', 170], ['aveia', 25], ['mel', 10]], preparo: 'Leve a aveia separada e misture na hora.' },
  { id: 'lanche6', nome: 'Esfiha de carne e suco', categoria: 'lanche', itens: [['esfiha', 1], ['sucoLaranja', 150]], preparo: 'Vale comprar pronto na padaria.' },
  { id: 'lanche7', nome: 'Biscoito com queijo minas', categoria: 'lanche', itens: [['creamCracker', 30], ['minas', 40]], preparo: 'Queijo em fatias num pote.' },
  { id: 'lanche8', nome: 'Sanduíche de frango desfiado', categoria: 'lanche', itens: [['paoFrances', 1], ['frango', 50], ['requeijao', 10]], preparo: 'Use o frango da marmita, desfiado com requeijão.' },
  { id: 'lanche9', nome: 'Vitamina de Mucilon na garrafa', categoria: 'lanche', itens: [['leite', 250], ['mucilon', 25]], preparo: 'Bata de manhã e leve em garrafa térmica.' },
  { id: 'lanche10', nome: 'Leite com achocolatado e biscoito', categoria: 'lanche', itens: [['leite', 200], ['achocolatado', 15], ['creamCracker', 20]], preparo: 'Leite já batido com o achocolatado, na garrafa térmica.' },
  { id: 'lanche11', nome: 'Sanduíche de ovo', categoria: 'lanche', itens: [['paoForma', 2], ['ovo', 1], ['requeijao', 10]], preparo: 'Ovo cozido amassado com o requeijão.' },

  { id: 'almoco1', nome: 'Arroz, bife e batata', categoria: 'almoco', itens: [['arroz', 150], ['patinho', 120], ['batata', 150], ['azeite', 5]], preparo: 'Batata assada na airfryer, com o azeite.', receita: 'batataAssada' },
  { id: 'almoco2', nome: 'Arroz com carne moída e ovo', categoria: 'almoco', itens: [['arroz', 160], ['moida', 120], ['ovo', 1]], preparo: 'Ovo cozido, para aguentar a marmita.', receita: 'carneMoida' },
  { id: 'almoco3', nome: 'Macarrão à bolonhesa', categoria: 'almoco', itens: [['macarrao', 200], ['moida', 100], ['molhoTomate', 80], ['mussarela', 1]], preparo: 'Queijo por cima, derrete no micro-ondas.', receita: 'bolonhesa' },
  { id: 'almoco4', nome: 'Frango, purê e arroz', categoria: 'almoco', itens: [['frango', 130], ['pure', 150], ['arroz', 120]], preparo: 'Frango em cubos, grelhado.', receita: 'pureBatata' },
  { id: 'almoco5', nome: 'Sobrecoxa assada, arroz e batata', categoria: 'almoco', itens: [['sobrecoxa', 120], ['arroz', 140], ['batata', 120]], preparo: 'Sobrecoxa e batata assadas juntas.' },
  { id: 'almoco6', nome: 'Escondidinho de carne moída', categoria: 'almoco', itens: [['pure', 250], ['moida', 120], ['mussarela', 2]], preparo: 'Camada de carne, purê por cima e queijo.', receita: 'pureBatata' },
  { id: 'almoco7', nome: 'Macarrão com frango e requeijão', categoria: 'almoco', itens: [['macarrao', 200], ['frango', 110], ['requeijao', 20], ['molhoTomate', 50]], preparo: 'Misture o requeijão no molho quente.', receita: 'frangoCremoso' },
  { id: 'almoco8', nome: 'Estrogonofe de frango com arroz', categoria: 'almoco', itens: [['frango', 120], ['cremeLeite', 30], ['molhoTomate', 30], ['arroz', 170]], preparo: 'Creme de leite por último, com o fogo desligado.', receita: 'estrogonofe' },
  { id: 'almoco9', nome: 'Sobrecoxa, arroz e purê', categoria: 'almoco', itens: [['sobrecoxa', 120], ['arroz', 130], ['pure', 130]], preparo: 'Sobrecoxa assada sem pele.', receita: 'pureBatata' },
  { id: 'almoco10', nome: 'Arroz de forno com frango e queijo', categoria: 'almoco', itens: [['arroz', 180], ['frango', 110], ['mussarela', 2], ['requeijao', 15]], preparo: 'Arroz misturado ao frango desfiado e requeijão, queijo por cima.' },
  { id: 'almoco11', nome: 'Lasanha de carne moída', categoria: 'almoco', itens: [['macarrao', 180], ['moida', 100], ['molhoTomate', 80], ['mussarela', 2], ['presunto', 2]], preparo: 'Camadas de massa, molho com carne, presunto e queijo. Assa no domingo e corta em porções.', receita: 'lasanha' },

  { id: 'jantar1', nome: 'Hambúrguer caseiro no pão', categoria: 'jantar', itens: [['moida', 110], ['paoFrances', 1], ['mussarela', 1]], preparo: 'Um disco de carne moída, 4 minutos de cada lado.', receita: 'hamburguer' },
  { id: 'jantar2', nome: 'Bife com batata frita e arroz', categoria: 'jantar', itens: [['patinho', 100], ['batataFrita', 90], ['arroz', 80]], preparo: 'Na Fase 4, troque a batata frita pela assada.' },
  { id: 'jantar3', nome: 'Omelete de queijo com arroz', categoria: 'jantar', itens: [['ovo', 3], ['mussarela', 2], ['arroz', 120]], preparo: 'Pronto em 8 minutos.', receita: 'omelete' },
  { id: 'jantar4', nome: 'Macarrão alho e óleo com frango', categoria: 'jantar', itens: [['macarrao', 180], ['frango', 110], ['azeite', 8]], preparo: 'Alho em pó no azeite, sem pedaços.' },
  { id: 'jantar5', nome: 'Arroz, frango e ovo', categoria: 'jantar', itens: [['arroz', 150], ['frango', 110], ['ovo', 1]], preparo: 'Ovo frito por cima.' },
  { id: 'jantar6', nome: 'Purê com carne moída', categoria: 'jantar', itens: [['pure', 200], ['moida', 110]], preparo: 'Sobra da marmita serve.', receita: 'pureBatata' },
  { id: 'jantar7', nome: 'Churrasco com arroz', categoria: 'jantar', itens: [['picanha', 110], ['arroz', 130]], preparo: 'Picanha na frigideira bem quente.' },
  { id: 'jantar8', nome: 'Sanduíche quente de ovo e queijo', categoria: 'jantar', itens: [['paoFrances', 2], ['ovo', 2], ['mussarela', 1], ['leite', 100]], preparo: 'Pronto em 8 minutos, na frigideira. Leite para acompanhar.' },
  { id: 'jantar9', nome: 'Macarrão na manteiga com carne moída', categoria: 'jantar', itens: [['macarrao', 180], ['moida', 100], ['manteiga', 5]], preparo: 'A carne moída da semana vai por cima.', receita: 'carneMoida' },
  { id: 'jantar10', nome: 'Batata recheada com frango e requeijão', categoria: 'jantar', itens: [['batata', 250], ['frango', 100], ['requeijao', 25], ['mussarela', 1]], preparo: 'Batata no micro-ondas por 8 minutos, aberta e recheada.' },

  { id: 'ceia1', nome: 'Vitamina de Mucilon com banana', categoria: 'ceia', itens: [['leite', 250], ['mucilon', 20], ['banana', 1]], preparo: 'Bata e beba devagar.', receita: 'mucilonNoturno' },
  { id: 'ceia2', nome: 'Vitamina de Farinha Láctea', categoria: 'ceia', itens: [['leite', 250], ['farinhaLactea', 25]], preparo: 'Bata e beba devagar.', receita: 'vitaminaFarinhaLactea' },
  { id: 'ceia3', nome: 'Iogurte batido com aveia e mel', categoria: 'ceia', itens: [['iogurte', 200], ['leite', 100], ['aveia', 20], ['mel', 10]], preparo: 'Bata até ficar cremoso.' },
  { id: 'ceia4', nome: 'Leite com achocolatado e pasta de amendoim', categoria: 'ceia', itens: [['leite', 250], ['achocolatado', 15], ['pastaAmendoim', 10]], preparo: 'Bata para dissolver a pasta.' },
  { id: 'ceia5', nome: 'Vitamina de banana com aveia', categoria: 'ceia', itens: [['leite', 250], ['banana', 1], ['aveia', 15]], preparo: 'Bata e beba devagar.' },
]


// ---- variedade: pelo menos 30 opções por categoria ----
type Linha = [nome: string, itens: Item[], preparo: string]
const PO: Item[] = [['beterraba', 5], ['guarana', 2]]
const WHEY: Item[] = [['whey', 30], ['creatina', 5]]
const PO_TEXTO = 'Beterraba e guaraná em pó em meio copo de água.'

function ampliar(categoria: Categoria, primeiro: number, linhas: Linha[], sufixo: Item[] = []) {
  linhas.forEach(([nome, itens, preparo], i) => BASE.push({ id: `${categoria}${primeiro + i}`, nome, categoria, itens: [...itens, ...sufixo], preparo }))
}

ampliar('pre', 6, [
  ['Maçã com pasta de amendoim', [['macaFruta', 1], ['pastaAmendoim', 10]], PO_TEXTO],
  ['Tapioca com mel', [['tapioca', 50], ['mel', 10]], 'Tapioca na frigideira seca, 1 minuto de cada lado.'],
  ['Torradas com geleia', [['torrada', 3], ['geleia', 20]], PO_TEXTO],
  ['Banana com granola', [['banana', 1], ['granola', 20]], PO_TEXTO],
  ['Iogurte com mel', [['iogurte', 150], ['mel', 15]], PO_TEXTO],
  ['Vitamina de mamão', [['leite', 150], ['mamao', 100], ['mel', 10]], 'Bata tudo junto, com os pós.'],
  ['Pão francês com geleia', [['paoFrances', 1], ['geleia', 10]], PO_TEXTO],
  ['Cuscuz com manteiga', [['cuscuz', 120], ['manteiga', 5]], 'Cuscuz de micro-ondas: 3 minutos.'],
  ['Bisnaguinha com requeijão', [['bisnaguinha', 2], ['requeijao', 15]], PO_TEXTO],
  ['Suco de laranja com torradas', [['sucoLaranja', 200], ['torrada', 3]], 'Os pós vão dentro do suco.'],
  ['Banana com doce de leite', [['banana', 1], ['doceLeite', 20]], PO_TEXTO],
  ['Cereal com leite', [['cerealMatinal', 30], ['leite', 150]], PO_TEXTO],
  ['Vitamina rápida de morango', [['leite', 150], ['morango', 100], ['mel', 10]], 'Bata tudo junto, com os pós.'],
  ['Biscoito maisena com leite', [['maisena', 25], ['leite', 150]], PO_TEXTO],
  ['Pão de forma com pasta de amendoim', [['paoForma', 1], ['pastaAmendoim', 15]], PO_TEXTO],
  ['Manga com iogurte', [['manga', 120], ['iogurte', 100]], PO_TEXTO],
  ['Torradas com requeijão', [['torrada', 3], ['requeijao', 15]], PO_TEXTO],
  ['Paçoca com leite', [['pacoca', 1], ['leite', 100]], PO_TEXTO],
  ['Barra de cereal e suco', [['barraCereal', 1], ['sucoLaranja', 200]], 'Os pós vão dentro do suco.'],
  ['Tapioca com banana', [['tapioca', 40], ['banana', 1]], 'Banana amassada como recheio.'],
  ['Mingau rápido de Farinha Láctea', [['leite', 150], ['farinhaLactea', 20]], 'Leite morno, mexa e beba.'],
  ['Torradas com manteiga e mel', [['torrada', 3], ['manteiga', 5], ['mel', 5]], PO_TEXTO],
  ['Vitamina rápida de abacate', [['leite', 150], ['abacate', 60], ['mel', 10]], 'Bata tudo junto, com os pós.'],
  ['Aveia com leite e mel', [['leite', 150], ['aveia', 20], ['mel', 5]], 'Deixe a aveia amolecer 2 minutos.'],
  ['Biscoito cream cracker com geleia', [['creamCracker', 25], ['geleia', 20]], PO_TEXTO],
], PO)

const SHAKE = 'Whey e creatina batidos no leite.'
ampliar('cafe', 7, [
  ['Tapioca com ovo e queijo e shake de whey', [['tapioca', 60], ['ovo', 1], ['mussarela', 1], ['leite', 200]], SHAKE],
  ['Cuscuz com ovos e shake de whey', [['cuscuz', 150], ['ovo', 2], ['leite', 200]], SHAKE],
  ['Pão com queijo minas e shake de whey', [['paoFrances', 1], ['minas', 40], ['leite', 200]], SHAKE],
  ['Mingau de aveia com whey', [['leite', 300], ['aveia', 40], ['banana', 1]], 'Whey e creatina entram com o mingau já morno, para não empelotar.'],
  ['Omelete de presunto e queijo com torradas', [['ovo', 2], ['presunto', 2], ['mussarela', 1], ['torrada', 1], ['leite', 150]], SHAKE],
  ['Pão com peito de peru e shake de whey', [['paoForma', 2], ['requeijao', 15], ['peitoPeru', 3], ['leite', 200]], SHAKE],
  ['Iogurte com granola, banana e whey', [['iogurte', 200], ['granola', 40], ['banana', 1]], 'Whey e creatina misturados no iogurte.'],
  ['Crepioca de queijo e shake de whey', [['tapioca', 40], ['ovo', 2], ['queijoPrato', 1], ['leite', 200]], 'Ovo batido com a goma, na frigideira.'],
  ['Torradas com ovos mexidos e shake de whey', [['torrada', 4], ['ovo', 2], ['leite', 200]], SHAKE],
  ['Vitamina de morango com whey e aveia', [['leite', 300], ['morango', 150], ['aveia', 30]], 'Bata tudo no liquidificador.'],
  ['Pão na chapa e shake de whey com achocolatado', [['paoFrances', 1], ['manteiga', 10], ['leite', 250], ['achocolatado', 10]], SHAKE],
  ['Sanduíche de ovo e queijo prato e shake de whey', [['paoForma', 2], ['ovo', 1], ['queijoPrato', 1], ['leite', 200]], SHAKE],
  ['Cereal com leite, banana e whey', [['cerealMatinal', 40], ['leite', 300], ['banana', 1]], 'Whey e creatina batidos no leite antes de pôr o cereal.'],
  ['Vitamina de abacate com whey', [['leite', 300], ['abacate', 80], ['mel', 10]], 'Bata tudo no liquidificador.'],
  ['Bolo simples, banana e shake de whey', [['bolo', 1], ['banana', 1], ['leite', 250]], SHAKE],
  ['Cuscuz com queijo e shake de whey', [['cuscuz', 150], ['minas', 40], ['leite', 200]], SHAKE],
  ['Pão de queijo com ovo e shake de whey', [['paoQueijo', 2], ['ovo', 1], ['leite', 150]], SHAKE],
  ['Mingau de Mucilon com whey', [['leite', 300], ['mucilon', 35], ['banana', 1]], 'Whey e creatina entram com o mingau já morno.'],
  ['Bisnaguinhas com presunto e queijo e shake de whey', [['bisnaguinha', 3], ['presunto', 2], ['mussarela', 1], ['leite', 200]], SHAKE],
  ['Vitamina de mamão, aveia e whey', [['leite', 300], ['mamao', 150], ['aveia', 30]], 'Bata tudo no liquidificador.'],
  ['Wrap de ovo e queijo e shake de whey', [['wrap', 1], ['ovo', 1], ['mussarela', 1], ['leite', 200]], SHAKE],
  ['Pão com pasta de amendoim, banana e shake de whey', [['paoForma', 2], ['pastaAmendoim', 15], ['banana', 1], ['leite', 200]], SHAKE],
  ['Iogurte batido com whey, banana e mel', [['iogurte', 250], ['banana', 1], ['mel', 10], ['aveia', 20]], 'Bata tudo no liquidificador.'],
  ['Ovos mexidos com queijo, torradas e shake de whey', [['ovo', 2], ['mussarela', 1], ['torrada', 2], ['leite', 150]], SHAKE],
], WHEY)

ampliar('lanche', 12, [
  ['Maçã com amendoim', [['macaFruta', 1], ['amendoim', 20]], 'Amendoim num potinho.'],
  ['Barra de cereal e iogurte', [['barraCereal', 1], ['iogurte', 170]], 'Iogurte de garrafinha.'],
  ['Sanduíche de peito de peru e requeijão', [['paoForma', 2], ['peitoPeru', 3], ['requeijao', 15]], 'Monte em casa e leve embrulhado.'],
  ['Bisnaguinhas com requeijão', [['bisnaguinha', 3], ['requeijao', 20]], 'Já recheadas, num pote.'],
  ['Paçoca e leite', [['pacoca', 1], ['leite', 200]], 'Leite em garrafa térmica.'],
  ['Iogurte com granola', [['iogurte', 170], ['granola', 30]], 'Granola separada, mistura na hora.'],
  ['Bolo simples e suco', [['bolo', 1], ['sucoLaranja', 100]], 'Fatia embrulhada em papel.'],
  ['Torradas com queijo minas', [['torrada', 3], ['minas', 40]], 'Queijo em fatias num pote.'],
  ['Wrap de frango', [['wrap', 1], ['frango', 50], ['requeijao', 10]], 'Frango desfiado com requeijão, enrolado e embrulhado.'],
  ['Banana com doce de leite e leite', [['banana', 1], ['doceLeite', 20], ['leite', 100]], 'Doce de leite num potinho.'],
  ['Vitamina de morango na garrafa', [['leite', 250], ['morango', 100], ['mel', 10]], 'Bata de manhã e leve em garrafa térmica.'],
  ['Sanduíche de mortadela', [['paoForma', 2], ['mortadela', 1], ['requeijao', 10]], 'Monte em casa e leve embrulhado.'],
  ['Biscoito maisena e iogurte', [['maisena', 25], ['iogurte', 170]], 'Iogurte de garrafinha.'],
  ['Pão com doce de leite', [['paoFrances', 1], ['doceLeite', 20]], 'Monte em casa e leve embrulhado.'],
  ['Queijo com goiabada e torradas', [['minas', 40], ['goiabada', 30], ['torrada', 2]], 'Queijo e goiabada em cubos, num pote.'],
  ['Vitamina de abacate na garrafa', [['leite', 200], ['abacate', 60], ['mel', 10]], 'Bata de manhã e leve em garrafa térmica.'],
  ['Amendoim com banana', [['amendoim', 20], ['banana', 1]], 'O lanche mais fácil de carregar.'],
  ['Cuscuz com ovo no pote', [['cuscuz', 120], ['ovo', 1]], 'Ovo cozido picado por cima.'],
  ['Pão com presunto e requeijão', [['paoFrances', 1], ['presunto', 2], ['requeijao', 15]], 'Monte em casa e leve embrulhado.'],
])

ampliar('almoco', 12, [
  ['Arroz, frango grelhado e batata', [['arroz', 150], ['frango', 120], ['batata', 150]], 'Frango em tiras, batata em cubos assada.'],
  ['Arroz com linguiça e ovo', [['arroz', 170], ['linguica', 90], ['ovo', 1]], 'Linguiça em rodelas, ovo cozido.'],
  ['Nhoque à bolonhesa', [['nhoque', 220], ['moida', 100], ['molhoTomate', 80], ['mussarela', 1]], 'Molho por cima só na hora de esquentar.'],
  ['Arroz, carne de panela e batata', [['arroz', 150], ['carnePanela', 110], ['batata', 150]], 'Carne e batata cozidas juntas na pressão, 25 minutos.'],
  ['Frango à milanesa com arroz e purê', [['milanesaFrango', 110], ['arroz', 130], ['pure', 130]], 'Milanesa assada na airfryer, sem fritar.'],
  ['Lombo assado com arroz e batata', [['lombo', 110], ['arroz', 150], ['batata', 150]], 'Lombo fatiado fino depois de frio.'],
  ['Macarrão ao molho branco com frango', [['macarrao', 200], ['frango', 100], ['cremeLeite', 30], ['mussarela', 1]], 'Creme de leite e queijo derretidos sobre o frango.'],
  ['Arroz carreteiro', [['arroz', 220], ['carnePanela', 100], ['calabresa', 20]], 'Carne desfiada e calabresa refogadas com o arroz.'],
  ['Polenta com molho de carne moída', [['polenta', 300], ['moida', 110], ['molhoTomate', 80], ['mussarela', 1]], 'Polenta firme no fundo, molho por cima.'],
  ['Bife à milanesa com arroz e batata', [['milanesaBoi', 90], ['arroz', 140], ['batata', 130]], 'Milanesa assada na airfryer, sem fritar.'],
  ['Cuscuz com frango desfiado e ovo', [['cuscuz', 250], ['frango', 100], ['ovo', 1], ['requeijao', 15]], 'Frango com requeijão por cima do cuscuz.'],
  ['Almôndegas ao sugo com arroz', [['moida', 110], ['molhoTomate', 80], ['arroz', 180]], 'Bolinhas de carne moída assadas e depois no molho.'],
  ['Coxa de frango assada com arroz e batata', [['coxa', 120], ['arroz', 150], ['batata', 140]], 'Coxa desossada depois de assada, para caber no pote.'],
  ['Macarrão com calabresa e queijo', [['macarrao', 220], ['calabresa', 60], ['molhoTomate', 60], ['mussarela', 1]], 'Calabresa em cubos pequenos, dourada antes do molho.'],
  ['Bisteca de porco com arroz e purê', [['bisteca', 100], ['arroz', 140], ['pure', 120]], 'Bisteca sem osso, em tiras.'],
  ['Arroz com frango desfiado e queijo', [['arroz', 220], ['frango', 110], ['mussarela', 1]], 'Tudo misturado, queijo por cima.'],
  ['Panqueca de carne moída', [['wrap', 2], ['moida', 100], ['molhoTomate', 60], ['mussarela', 2]], 'Massa pronta, recheio de carne, molho e queijo por cima.'],
  ['Costela assada com arroz e batata', [['costela', 80], ['arroz', 150], ['batata', 150]], 'Costela desfiada, sem osso.'],
  ['Frango ao molho de tomate com macarrão', [['frango', 110], ['molhoTomate', 80], ['macarrao', 220]], 'Frango em cubos cozido no molho.'],
])

ampliar('jantar', 11, [
  ['Pizza de pão de forma', [['paoForma', 3], ['molhoTomate', 30], ['mussarela', 3], ['presunto', 2], ['leite', 150]], 'Na frigideira tampada ou airfryer, 5 minutos. Leite para acompanhar.'],
  ['Tapioca de frango e queijo', [['tapioca', 80], ['frango', 90], ['mussarela', 2]], 'Frango desfiado da semana como recheio.'],
  ['Cachorro-quente caseiro com batata', [['paoFrances', 1], ['salsicha', 2], ['molhoTomate', 30], ['batata', 100]], 'Salsicha fervida 3 minutos no molho; batata de micro-ondas.'],
  ['Misto quente duplo com leite', [['paoForma', 4], ['presunto', 3], ['mussarela', 3], ['leite', 100]], 'Dois sanduíches na frigideira.'],
  ['Nhoque com frango e requeijão', [['nhoque', 200], ['frango', 90], ['requeijao', 20]], 'Nhoque pronto: 2 minutos na água fervente.'],
  ['Linguiça com purê', [['linguica', 100], ['pure', 220]], 'Linguiça na airfryer, 12 minutos.'],
  ['Wrap de carne moída e queijo', [['wrap', 2], ['moida', 90], ['mussarela', 2]], 'Carne moída da semana, enrola e doura.'],
  ['Cuscuz com carne moída', [['cuscuz', 250], ['moida', 100]], 'Cuscuz de micro-ondas e a carne por cima.'],
  ['Polenta cremosa com frango', [['polenta', 300], ['frango', 110], ['mussarela', 1], ['requeijao', 15]], 'Polenta instantânea: 5 minutos mexendo.'],
  ['X-burguer com batata', [['paoHamburguer', 1], ['moida', 110], ['queijoPrato', 1], ['batataFrita', 60]], 'Disco de carne, 4 minutos de cada lado.'],
  ['Frango à milanesa com purê', [['milanesaFrango', 120], ['pure', 200]], 'Milanesa na airfryer, 12 minutos.'],
  ['Macarrão com almôndegas', [['macarrao', 180], ['moida', 90], ['molhoTomate', 80]], 'Almôndegas da semana, esquentadas no molho.'],
  ['Omelete de presunto com batata', [['ovo', 3], ['presunto', 2], ['mussarela', 1], ['batata', 200]], 'Batata de micro-ondas, 6 minutos.'],
  ['Lombo com arroz', [['lombo', 110], ['arroz', 180]], 'Sobra do lombo da semana.'],
  ['Sanduíche quente de frango com requeijão', [['paoFrances', 2], ['frango', 90], ['requeijao', 20]], 'Frango com requeijão, pão aquecido.'],
  ['Arroz de forno com carne moída', [['arroz', 180], ['moida', 90], ['mussarela', 2]], 'Micro-ondas até o queijo derreter.'],
  ['Bisteca com batata assada', [['bisteca', 110], ['batata', 250]], 'Bisteca na frigideira, 4 minutos de cada lado.'],
  ['Macarrão com queijo e frango', [['macarrao', 180], ['mussarela', 2], ['requeijao', 20], ['frango', 70]], 'Queijo e requeijão derretidos no macarrão quente.'],
  ['Coxa de frango com purê', [['coxa', 130], ['pure', 200]], 'Coxa na airfryer, 25 minutos.'],
  ['Pão com linguiça', [['paoFrances', 2], ['linguica', 90]], 'Linguiça aberta ao meio, na frigideira.'],
])

const BATA = 'Bata e beba devagar.'
ampliar('ceia', 6, [
  ['Vitamina de morango', [['leite', 250], ['morango', 150], ['mel', 10]], BATA],
  ['Vitamina de mamão com aveia', [['leite', 250], ['mamao', 150], ['aveia', 15]], BATA],
  ['Vitamina de abacate', [['leite', 250], ['abacate', 80], ['mel', 10]], BATA],
  ['Leite com achocolatado e aveia', [['leite', 300], ['achocolatado', 15], ['aveia', 15]], 'Bata para a aveia sumir.'],
  ['Iogurte batido com banana', [['iogurte', 250], ['banana', 1], ['mel', 10]], BATA],
  ['Vitamina de maçã com aveia', [['leite', 250], ['macaFruta', 1], ['aveia', 15]], 'Maçã sem casca, para ficar lisa.'],
  ['Mingau ralo de aveia', [['leite', 300], ['aveia', 25], ['mel', 5]], 'Morno, para dar sono.'],
  ['Vitamina de manga', [['leite', 250], ['manga', 150]], BATA],
  ['Leite com mel e pasta de amendoim', [['leite', 300], ['mel', 10], ['pastaAmendoim', 10]], 'Bata para dissolver a pasta.'],
  ['Vitamina de banana com leite em pó', [['leite', 250], ['banana', 1], ['leitePo', 15]], BATA],
  ['Iogurte batido com morango e mel', [['iogurte', 250], ['morango', 150], ['mel', 15]], BATA],
  ['Shake de doce de leite', [['leite', 300], ['doceLeite', 25]], BATA],
  ['Vitamina de mamão com Farinha Láctea', [['leite', 250], ['mamao', 100], ['farinhaLactea', 20]], BATA],
  ['Leite com Mucilon e mel', [['leite', 300], ['mucilon', 20], ['mel', 5]], 'Morno, mexendo bem.'],
  ['Vitamina de abacate com aveia', [['leite', 250], ['abacate', 60], ['aveia', 15]], BATA],
  ['Iogurte batido com manga', [['iogurte', 250], ['manga', 150], ['mel', 5]], BATA],
  ['Vitamina de banana e pasta de amendoim', [['leite', 250], ['banana', 1], ['pastaAmendoim', 10]], BATA],
  ['Leite com leite condensado e aveia', [['leite', 250], ['leiteCondensado', 20], ['aveia', 15]], 'Morno, mexendo bem.'],
  ['Vitamina de maçã e banana', [['leite', 200], ['macaFruta', 1], ['banana', 1]], BATA],
  ['Iogurte batido com aveia e doce de leite', [['iogurte', 250], ['aveia', 15], ['doceLeite', 15]], BATA],
  ['Shake de paçoca', [['leite', 300], ['pacoca', 1]], BATA],
  ['Vitamina de morango com Farinha Láctea', [['leite', 250], ['morango', 100], ['farinhaLactea', 20]], BATA],
  ['Vitamina de cereal', [['leite', 300], ['cerealMatinal', 25]], 'Bata até o cereal sumir.'],
  ['Vitamina de mamão e banana', [['leite', 250], ['mamao', 100], ['banana', 1]], BATA],
  ['Iogurte batido com granola', [['iogurte', 250], ['granola', 25], ['mel', 5]], 'Bata bem, para a granola não ficar em pedaços.'],
])

// ---- versão 2: receita completa de cada prato e pratos novos, um arquivo por categoria em scripts/receitas ----
const POR_CATEGORIA: Record<Categoria, { RECEITAS: Record<string, ReceitaDoPrato>; NOVOS: PratoNovo[] }> = { pre, cafe, lanche, almoco, jantar, ceia }
const RECEITA_DE = new Map<string, ReceitaDoPrato>()
for (const [categoria, { RECEITAS, NOVOS }] of Object.entries(POR_CATEGORIA) as [Categoria, (typeof POR_CATEGORIA)[Categoria]][]) {
  for (const [id, r] of Object.entries(RECEITAS)) RECEITA_DE.set(id, r)
  for (const novo of NOVOS) {
    BASE.push({ id: novo.id, nome: novo.nome, categoria, itens: novo.itens, preparo: novo.preparo })
    RECEITA_DE.set(novo.id, novo)
  }
}
const ids = new Set<string>()
for (const b of BASE) {
  if (ids.has(b.id)) throw new Error(`id repetido: ${b.id}`)
  ids.add(b.id)
  if (!RECEITA_DE.has(b.id)) throw new Error(`prato sem receita: ${b.id}`)
}
for (const id of RECEITA_DE.keys()) if (!ids.has(id)) throw new Error(`receita de prato que não existe: ${id}`)
// a ligação com o preparo de domingo pode vir da base antiga ou da receita nova
for (const b of BASE) {
  b.receita ??= RECEITA_DE.get(b.id)!.domingo
  if (b.receita && !Object.hasOwn(DE_DOMINGO, b.receita)) throw new Error(`${b.id} cita preparo de domingo que não existe: ${b.receita}`)
}

/** Campos da receita em texto de código, só os que existem. */
function receitaEmTexto(id: string): string {
  const { tempo, passos, etiquetas, temperos, levar, airfryer } = RECEITA_DE.get(id)!
  const campos: Record<string, unknown> = { tempo, passos, etiquetas, temperos: temperos?.length ? temperos : undefined, levar, airfryer }
  return Object.entries(campos).filter(([, v]) => v !== undefined).map(([k, v]) => `, ${k}: ${JSON.stringify(v)}`).join('')
}

const kcalDe = (id: IdAlimento, q: number) => {
  const a = ALIMENTOS[id]
  return ((typeof a.medida === 'object' ? q * a.medida.gramas : q) * a.kcal) / 100
}
const fixo = (id: IdAlimento) => ALIMENTOS[id].classe === 'suplemento'
const contado = (id: IdAlimento) => typeof ALIMENTOS[id].medida === 'object'
const passo = (id: IdAlimento, q: number) => (contado(id) ? 1 : ALIMENTOS[id].medida === 'ml' ? 50 : q < 40 ? 5 : 10)
const arredondar = (id: IdAlimento, q: number) => Math.max(passo(id, q), Math.round(q / passo(id, q)) * passo(id, q))

function ajustar(base: Base, fase: number): number[] {
  const alvo = ORCAMENTO[base.categoria][fase]
  // Acerta a divisão dos macros antes de fechar as calorias: a base é farta em carne e queijo, e a meta pede
  // mais carboidrato. Na fase 4 (definição) inverte: menos carboidrato e gordura, mais proteína.
  const VIES = fase !== 3
    ? { carbo: 1.1, gordura: 0.6, proteina: 0.75, laticinio: 1, outro: 1, suplemento: 1 }
    : { carbo: 0.9, gordura: 0.5, proteina: 0.95, laticinio: 1, outro: 1, suplemento: 1 }
  const vies = (id: IdAlimento) => VIES[ALIMENTOS[id].classe]
  const partida = base.itens.map(([id, q]) => (fixo(id) ? q : q * vies(id)))
  const kcalFixa = base.itens.reduce((s, [id], i) => s + (fixo(id) ? kcalDe(id, partida[i]) : 0), 0)
  const kcalLivre = base.itens.reduce((s, [id], i) => s + (fixo(id) ? 0 : kcalDe(id, partida[i])), 0)
  const fator = (alvo - kcalFixa) / kcalLivre
  // item contado (pão, banana, fatia) não encolhe: sanduíche precisa das duas fatias. Proteína contada pode ganhar uma unidade.
  const minimo = (i: number) => {
    const [id, q0] = base.itens[i]
    return contado(id) ? q0 : Math.max(passo(id, q0), arredondar(id, q0 * 0.5))
  }
  const q = base.itens.map(([id, q0], i) => {
    if (fixo(id)) return partida[i]
    if (contado(id)) return ALIMENTOS[id].classe === 'proteina' ? Math.min(q0 + 1, Math.max(q0, Math.round(partida[i] * fator))) : q0
    return Math.max(minimo(i), arredondar(id, partida[i] * fator))
  })
  const total = () => base.itens.reduce((s, [id], i) => s + kcalDe(id, q[i]), 0)
  // acerto fino: mexe no item por peso que mais pesa nas calorias, um passo por vez
  const candidatos = base.itens.map((_, i) => i).filter((i) => !fixo(base.itens[i][0]) && !contado(base.itens[i][0]))
  for (let volta = 0; volta < 12 && candidatos.length; volta++) {
    const erro = alvo - total()
    let melhor = -1, ganho = 0
    for (const i of candidatos) {
      const id = base.itens[i][0], p = passo(id, q[i]) * Math.sign(erro)
      if (q[i] + p < minimo(i)) continue
      const depois = Math.abs(erro - kcalDe(id, p))
      if (Math.abs(erro) - depois > ganho) { ganho = Math.abs(erro) - depois; melhor = i }
    }
    if (melhor < 0) break
    q[melhor] += passo(base.itens[melhor][0], q[melhor]) * Math.sign(erro)
  }
  return q
}

/**
 * Item contado não encolhe sozinho (sanduíche precisa das duas fatias). Quando mesmo assim o prato passa de 8% do
 * orçamento numa fase, tira uma unidade do item contado cuja unidade mais se aproxima do excesso e recalcula.
 */
function ajustarComRecuo(base: Base, fase: number): number[] {
  let atual = base
  for (let volta = 0; volta < 3; volta++) {
    const q = ajustar(atual, fase)
    const alvo = ORCAMENTO[base.categoria][fase]
    const excesso = base.itens.reduce((s, [id], i) => s + kcalDe(id, q[i]), 0) - alvo
    if (excesso <= alvo * 0.08) return q
    const candidatos = atual.itens.map(([id, q0], i) => ({ i, id, q0 })).filter(({ id, q0 }) => contado(id) && !fixo(id) && q0 > 1)
    if (!candidatos.length) return q
    const melhor = candidatos.reduce((a, b) => (Math.abs(kcalDe(a.id, 1) - excesso) <= Math.abs(kcalDe(b.id, 1) - excesso) ? a : b))
    atual = { ...atual, itens: atual.itens.map((item, i) => (i === melhor.i ? [item[0], item[1] - 1] : item)) }
  }
  return ajustar(atual, fase)
}

const linhas: string[] = []
let pior = 0
for (const b of BASE) {
  const porFase = [0, 1, 2, 3].map((f) => ajustarComRecuo(b, f))
  const itens = b.itens.map(([id], i) => `{ a: '${id}', q: [${porFase.map((q) => q[i]).join(', ')}] }`).join(', ')
  ;[0, 1, 2, 3].forEach((f) => {
    const kcal = b.itens.reduce((s, [id], i) => s + kcalDe(id, porFase[f][i]), 0)
    const desvio = Math.abs(kcal - ORCAMENTO[b.categoria][f]) / ORCAMENTO[b.categoria][f]
    pior = Math.max(pior, desvio)
    if (desvio > 0.1) console.log(`ATENÇÃO ${b.id} fase ${f + 1}: ${Math.round(kcal)} kcal para ${ORCAMENTO[b.categoria][f]} (${(desvio * 100).toFixed(1)}%)`)
  })
  linhas.push(`  ${b.id}: { nome: ${JSON.stringify(b.nome)}, categoria: '${b.categoria}', itens: [${itens}], preparo: ${JSON.stringify(b.preparo)}${b.receita ? `, receita: '${b.receita}'` : ''}${receitaEmTexto(b.id)} },`)
}

writeFileSync('src/conteudo/pratos.ts', `/**
 * Pratos do cardápio com a quantidade de cada ingrediente nas 4 fases: q = [fase 1, fase 2, fase 3, fase 4].
 * Arquivo gerado por scripts/gerar-pratos.ts. Para mudar um prato, edite a base lá e rode o script.
 */
import type { IdAlimento } from './alimentos'

export type Categoria = 'pre' | 'cafe' | 'lanche' | 'almoco' | 'jantar' | 'ceia'

export interface ItemDoPrato {
  a: IdAlimento
  q: readonly [number, number, number, number]
}

export type Etiqueta = 'doce' | 'salgado' | 'besteira' | 'marmita' | 'vegetariano'

export interface Prato {
  nome: string
  categoria: Categoria
  itens: readonly ItemDoPrato[]
  /** Resumo de uma frase, mostrado no cardápio do dia. */
  preparo: string
  /** Preparo de domingo em RECEITAS, quando o prato sai de uma receita feita para a semana. */
  receita?: string
  /** Minutos até estar pronto para comer. */
  tempo: number
  passos: readonly string[]
  etiquetas: readonly Etiqueta[]
  /** Ingredientes sem peso na conta: sal, alho em pó, orégano. */
  temperos?: readonly string[]
  /** Como levar para o trabalho. */
  levar?: string
  /** Versão na airfryer de quem leva fritura. */
  airfryer?: string
}

/** Calorias de cada categoria por fase. Três lanches por dia. */
export const ORCAMENTO: Record<Categoria, readonly [number, number, number, number]> = ${JSON.stringify(ORCAMENTO).replace(/"/g, '')}

export const PRATOS = {
${linhas.join('\n')}
} as const satisfies Record<string, Prato>

export type IdPrato = keyof typeof PRATOS
`)
console.log(`${BASE.length} pratos gravados. Maior desvio do orçamento: ${(pior * 100).toFixed(1)}%`)
