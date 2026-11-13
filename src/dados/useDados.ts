import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RegistroDia } from '../dominio/dia'
import type { Medida, Pesagem } from '../dominio/evolucao'
import type { Sessao } from '../dominio/treino'
import {
  apagarFoto, apagarMedida, apagarPesagem, lerDias, lerMedidas, lerMesesComFoto, lerPerfil, lerPesagens, lerSessoes, mudarDia, mudarSessao,
  salvarFoto, salvarMedida, salvarPerfil, salvarPesagem, type Perfil,
} from './banco'

export interface Dados {
  perfil: Perfil
  dias: Map<string, RegistroDia>
  /** Treinos registrados, por data. */
  sessoes: Map<string, Sessao>
  pesagens: Map<string, Pesagem>
  medidas: Map<string, Medida>
  /** Meses do projeto que têm foto. As imagens são lidas só na tela de Evolução. */
  mesesComFoto: number[]
}

type Estado = { fase: 'carregando' } | { fase: 'erro' } | { fase: 'pronto'; dados: Dados }

/** Tudo que o app lê do aparelho. Atualiza sozinho quando qualquer gravação acontece. */
export function useDados() {
  const [tentativa, setTentativa] = useState(0)
  const lido = useLiveQuery<Estado, Estado>(
    async () => {
      try {
        const [perfil, dias, sessoes, pesagens, medidas, mesesComFoto] = await Promise.all([lerPerfil(), lerDias(), lerSessoes(), lerPesagens(), lerMedidas(), lerMesesComFoto()])
        return { fase: 'pronto', dados: { perfil, dias, sessoes, pesagens, medidas, mesesComFoto } }
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
  // O mesmo vale para a sessão de treino: a série registrada aparece no toque, sem esperar o banco.
  const [sessaoPendente, setSessaoPendente] = useState<Sessao | null>(null)
  const ultimaSessao = useRef<Sessao | null>(null)
  const sessoesLidas = useRef<Map<string, Sessao>>(new Map())
  const gravando = useRef(0)

  useEffect(() => {
    if (lido.fase === 'pronto') sessoesLidas.current = lido.dados.sessoes
    // chegou leitura nova do banco e não há gravação em curso: o banco volta a mandar
    if (gravando.current === 0) {
      setPerfilPendente(null)
      setSessaoPendente(null)
      ultimaSessao.current = null
    }
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

  const gravarSessao = useCallback((data: string, nova: Sessao, mudanca: (s: Sessao) => Sessao) => {
    setErroAoSalvar(false)
    const base = (ultimaSessao.current?.data === data ? ultimaSessao.current : null) ?? sessoesLidas.current.get(data) ?? nova
    const prevista = mudanca(base)
    ultimaSessao.current = prevista
    setSessaoPendente(prevista)
    gravando.current++
    return mudarSessao(data, nova, mudanca)
      .catch(() => {
        ultimaSessao.current = null
        setSessaoPendente(null)
        setErroAoSalvar(true)
      })
      .finally(() => {
        gravando.current--
      })
  }, [])

  const estado = useMemo<Estado>(() => {
    if (lido.fase !== 'pronto' || (!perfilPendente && !sessaoPendente)) return lido
    const sessoes = sessaoPendente ? new Map(lido.dados.sessoes).set(sessaoPendente.data, sessaoPendente) : lido.dados.sessoes
    return { fase: 'pronto', dados: { ...lido.dados, perfil: perfilPendente ?? lido.dados.perfil, sessoes } }
  }, [lido, perfilPendente, sessaoPendente])

  /** Gravações da evolução: formulário enviado de uma vez, sem retorno otimista. Devolve se deu certo. */
  const gravarEvolucao = useCallback(async (acao: () => Promise<unknown>): Promise<boolean> => {
    setErroAoSalvar(false)
    try {
      await acao()
      return true
    } catch {
      setErroAoSalvar(true)
      return false
    }
  }, [])

  const evolucao = useMemo(() => ({
    salvarPesagem: (p: Pesagem) => gravarEvolucao(() => salvarPesagem(p)),
    apagarPesagem: (data: string) => gravarEvolucao(() => apagarPesagem(data)),
    salvarMedida: (m: Medida) => gravarEvolucao(() => salvarMedida(m)),
    apagarMedida: (data: string) => gravarEvolucao(() => apagarMedida(data)),
    salvarFoto: (...a: Parameters<typeof salvarFoto>) => gravarEvolucao(() => salvarFoto(...a)),
    apagarFoto: (mes: number) => gravarEvolucao(() => apagarFoto(mes)),
  }), [gravarEvolucao])

  return {
    evolucao,
    estado,
    erroAoSalvar,
    tentarDeNovo: useCallback(() => setTentativa((t) => t + 1), []),
    salvarPerfil: gravarPerfil,
    mudarDia: gravarDia,
    mudarSessao: gravarSessao,
  }
}
