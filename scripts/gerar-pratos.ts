/**
 * Calcula as quantidades de cada prato para as 4 fases e grava src/conteudo/pratos.ts com números explícitos.
 * Cada categoria de refeição tem um orçamento de calorias por fase; como todo prato da categoria fecha no
 * mesmo orçamento, qualquer combinação (inclusive as trocas do usuário) bate a meta do dia.
 * Rodar: node scripts/gerar-pratos.ts   (depois de mudar a base abaixo ou a tabela de alimentos)
 */
import { writeFileSync } from 'node:fs'
import { ALIMENTOS, type IdAlimento } from '../src/conteudo/alimentos.ts'

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

  { id: 'cafe1', nome: 'Ovos mexidos, pão e shake de whey', categoria: 'cafe', itens: [['ovo', 2], ['paoFrances', 1], ['leite', 200], ['whey', 30], ['creatina', 5]], preparo: 'Whey e creatina batidos no leite.' },
  { id: 'cafe2', nome: 'Vitamina de whey, banana e aveia', categoria: 'cafe', itens: [['leite', 300], ['banana', 1], ['aveia', 30], ['whey', 30], ['maca', 5], ['creatina', 5]], preparo: 'Bata tudo no liquidificador.', receita: 'shakePosTreino' },
  { id: 'cafe3', nome: 'Misto quente e shake de whey', categoria: 'cafe', itens: [['paoForma', 2], ['mussarela', 2], ['presunto', 2], ['leite', 200], ['whey', 30], ['creatina', 5]], preparo: 'Whey e creatina batidos no leite.' },
  { id: 'cafe4', nome: 'Panqueca de aveia e banana com whey', categoria: 'cafe', itens: [['ovo', 2], ['banana', 1], ['aveia', 30], ['leite', 150], ['whey', 30], ['creatina', 5]], preparo: 'Whey e creatina batidos no leite, para beber junto.', receita: 'panquecaAveia' },
  { id: 'cafe5', nome: 'Pão de queijo e shake de whey', categoria: 'cafe', itens: [['paoQueijo', 2], ['leite', 200], ['achocolatado', 10], ['whey', 30], ['creatina', 5]], preparo: 'Whey, creatina e achocolatado batidos no leite.' },

  { id: 'lanche1', nome: 'Sanduíche de presunto e queijo', categoria: 'lanche', itens: [['paoForma', 2], ['presunto', 2], ['mussarela', 1], ['requeijao', 10]], preparo: 'Monte em casa e leve embrulhado.' },
  { id: 'lanche2', nome: 'Sanduíche de pasta de amendoim', categoria: 'lanche', itens: [['paoForma', 2], ['pastaAmendoim', 15]], preparo: 'Monte em casa e leve embrulhado.' },
  { id: 'lanche3', nome: 'Vitamina de Farinha Láctea na garrafa', categoria: 'lanche', itens: [['leite', 250], ['farinhaLactea', 25]], preparo: 'Bata de manhã e leve em garrafa térmica.', receita: 'vitaminaFarinhaLactea' },
  { id: 'lanche4', nome: 'Banana, pasta de amendoim e leite', categoria: 'lanche', itens: [['banana', 1], ['pastaAmendoim', 15], ['leite', 150]], preparo: 'Leite em garrafa térmica; a pasta vai num potinho.' },
  { id: 'lanche5', nome: 'Iogurte com aveia e mel', categoria: 'lanche', itens: [['iogurte', 170], ['aveia', 25], ['mel', 10]], preparo: 'Leve a aveia separada e misture na hora.' },
  { id: 'lanche6', nome: 'Esfiha de carne e suco', categoria: 'lanche', itens: [['esfiha', 1], ['sucoLaranja', 150]], preparo: 'Vale comprar pronto na padaria.' },
  { id: 'lanche7', nome: 'Biscoito com queijo minas', categoria: 'lanche', itens: [['creamCracker', 30], ['minas', 40]], preparo: 'Queijo em fatias num pote.' },
  { id: 'lanche8', nome: 'Sanduíche de frango desfiado', categoria: 'lanche', itens: [['paoFrances', 1], ['frango', 50], ['requeijao', 10]], preparo: 'Use o frango da marmita, desfiado com requeijão.' },
  { id: 'lanche9', nome: 'Vitamina de Mucilon na garrafa', categoria: 'lanche', itens: [['leite', 250], ['mucilon', 25]], preparo: 'Bata de manhã e leve em garrafa térmica.' },

  { id: 'almoco1', nome: 'Arroz, bife e batata', categoria: 'almoco', itens: [['arroz', 150], ['patinho', 120], ['batata', 150], ['azeite', 5]], preparo: 'Batata assada na airfryer, com o azeite.', receita: 'batataAssada' },
  { id: 'almoco2', nome: 'Arroz com carne moída e ovo', categoria: 'almoco', itens: [['arroz', 160], ['moida', 120], ['ovo', 1]], preparo: 'Ovo cozido, para aguentar a marmita.', receita: 'carneMoida' },
  { id: 'almoco3', nome: 'Macarrão à bolonhesa', categoria: 'almoco', itens: [['macarrao', 200], ['moida', 100], ['molhoTomate', 80], ['mussarela', 1]], preparo: 'Queijo por cima, derrete no micro-ondas.', receita: 'bolonhesa' },
  { id: 'almoco4', nome: 'Frango, purê e arroz', categoria: 'almoco', itens: [['frango', 130], ['pure', 150], ['arroz', 120]], preparo: 'Frango em cubos, grelhado.', receita: 'pureBatata' },
  { id: 'almoco5', nome: 'Sobrecoxa assada, arroz e batata', categoria: 'almoco', itens: [['sobrecoxa', 120], ['arroz', 140], ['batata', 120]], preparo: 'Sobrecoxa e batata assadas juntas.' },
  { id: 'almoco6', nome: 'Escondidinho de carne moída', categoria: 'almoco', itens: [['pure', 250], ['moida', 120], ['mussarela', 2]], preparo: 'Camada de carne, purê por cima e queijo.', receita: 'pureBatata' },
  { id: 'almoco7', nome: 'Macarrão com frango e requeijão', categoria: 'almoco', itens: [['macarrao', 200], ['frango', 110], ['requeijao', 20], ['molhoTomate', 50]], preparo: 'Misture o requeijão no molho quente.', receita: 'frangoCremoso' },

  { id: 'jantar1', nome: 'Hambúrguer caseiro no pão', categoria: 'jantar', itens: [['moida', 110], ['paoFrances', 1], ['mussarela', 1]], preparo: 'Um disco de carne moída, 4 minutos de cada lado.', receita: 'hamburguer' },
  { id: 'jantar2', nome: 'Bife com batata frita e arroz', categoria: 'jantar', itens: [['patinho', 100], ['batataFrita', 90], ['arroz', 80]], preparo: 'Na Fase 4, troque a batata frita pela assada.' },
  { id: 'jantar3', nome: 'Omelete de queijo com arroz', categoria: 'jantar', itens: [['ovo', 3], ['mussarela', 2], ['arroz', 120]], preparo: 'Pronto em 8 minutos.', receita: 'omelete' },
  { id: 'jantar4', nome: 'Macarrão alho e óleo com frango', categoria: 'jantar', itens: [['macarrao', 180], ['frango', 110], ['azeite', 8]], preparo: 'Alho em pó no azeite, sem pedaços.' },
  { id: 'jantar5', nome: 'Arroz, frango e ovo', categoria: 'jantar', itens: [['arroz', 150], ['frango', 110], ['ovo', 1]], preparo: 'Ovo frito por cima.' },
  { id: 'jantar6', nome: 'Purê com carne moída', categoria: 'jantar', itens: [['pure', 200], ['moida', 110]], preparo: 'Sobra da marmita serve.', receita: 'pureBatata' },
  { id: 'jantar7', nome: 'Churrasco com arroz', categoria: 'jantar', itens: [['picanha', 110], ['arroz', 130]], preparo: 'Picanha na frigideira bem quente.' },

  { id: 'ceia1', nome: 'Vitamina de Mucilon com banana', categoria: 'ceia', itens: [['leite', 250], ['mucilon', 20], ['banana', 1]], preparo: 'Bata e beba devagar.', receita: 'mucilonNoturno' },
  { id: 'ceia2', nome: 'Vitamina de Farinha Láctea', categoria: 'ceia', itens: [['leite', 250], ['farinhaLactea', 25]], preparo: 'Bata e beba devagar.', receita: 'vitaminaFarinhaLactea' },
  { id: 'ceia3', nome: 'Iogurte batido com aveia e mel', categoria: 'ceia', itens: [['iogurte', 200], ['leite', 100], ['aveia', 20], ['mel', 10]], preparo: 'Bata até ficar cremoso.' },
  { id: 'ceia4', nome: 'Leite com achocolatado e pasta de amendoim', categoria: 'ceia', itens: [['leite', 250], ['achocolatado', 15], ['pastaAmendoim', 10]], preparo: 'Bata para dissolver a pasta.' },
]

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

