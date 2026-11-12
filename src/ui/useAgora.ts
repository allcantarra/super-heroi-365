import { useEffect, useState } from 'react'

/** Relógio do app: atualiza a cada 20 s e sempre que o app volta para a frente. É o que faz o dia virar e o corte das 15h valer sozinho. */
export function useAgora(): Date {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const atualizar = () => setAgora(new Date())
    const id = setInterval(atualizar, 20_000)
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
