import { ALIMENTOS, alimento, gramasDe, type IdAlimento, type Setor } from '../conteudo/alimentos'
import { CATEGORIA_DA_REFEICAO, REFEICOES, type IdRefeicao } from '../conteudo/cardapio'
import { PRATOS, type Categoria, type IdPrato, type Prato } from '../conteudo/pratos'
import { dataValida, diaDaSemana, diasEntre, faseDoDia, numeroDoDia, somarDias, type Fase } from './tempo'

export interface Macros {
  kcal: number
  p: number
  c: number
  g: number
}

const ZERO: Macros = { kcal: 0, p: 0, c: 0, g: 0 }
const somar = (a: Macros, b: Macros): Macros => ({ kcal: a.kcal + b.kcal, p: a.p + b.p, c: a.c + b.c, g: a.g + b.g })

export const prato = (id: IdPrato): Prato => PRATOS[id]

export function macrosDoItem(id: IdAlimento, quantidade: number): Macros {
  const a = alimento(id), fator = gramasDe(id, quantidade) / 100
  return { kcal: a.kcal * fator, p: a.p * fator, c: a.c * fator, g: a.g * fator }
}

export function macrosDoPrato(id: IdPrato, fase: Fase): Macros {
  return prato(id).itens.reduce((s, item) => somar(s, macrosDoItem(item.a, item.q[fase - 1])), ZERO)
}

/** Pratos de cada categoria, na ordem em que entram no rodízio do ano. */
export const DA_CATEGORIA = (() => {
  const mapa = {} as Record<Categoria, IdPrato[]>
  for (const id of Object.keys(PRATOS) as IdPrato[]) (mapa[PRATOS[id].categoria] ??= []).push(id)
  return mapa
})()

/** Segunda-feira da semana de uma data. */
export function segundaDe(data: string): string {
  return somarDias(data, -((diaDaSemana(data) + 6) % 7))
}

/** Semana do projeto: 0 é a semana (de segunda a domingo) em que cai o dia 1. */
export function semanaDe(diaUm: string, data: string): number {
  return Math.floor(diasEntre(segundaDe(diaUm), data) / 7)
}

export function fasePara(diaUm: string, data: string): Fase {
  return faseDoDia(Math.max(1, numeroDoDia(diaUm, data)))
}

/**
 * O almoço é marmita: três pratos por semana, feitos no domingo.
 * A vai na segunda, quarta e sexta; B na terça e quinta; C no sábado e domingo.
 */
export type Papel = 'A' | 'B' | 'C'
export const PAPEIS: readonly Papel[] = ['A', 'B', 'C']
export const DIAS_DO_PAPEL: Record<Papel, readonly number[]> = { A: [1, 3, 5], B: [2, 4], C: [6, 0] }

export function papelDoDia(diaSemana: number): Papel {
  return DIAS_DO_PAPEL.A.includes(diaSemana) ? 'A' : DIAS_DO_PAPEL.B.includes(diaSemana) ? 'B' : 'C'
}

const ciclo = <T>(lista: readonly T[], i: number): T => lista[((i % lista.length) + lista.length) % lista.length]

/** Trocas do usuário. Chave "s{semana}:{papel}" para a marmita da semana, "{data}:{refeição}" para o resto. */
export type Trocas = Record<string, IdPrato>

export const chaveDaMarmita = (semana: number, papel: Papel) => `s${semana}:${papel}`
export const chaveDaRefeicao = (data: string, refeicao: IdRefeicao) => `${data}:${refeicao}`

export function chaveDaTroca(diaUm: string, data: string, refeicao: IdRefeicao): string {
  return refeicao === 'almoco' ? chaveDaMarmita(semanaDe(diaUm, data), papelDoDia(diaDaSemana(data))) : chaveDaRefeicao(data, refeicao)
}

