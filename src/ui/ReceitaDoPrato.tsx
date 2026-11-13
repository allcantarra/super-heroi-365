import { Clock, Flame, Package } from 'lucide-react'
import { alimento, textoQuantidade } from '../conteudo/alimentos'
import { PRATOS, type Categoria, type Etiqueta, type IdPrato, type Prato } from '../conteudo/pratos'
import { RECEITAS, type IdReceita } from '../conteudo/receitas'
import type { Fase } from '../dominio/tempo'

export const ETIQUETAS: Record<Etiqueta, string> = { doce: 'Doce', salgado: 'Salgado', besteira: 'Besteira planejada', marmita: 'Marmita', vegetariano: 'Vegetariano' }
export const NOME_DA_CATEGORIA: Record<Categoria, string> = { pre: 'Pré-treino', cafe: 'Café reforçado', lanche: 'Lanches', almoco: 'Almoço (marmita)', jantar: 'Jantar', ceia: 'Ceia' }

/** Minúsculas e sem acento, para a busca achar "acai" em "Açaí". */
const normalizar = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const TEXTO_DE_BUSCA = new Map((Object.keys(PRATOS) as IdPrato[]).map((id) => {
  const p: Prato = PRATOS[id]
  return [id, normalizar([p.nome, ...p.itens.map((i) => alimento(i.a).nome), ...(p.temperos ?? [])].join(' '))]
}))

/** Pratos que casam com todas as palavras da busca, a refeição e a etiqueta, em ordem alfabética. */
export function buscarReceitas(busca: string, categoria?: Categoria, etiqueta?: Etiqueta): IdPrato[] {
  const palavras = normalizar(busca).split(/\s+/).filter(Boolean)
  return (Object.keys(PRATOS) as IdPrato[])
    .filter((id) => {
      const p: Prato = PRATOS[id]
      if (categoria && p.categoria !== categoria) return false
      if (etiqueta && !p.etiquetas.includes(etiqueta)) return false
      const texto = TEXTO_DE_BUSCA.get(id)!
      return palavras.every((w) => texto.includes(w))
    })
    .sort((a, b) => PRATOS[a].nome.localeCompare(PRATOS[b].nome, 'pt-BR'))
}

/** Receita completa de um prato com as quantidades da fase. No cardápio do dia os ingredientes já aparecem acima. */
export function ReceitaDoPrato({ id, fase, semIngredientes = false }: { id: IdPrato; fase: Fase; semIngredientes?: boolean }) {
  const p: Prato = PRATOS[id]
  const domingo = p.receita ? RECEITAS[p.receita as IdReceita] : undefined
  return (
    <div className="receita-corpo">
      <p className="etiquetas">
        <span><Clock aria-hidden />{p.tempo} min</span>
        {p.etiquetas.map((e) => <span key={e} className={e === 'besteira' ? 'besteira' : undefined}>{ETIQUETAS[e]}</span>)}
      </p>
      {!semIngredientes && (
        <>
          <h4>Ingredientes</h4>
          <ul>
            {p.itens.map((item) => <li key={item.a}>{alimento(item.a).nome}: <b>{textoQuantidade(item.a, item.q[fase - 1])}</b></li>)}
            {p.temperos?.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </>
      )}
      {semIngredientes && p.temperos?.length ? <p className="resumo">Temperos: {p.temperos.join(', ').toLowerCase()}.</p> : null}
      <h4>Modo de preparo</h4>
      <ol>{p.passos.map((passo) => <li key={passo}>{passo}</li>)}</ol>
      {p.airfryer && <p className="receita-nota"><Flame aria-hidden /><span><b>Na airfryer:</b> {p.airfryer}</span></p>}
      {p.levar && <p className="receita-nota"><Package aria-hidden /><span><b>Para levar:</b> {p.levar}</span></p>}
      {domingo && semIngredientes && <p className="resumo">{domingo.tipo === 'Marmita da semana' ? 'Preparo de domingo' : 'Receita base'}: {domingo.nome}, no livro de receitas.</p>}
      {domingo && !semIngredientes && (
        <details className="receita-domingo">
          <summary>{domingo.tipo === 'Marmita da semana' ? 'Preparo de domingo' : 'Receita base'}: {domingo.nome}</summary>
          <p className="resumo">Rende {domingo.rende}, em {domingo.tempo}.</p>
          <ul>{domingo.ingredientes.map((i) => <li key={i}>{i}</li>)}</ul>
          <ol>{domingo.passos.map((i) => <li key={i}>{i}</li>)}</ol>
        </details>
      )}
    </div>
  )
}
