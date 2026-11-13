import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { RegistroDia } from '../dominio/dia'
import { lerDias, lerPerfil, mudarDia, salvarPerfil, type Perfil } from './banco'

export interface Dados {
  perfil: Perfil
  dias: Map<string, RegistroDia>
}

type Estado = { fase: 'carregando' } | { fase: 'erro' } | { fase: 'pronto'; dados: Dados }

/** Tudo que o app lê do aparelho. Atualiza sozinho quando qualquer gravação acontece. */
export function useDados() {
  const [tentativa, setTentativa] = useState(0)
  const lido = useLiveQuery<Estado, Estado>(
    async () => {
      try {
        const [perfil, dias] = await Promise.all([lerPerfil(), lerDias()])
        return { fase: 'pronto', dados: { perfil, dias } }
      } catch {
        return { fase: 'erro' }
      }
    },
    [tentativa],
    { fase: 'carregando' },
  )
  const [erroAoSalvar, setErroAoSalvar] = useState(false)
  // Perfil recém-salvo, mostrado na hora: lista suspensa e caixa de marcar não podem "voltar" enquanto o banco grava.
  const [perfilPendente, setPerfilPendente] = useState<Perfil | null>(null)
  const gravando = useRef(0)

  useEffect(() => {
    // chegou leitura nova do banco e não há gravação em curso: o banco volta a mandar
    if (gravando.current === 0) setPerfilPendente(null)
  }, [lido])

  const gravarPerfil = useCallback((perfil: Perfil) => {
    setErroAoSalvar(false)
    setPerfilPendente(perfil)
    gravando.current++
    return salvarPerfil(perfil)
      .catch(() => {
        setPerfilPendente(null)
        setErroAoSalvar(true)
      })
      .finally(() => {
        gravando.current--
      })
  }, [])

  const gravarDia = useCallback((data: string, mudanca: (r: RegistroDia) => RegistroDia) => {
    setErroAoSalvar(false)
    return mudarDia(data, mudanca).catch(() => setErroAoSalvar(true))
  }, [])

  const estado: Estado = lido.fase === 'pronto' && perfilPendente ? { fase: 'pronto', dados: { ...lido.dados, perfil: perfilPendente } } : lido

  return {
    estado,
    erroAoSalvar,
    tentarDeNovo: useCallback(() => setTentativa((t) => t + 1), []),
    salvarPerfil: gravarPerfil,
    mudarDia: gravarDia,
  }
}
