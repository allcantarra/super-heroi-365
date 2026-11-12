import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useState } from 'react'
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
  const estado = useLiveQuery<Estado, Estado>(
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

  const gravar = useCallback((acao: Promise<void>) => {
    setErroAoSalvar(false)
    return acao.catch(() => setErroAoSalvar(true))
  }, [])

  return {
    estado,
    erroAoSalvar,
    tentarDeNovo: useCallback(() => setTentativa((t) => t + 1), []),
    salvarPerfil: useCallback((p: Perfil) => gravar(salvarPerfil(p)), [gravar]),
    mudarDia: useCallback((data: string, mudanca: (r: RegistroDia) => RegistroDia) => gravar(mudarDia(data, mudanca)), [gravar]),
  }
}
