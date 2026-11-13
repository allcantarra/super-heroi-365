/** Motivos de recusa de uma foto, com texto pronto para a tela. */
export class ErroDeFoto extends Error {}

const LIMITE_ORIGINAL = 40 * 1024 * 1024
/** Uns 50 megapixels: acima disso o Safari do iPhone pode fechar a aba ao desenhar no canvas. */
const LIMITE_PIXELS = 50_000_000

function carregar(url: string): Promise<HTMLImageElement> {
  return new Promise((resolver, rejeitar) => {
    const img = new Image()
    img.onload = () => resolver(img)
    img.onerror = () => rejeitar(new ErroDeFoto('Não consegui abrir essa imagem. Tente outra foto.'))
    img.src = url
  })
}

/**
 * Reduz a foto para no máximo `lado` px no lado maior e grava em JPEG. Uma foto de celular cai de uns 3 MB para uns 200 KB,
 * o que deixa um ano de fotos mensais ocupando poucos megas no aparelho. Os metadados (como localização) não são copiados.
 */
export async function comprimirImagem(arquivo: File, lado = 1080, qualidade = 0.82): Promise<Blob> {
  if (!arquivo.type.startsWith('image/')) throw new ErroDeFoto('Esse arquivo não é uma imagem. Escolha uma foto.')
  if (arquivo.size > LIMITE_ORIGINAL) throw new ErroDeFoto('Foto grande demais (mais de 40 MB). Escolha outra.')
  const url = URL.createObjectURL(arquivo)
  try {
    const img = await carregar(url)
    if (img.naturalWidth * img.naturalHeight > LIMITE_PIXELS) throw new ErroDeFoto('Imagem grande demais para o aparelho. Escolha uma foto comum da câmera.')
    const escala = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight))
    const tela = document.createElement('canvas')
    tela.width = Math.max(1, Math.round(img.naturalWidth * escala))
    tela.height = Math.max(1, Math.round(img.naturalHeight * escala))
    const ctx = tela.getContext('2d')
    if (!ctx) throw new ErroDeFoto('O aparelho não deixou processar a foto. Tente de novo.')
    ctx.drawImage(img, 0, 0, tela.width, tela.height)
    return await new Promise<Blob>((resolver, rejeitar) =>
      tela.toBlob((b) => (b ? resolver(b) : rejeitar(new ErroDeFoto('Não consegui salvar a foto. Tente de novo.'))), 'image/jpeg', qualidade),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}
