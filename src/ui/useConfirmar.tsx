import { useCallback, useId, useState, type ReactNode } from 'react'

interface Pedido {
  texto: string
  acao: string
  resolver: (ok: boolean) => void
}

/**
 * Confirmação no estilo do app, no lugar da caixa nativa do navegador.
 * `pedir` devolve uma promessa com a resposta; `dialogo` precisa ser posto na tela pela própria tela que pergunta.
 */
export function useConfirmar(): { pedir: (texto: string, acao?: string) => Promise<boolean>; dialogo: ReactNode } {
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const id = useId()
  const pedir = useCallback((texto: string, acao = 'Apagar') => new Promise<boolean>((resolver) => setPedido({ texto, acao, resolver })), [])
  const responder = (ok: boolean) => {
    pedido?.resolver(ok)
    setPedido(null)
  }
  const dialogo = pedido ? (
    <div className="fundo-modal" onClick={(e) => e.target === e.currentTarget && responder(false)}>
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby={`${id}-texto`}>
        <p id={`${id}-texto`}>{pedido.texto}</p>
        <div className="acoes">
          <button className="botao fantasma" onClick={() => responder(false)}>Cancelar</button>
          <button className="botao perigo principal" autoFocus onClick={() => responder(true)}>{pedido.acao}</button>
        </div>
      </div>
    </div>
  ) : null
  return { pedir, dialogo }
}
