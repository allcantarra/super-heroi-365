import { ALIMENTOS, alimento, gramasDe, type IdAlimento, type Setor } from '../conteudo/alimentos'
import { CATEGORIA_DA_REFEICAO, MODELOS, REFEICOES, type IdRefeicao } from '../conteudo/cardapio'
import { PRATOS, type IdPrato, type Prato } from '../conteudo/pratos'
import type { Fase } from './tempo'

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

/** Trocas do usuário: chave "diaDaSemana:refeição". */
export type Trocas = Record<string, IdPrato>

export const chaveDaTroca = (diaSemana: number, refeicao: IdRefeicao) => `${diaSemana}:${refeicao}`

export function pratoServe(id: unknown, refeicao: IdRefeicao): id is IdPrato {
  return typeof id === 'string' && id in PRATOS && PRATOS[id as IdPrato].categoria === CATEGORIA_DA_REFEICAO[refeicao]
}

/** Prato de uma refeição em um dia da semana, já com a troca do usuário, se houver. */
export function pratoDoDia(diaSemana: number, refeicao: IdRefeicao, trocas: Trocas): IdPrato {
  const trocado = trocas[chaveDaTroca(diaSemana, refeicao)]
  return pratoServe(trocado, refeicao) ? trocado : MODELOS[diaSemana][refeicao]
}

export function cardapioDoDia(diaSemana: number, trocas: Trocas): Record<IdRefeicao, IdPrato> {
  return Object.fromEntries(REFEICOES.map((r) => [r, pratoDoDia(diaSemana, r, trocas)])) as Record<IdRefeicao, IdPrato>
}

export function macrosDoDia(diaSemana: number, fase: Fase, trocas: Trocas): Macros {
  return REFEICOES.reduce((s, r) => somar(s, macrosDoPrato(pratoDoDia(diaSemana, r, trocas), fase)), ZERO)
}

/** Outros pratos que servem para a mesma refeição. Todos fecham no mesmo orçamento de calorias, então a troca não desmonta o dia. */
export function alternativas(refeicao: IdRefeicao, atual: IdPrato, fase: Fase): { id: IdPrato; macros: Macros }[] {
  const categoria = CATEGORIA_DA_REFEICAO[refeicao]
  return (Object.keys(PRATOS) as IdPrato[])
    .filter((id) => id !== atual && PRATOS[id].categoria === categoria)
    .map((id) => ({ id, macros: macrosDoPrato(id, fase) }))
}

export function normalizarTrocas(dado: unknown): Trocas {
  if (!dado || typeof dado !== 'object') return {}
  const trocas: Trocas = {}
  for (const [chave, valor] of Object.entries(dado as Record<string, unknown>)) {
    const [dia, refeicao] = chave.split(':')
    if (/^[0-6]$/.test(dia) && (REFEICOES as readonly string[]).includes(refeicao) && pratoServe(valor, refeicao as IdRefeicao)) trocas[chave] = valor
  }
  return trocas
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

/** Soma tudo que o cardápio da semana pede e converte para o que se compra (arroz cru, carne crua). */
export function listaDeCompras(fase: Fase, trocas: Trocas, semanas: number): { setor: Setor; itens: ItemDeCompra[] }[] {
  const total = new Map<IdAlimento, number>()
  for (let dia = 0; dia < 7; dia++) {
    for (const refeicao of REFEICOES) {
      for (const item of prato(pratoDoDia(dia, refeicao, trocas)).itens) {
        total.set(item.a, (total.get(item.a) ?? 0) + item.q[fase - 1] * semanas)
      }
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
