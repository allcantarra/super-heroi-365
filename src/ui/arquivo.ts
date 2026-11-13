/**
 * Entrega um arquivo gerado pelo app. No iPhone abre a folha de compartilhar (salvar em Arquivos, abrir no Calendário);
 * onde não houver compartilhamento de arquivo, cai para o download comum.
 * Devolve 'cancelado' quando a pessoa fecha a folha de compartilhar sem escolher nada.
 */
export async function entregarArquivo(nome: string, tipo: string, conteudo: string | Blob): Promise<'compartilhado' | 'baixado' | 'cancelado'> {
  const blob = typeof conteudo === 'string' ? new Blob([conteudo], { type: tipo }) : conteudo
  const arquivo = new File([blob], nome, { type: tipo })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.canShare?.({ files: [arquivo] }) && nav.share) {
    try {
      await nav.share({ files: [arquivo], title: nome })
      return 'compartilhado'
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelado'
      // compartilhamento recusado por outro motivo: segue para o download
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'baixado'
}

/** Lê um arquivo escolhido pela pessoa como texto. */
export function lerTexto(arquivo: File): Promise<string> {
  return arquivo.text()
}
