import { useCallback, useEffect, useState } from 'react'
import { APARENCIA_PADRAO, type Aparencia } from '../heroi/aparencia'
import { lerAparencia, pedirArmazenamentoPersistente, salvarAparencia } from './banco'

export type EstadoDados = 'carregando' | 'pronto' | 'erro'

/** Aparência do herói, lida do aparelho e gravada a cada mudança. */
export function useAparencia() {
  const [aparencia, setAparencia] = useState<Aparencia>(APARENCIA_PADRAO)
  const [estado, setEstado] = useState<EstadoDados>('carregando')
  const [erroAoSalvar, setErroAoSalvar] = useState(false)

  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    lerAparencia()
      .then((a) => {
        if (!ativo) return
        setAparencia(a)
        setEstado('pronto')
      })
      .catch(() => ativo && setEstado('erro'))
    return () => {
      ativo = false
    }
  }, [tentativa])

  const tentarDeNovo = useCallback(() => {
    setEstado('carregando')
    setTentativa((t) => t + 1)
  }, [])

  const mudar = useCallback((nova: Aparencia) => {
    setAparencia(nova)
    setErroAoSalvar(false)
    salvarAparencia(nova)
      .then(() => pedirArmazenamentoPersistente())
      .catch(() => setErroAoSalvar(true))
  }, [])

  return { aparencia, estado, erroAoSalvar, mudar, tentarDeNovo }
}
