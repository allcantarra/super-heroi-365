import { Check, ChevronRight, Play, SkipForward, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EXERCICIOS, type PassoDoRoteiro } from '../conteudo/treinos'
import { duracaoDoRoteiro, etapasDoRoteiro, momentoDoRoteiro, relogio, segundosDecorridos } from '../dominio/treino'
import { agendarAviso } from './som'
import { useTelaAcesa } from './useTelaAcesa'
import { instante, useTique } from './useTique'

interface Props {
  titulo: string
  /** Frase que explica para que serve, mostrada antes de começar. */
  chamada: string
  roteiro: readonly PassoDoRoteiro[]
  som: boolean
  /** Texto do botão que sai sem fazer, por exemplo "Pular aquecimento". */
  pular: string
  aoTerminar: () => void
}

const TEXTO_LADO = { 1: 'primeiro lado', 2: 'outro lado' } as const

/** Aquecimento ou alongamento guiado: um movimento por vez, com o tempo de cada um contado pela diferença entre instantes. */
export function Roteiro({ titulo, chamada, roteiro, som, pular, aoTerminar }: Props) {
  const agora = useTique()
  useTelaAcesa(true)
  const etapas = useMemo(() => etapasDoRoteiro(roteiro), [roteiro])
  const [inicio, setInicio] = useState<number | null>(null)
  const cancelar = useRef<Array<() => void>>([])
  const titulo1 = useRef<HTMLHeadingElement>(null)

  const pararSons = () => {
    for (const c of cancelar.current) c()
    cancelar.current = []
  }
  useEffect(() => pararSons, [])

  const comecar = () => {
    const agoraMesmo = instante()
    setInicio(agoraMesmo)
    if (som) {
      // os avisos ficam agendados no relógio do áudio, dentro deste toque: tocam mesmo com a página em segundo plano
      let fim = 0
      cancelar.current = etapas.map((e) => agendarAviso((fim += e.segundos)))
    }
    titulo1.current?.focus()
  }

  const sair = () => {
    pararSons()
    aoTerminar()
  }

  const momento = inicio === null ? null : momentoDoRoteiro(etapas, segundosDecorridos(inicio, agora))
  const acabou = inicio !== null && momento === null
  const etapa = momento ? etapas[momento.indice] : null
  const seguinte = momento ? etapas[momento.indice + 1] : undefined

  return (
    <div className="execucao roteiro" role="dialog" aria-modal="true" aria-label={titulo}>
      <header className="exec-topo">
        <button className="exec-sair" onClick={sair} aria-label={`Fechar ${titulo.toLowerCase()}`}><X aria-hidden /></button>
        <div className="exec-onde">
          <b>{titulo}</b>
          <span>{momento ? `Movimento ${momento.indice + 1} de ${etapas.length}` : `${etapas.length} movimentos, ${Math.round(duracaoDoRoteiro(roteiro) / 60)} minutos`}</span>
        </div>
      </header>
      <div className="exec-pontos" aria-hidden>
        {etapas.map((_, n) => <i key={n} className={`${momento ? (n < momento.indice ? 'cheio' : n === momento.indice ? 'atual' : '') : acabou ? 'cheio' : ''}`} />)}
      </div>

      <div className="exec-corpo">
        {etapa ? (
          <>
            <h1 ref={titulo1} tabIndex={-1}>{EXERCICIOS[etapa.exercicio].nome}</h1>
            {etapa.lado && <p className="exec-alvo">{TEXTO_LADO[etapa.lado]}</p>}
            <p className="exec-como">{EXERCICIOS[etapa.exercicio].execucao}</p>
            {seguinte && <p className="exec-ref">A seguir: {EXERCICIOS[seguinte.exercicio].nome}{seguinte.lado ? `, ${TEXTO_LADO[seguinte.lado]}` : ''}</p>}
          </>
        ) : (
          <>
            <h1 ref={titulo1} tabIndex={-1}>{acabou ? 'Pronto' : titulo}</h1>
            <p className="exec-alvo">{acabou ? 'Corpo preparado.' : chamada}</p>
            <ol className="roteiro-lista">
              {roteiro.map(({ exercicio, segundos }) => (
                <li key={exercicio} className={acabou ? 'feito' : undefined}>
                  <span>{EXERCICIOS[exercicio].nome}</span>
                  <b>{segundos} s{EXERCICIOS[exercicio].porLado ? ' cada lado' : ''}</b>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>

      <footer className="exec-doca">
        <div className="so-leitor" role="status">{etapa ? `${EXERCICIOS[etapa.exercicio].nome}${etapa.lado ? `, ${TEXTO_LADO[etapa.lado]}` : ''}` : acabou ? `${titulo} concluído.` : ''}</div>
        {momento && etapa ? (
          <>
            <div className="exec-rotulo"><span>{titulo}</span><span>{etapa.segundos} s</span></div>
            <div className="exec-relogio" role="timer" aria-label={`Faltam ${momento.restante} segundos`}>{relogio(momento.restante)}</div>
            <div className="exec-trilho" aria-hidden><i style={{ width: `${Math.min(100, (momento.restante / etapa.segundos) * 100)}%` }} /></div>
            <button className="botao fantasma largo" onClick={sair}><SkipForward aria-hidden />{pular}</button>
          </>
        ) : acabou ? (
          <button className="botao largo" onClick={sair}><Check aria-hidden />Continuar<ChevronRight aria-hidden /></button>
        ) : (
          <div className="exec-acoes">
            <button className="botao fantasma" onClick={sair}>{pular}</button>
            <button className="botao largo" onClick={comecar}><Play aria-hidden />Começar</button>
          </div>
        )}
      </footer>
    </div>
  )
}