export function pratoServe(id: unknown, refeicao: IdRefeicao): id is IdPrato {
  return typeof id === 'string' && Object.hasOwn(PRATOS, id) && PRATOS[id as IdPrato].categoria === CATEGORIA_DA_REFEICAO[refeicao]
}

/**
 * Passo com que cada refeição anda pela sua lista de um dia para o outro. Passos diferentes fazem as refeições
 * se combinarem de formas diferentes; a cada volta completa a lista ainda desloca um pouco (o "giro").
 * Os passos não podem dividir o tamanho da lista, senão alguns pratos nunca aparecem: há teste para isso.
 */
const RODIZIO: Record<Exclude<IdRefeicao, 'almoco' | 'lancheTarde' | 'trajeto'>, { passo: number; giro: number }> = {
  pre: { passo: 7, giro: 1 },
  cafe: { passo: 11, giro: 2 },
  lancheManha: { passo: 19, giro: 3 },
  jantar: { passo: 13, giro: 4 },
  ceia: { passo: 17, giro: 5 },
}

/** Prato que o rodízio do ano dá para uma refeição em uma data, antes de qualquer troca. */
export function pratoOriginal(diaUm: string, data: string, refeicao: IdRefeicao): IdPrato {
  const lista = DA_CATEGORIA[CATEGORIA_DA_REFEICAO[refeicao]], n = lista.length, terco = Math.floor(n / 3)
  if (refeicao === 'almoco') {
    // três marmitas por semana, cada uma andando pela lista inteira ao longo do ano, sem repetir na semana seguinte
    return ciclo(lista, semanaDe(diaUm, data) + PAPEIS.indexOf(papelDoDia(diaDaSemana(data))) * terco)
  }
  // dias corridos desde a segunda da semana 0
  const t = diasEntre(segundaDe(diaUm), data)
  // os três lanches do dia saem da mesma lista, separados por um terço dela
  const { passo, giro } = RODIZIO[refeicao === 'lancheTarde' || refeicao === 'trajeto' ? 'lancheManha' : refeicao]
  const salto = refeicao === 'lancheTarde' ? terco : refeicao === 'trajeto' ? 2 * terco : 0
  return ciclo(lista, t * passo + Math.floor(t / n) * giro + salto)
}

/** Prato de uma refeição em uma data, já com a troca do usuário, se houver. */
export function pratoDaData(diaUm: string, data: string, refeicao: IdRefeicao, trocas: Trocas): IdPrato {
  const trocado = trocas[chaveDaTroca(diaUm, data, refeicao)]
  return pratoServe(trocado, refeicao) ? trocado : pratoOriginal(diaUm, data, refeicao)
}

export function cardapioDaData(diaUm: string, data: string, trocas: Trocas): Record<IdRefeicao, IdPrato> {
  return Object.fromEntries(REFEICOES.map((r) => [r, pratoDaData(diaUm, data, r, trocas)])) as Record<IdRefeicao, IdPrato>
}

export function macrosDaData(diaUm: string, data: string, trocas: Trocas): Macros {
  const fase = fasePara(diaUm, data)
  return REFEICOES.reduce((s, r) => somar(s, macrosDoPrato(pratoDaData(diaUm, data, r, trocas), fase)), ZERO)
}

/** Outros pratos que servem para a mesma refeição. Todos fecham no mesmo orçamento de calorias, então a troca não desmonta o dia. */
export function alternativas(refeicao: IdRefeicao, atual: IdPrato): IdPrato[] {
  return DA_CATEGORIA[CATEGORIA_DA_REFEICAO[refeicao]].filter((id) => id !== atual)
}

export function normalizarTrocas(dado: unknown): Trocas {
  if (!dado || typeof dado !== 'object') return {}
  const trocas: Trocas = {}
  for (const [chave, valor] of Object.entries(dado as Record<string, unknown>)) {
    if (/^s\d{1,3}:[ABC]$/.test(chave)) {
      if (pratoServe(valor, 'almoco')) trocas[chave] = valor
      continue
    }
    const i = chave.indexOf(':'), data = chave.slice(0, i), refeicao = chave.slice(i + 1)
    if (dataValida(data) && refeicao !== 'almoco' && (REFEICOES as readonly string[]).includes(refeicao) && pratoServe(valor, refeicao as IdRefeicao)) trocas[chave] = valor
  }
  return trocas
}

