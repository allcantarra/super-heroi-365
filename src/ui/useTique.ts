import { useEffect, useState } from 'react'

/**
 * Instante atual em milissegundos, renovado quatro vezes por segundo e sempre que o app volta para a frente.
 * Serve só para redesenhar: quem conta o tempo é a diferença entre instantes, que continua certa com o app em segundo plano.
 */
export function useTique(): number {
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    const atualizar = () => setAgora(Date.now())
    const id = setInterval(atualizar, 250)
    document.addEventListener('visibilitychange', atualizar)
    window.addEventListener('focus', atualizar)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', atualizar)
      window.removeEventListener('focus', atualizar)
    }
  }, [])
  return agora
}

/** Instante atual, para usar dentro de toques e efeitos (nunca durante o desenho da tela). */
export const instante = (): number => Date.now()
