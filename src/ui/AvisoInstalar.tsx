import { useState } from 'react'
import { precisaInstalar } from './instalacao'

const CHAVE = 'aviso-instalar-fechado'

function emModoApp(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true || window.matchMedia('(display-mode: standalone)').matches
}

export function AvisoInstalar() {
  const [visivel, setVisivel] = useState(() => precisaInstalar(navigator.userAgent, emModoApp()) && sessionStorage.getItem(CHAVE) !== '1')
  if (!visivel) return null
  return (
    <div className="faixa" role="status">
      <span>Para instalar: toque em Compartilhar e depois em "Adicionar à Tela de Início".</span>
      <button
        onClick={() => {
          sessionStorage.setItem(CHAVE, '1')
          setVisivel(false)
        }}
      >
        Entendi
      </button>
    </div>
  )
}