export interface Marmita {
  papel: Papel
  prato: IdPrato
  /** Datas da semana em que essa marmita é o almoço. */
  datas: string[]
}

/** As três marmitas de uma semana, para o preparo de domingo. */
export function marmitasDaSemana(diaUm: string, segunda: string, trocas: Trocas): Marmita[] {
  return PAPEIS.map((papel) => {
    const datas = DIAS_DO_PAPEL[papel].map((d) => somarDias(segunda, (d + 6) % 7))
    return { papel, prato: pratoDaData(diaUm, datas[0], 'almoco', trocas), datas }
  })
}

/** As 7 datas (segunda a domingo) de uma semana. */
export function datasDaSemana(segunda: string): string[] {
  return Array.from({ length: 7 }, (_, i) => somarDias(segunda, i))
}

export interface ItemDeCompra {
  id: IdAlimento
  nome: string
  /** Quantidade a comprar, em g, ml ou unidades, já convertida para peso cru. */
  quantidade: number
  texto: string
}

function textoDeCompra(id: IdAlimento, quantidade: number): string {
  const a = alimento(id)
  if (typeof a.medida === 'object') {
    const n = Math.ceil(quantidade)
    if (id === 'ovo') return n >= 12 ? `${Math.ceil(n / 12)} dz` : `${n} un`
    return `${n} ${n === 1 ? a.medida.singular : a.medida.plural}`
  }
  const grande = a.medida === 'ml' ? 'L' : 'kg'
  if (quantidade >= 1000) return `${(Math.ceil(quantidade / 100) / 10).toFixed(1).replace('.', ',')} ${grande}`
  return `${Math.ceil(quantidade / 10) * 10} ${a.medida}`
}

/** Soma tudo que o cardápio pede nas datas dadas e converte para o que se compra (arroz cru, carne crua). */
export function listaDeCompras(diaUm: string, datas: readonly string[], trocas: Trocas): { setor: Setor; itens: ItemDeCompra[] }[] {
  const total = new Map<IdAlimento, number>()
  for (const data of datas) {
    const fase = fasePara(diaUm, data)
    for (const refeicao of REFEICOES) {
      for (const item of prato(pratoDaData(diaUm, data, refeicao, trocas)).itens) total.set(item.a, (total.get(item.a) ?? 0) + item.q[fase - 1])
    }
  }
  // alimentos diferentes podem ser a mesma compra (batata cozida, frita e purê são "Batata"): soma pelo nome
  const porNome = new Map<string, { id: IdAlimento; setor: Setor; quantidade: number }>()
  for (const [id, consumido] of total) {
    const a: (typeof ALIMENTOS)[IdAlimento] & { compra?: string; fatorCompra?: number } = ALIMENTOS[id]
    const nome = a.compra ?? a.nome, atual = porNome.get(nome)
    porNome.set(nome, { id: atual?.id ?? id, setor: a.setor, quantidade: (atual?.quantidade ?? 0) + consumido * (a.fatorCompra ?? 1) })
  }
  const setores = new Map<Setor, ItemDeCompra[]>()
  for (const [nome, { id, setor, quantidade }] of porNome) {
    const lista = setores.get(setor) ?? []
    lista.push({ id, nome, quantidade, texto: textoDeCompra(id, quantidade) })
    setores.set(setor, lista)
  }
  const ordem: Setor[] = ['Açougue', 'Frios e laticínios', 'Padaria', 'Hortifruti', 'Mercearia', 'Suplementos']
  return ordem.filter((s) => setores.has(s)).map((setor) => ({ setor, itens: setores.get(setor)!.sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR')) }))
}
