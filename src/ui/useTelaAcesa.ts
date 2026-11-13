import { useEffect, useState } from 'react'

interface Trava {
  release: () => Promise<void>
  addEventListener: (tipo: 'release', aoSoltar: () => void) => void
}

type NavegadorComTrava = Navigator & { wakeLock?: { request: (tipo: 'screen') => Promise<Trava> } }

/**
 * Mantém a tela acesa enquanto `ativa` for verdadeiro (Screen Wake Lock).
 * O navegador solta a trava sempre que o app sai da frente; por isso ela é pedida de novo a cada volta.
 * Devolve o estado da trava: em iPhone antigo ou com economia de bateria, o pedido pode ser negado.
 */
export type TelaAcesa = 'pedindo' | 'acesa' | 'negada'

export function useTelaAcesa(ativa: boolean): TelaAcesa {
  const [acesa, setAcesa] = useState<TelaAcesa>(() => ((navigator as NavegadorComTrava).wakeLock ? 'pedindo' : 'negada'))

  useEffect(() => {
    const api = (navigator as NavegadorComTrava).wakeLock
    if (!ativa || !api) return
    let trava: Trava | null = null
    let encerrado = false

    const pedir = async () => {
      if (encerrado || trava || document.visibilityState !== 'visible') return
      try {
        const nova = await api.request('screen')
        if (encerrado) {
          void nova.release()
          return
        }
        trava = nova
        setAcesa('acesa')
        nova.addEventListener('release', () => {
          if (trava === nova) trava = null
          if (!encerrado) setAcesa('pedindo')
        })
      } catch {
        if (!encerrado) setAcesa('negada')
      }
    }

    void pedir()
    document.addEventListener('visibilitychange', pedir)
    return () => {
      encerrado = true
      document.removeEventListener('visibilitychange', pedir)
      void trava?.release().catch(() => {})
      trava = null
      setAcesa('pedindo')
    }
  }, [ativa])

  return acesa
}