const linhas: string[] = []
let pior = 0
for (const b of BASE) {
  const porFase = [0, 1, 2, 3].map((f) => ajustar(b, f))
  const itens = b.itens.map(([id], i) => `{ a: '${id}', q: [${porFase.map((q) => q[i]).join(', ')}] }`).join(', ')
  ;[0, 1, 2, 3].forEach((f) => {
    const kcal = b.itens.reduce((s, [id], i) => s + kcalDe(id, porFase[f][i]), 0)
    const desvio = Math.abs(kcal - ORCAMENTO[b.categoria][f]) / ORCAMENTO[b.categoria][f]
    pior = Math.max(pior, desvio)
    if (desvio > 0.1) console.log(`ATENÇÃO ${b.id} fase ${f + 1}: ${Math.round(kcal)} kcal para ${ORCAMENTO[b.categoria][f]} (${(desvio * 100).toFixed(1)}%)`)
  })
  linhas.push(`  ${b.id}: { nome: ${JSON.stringify(b.nome)}, categoria: '${b.categoria}', itens: [${itens}], preparo: ${JSON.stringify(b.preparo)}${b.receita ? `, receita: '${b.receita}'` : ''} },`)
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

export interface Prato {
  nome: string
  categoria: Categoria
  itens: readonly ItemDoPrato[]
  preparo: string
  receita?: string
}

/** Calorias de cada categoria por fase. Três lanches por dia. */
export const ORCAMENTO: Record<Categoria, readonly [number, number, number, number]> = ${JSON.stringify(ORCAMENTO).replace(/"/g, '')}

export const PRATOS = {
${linhas.join('\n')}
} as const satisfies Record<string, Prato>

export type IdPrato = keyof typeof PRATOS
`)
console.log(`${BASE.length} pratos gravados. Maior desvio do orçamento: ${(pior * 100).toFixed(1)}%`)
