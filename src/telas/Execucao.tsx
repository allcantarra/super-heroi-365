import { Check, ChevronLeft, ChevronRight, Minus, Plus, SkipForward, Square, Sun, Timer, Trophy, Undo2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EXERCICIOS, type IdExercicio, type Unidade } from '../conteudo/treinos'
import { dataCurta } from '../dominio/tempo'
import {
  AJUSTE_DESCANSO, VALOR_MAXIMO, ajustarFim, proximoItem, recordes, registrarSerie, relogio, segundosDecorridos, segundosRestantes, seriesDe, sugestao, textoAlvo, textoValor, ultimaVez,
  type Sessao, type TreinoDoDia,
} from '../dominio/treino'
import { agendarAviso, tocarAcerto } from '../ui/som'
import { useTelaAcesa } from '../ui/useTelaAcesa'
import { instante, useTique } from '../ui/useTique'

interface Props {
  treino: TreinoDoDia
  sessao: Sessao
  /** Todas as sessões, para mostrar a última vez e os recordes. */
  sessoes: Map<string, Sessao>
  som: boolean
  erroAoSalvar: boolean
  registrar: (exercicio: IdExercicio, valor: number) => void
  desfazer: (exercicio: IdExercicio) => void
  concluir: () => void
  sair: () => void
}

const PASSO: Record<Unidade, number> = { reps: 1, seg: 5, min: 1 }
const PERGUNTA: Record<Unidade, string> = { reps: 'Repetições feitas', seg: 'Segundos aguentados', min: 'Minutos feitos' }
const AVISO_VISIVEL = 6000
/** Tempo para se posicionar antes de o cronômetro de um exercício parado começar a contar. */
const PREPARO = 5
/** Logo depois de registrar, "Pular descanso" fica travado: o botão nasce onde o dedo acabou de tocar. */
const TRAVA_DO_PULAR = 700

// O cronômetro de exercício fica guardado: uma corrida de 20 minutos com a tela bloqueada não pode se perder se o iPhone descarregar o app.
const CHAVE_CRONO = 'cronometro-treino'
interface Crono { data: string; exercicio: IdExercicio; inicio: number }

const CRONO_MAXIMO = 3 * 3_600_000

/** Só aproveita cronômetro de hoje, de exercício da ficha ainda com série por fazer e iniciado há menos de 3 horas. O resto é sobra: apaga. */
function lerCrono(treino: TreinoDoDia, sessao: Sessao): Crono | null {
  try {
    const c = JSON.parse(localStorage.getItem(CHAVE_CRONO) ?? 'null') as Partial<Crono> | null
    if (!c) return null
    const item = treino.itens.find((x) => x.exercicio === c.exercicio)
    const vale = c.data === sessao.data && typeof c.inicio === 'number' && instante() - c.inicio < CRONO_MAXIMO && !!item && seriesDe(sessao, item.exercicio).length < item.series
    if (!vale) guardarCrono(null)
    return vale ? (c as Crono) : null
  } catch {
    return null
  }
}

function guardarCrono(c: Crono | null): void {
  try {
    if (c) localStorage.setItem(CHAVE_CRONO, JSON.stringify(c))
    else localStorage.removeItem(CHAVE_CRONO)
  } catch {
    // sem armazenamento, o cronômetro vale só enquanto o app estiver aberto
  }
}

/** Treino em andamento: um exercício por vez, registro de cada série e descanso que começa sozinho. */
export function Execucao({ treino, sessao, sessoes, som, erroAoSalvar, registrar, desfazer, concluir, sair }: Props) {
  const agora = useTique()
  const acesa = useTelaAcesa(true)
  const [crono, setCrono] = useState<Crono | null>(() => lerCrono(treino, sessao))
  const [indice, setIndice] = useState(() => {
    const doCrono = crono ? treino.itens.findIndex((x) => x.exercicio === crono.exercicio) : -1
    return doCrono >= 0 ? doCrono : (proximoItem(treino.itens, sessao) ?? 0)
  })
  const [ajuste, setAjuste] = useState<{ chave: string; valor: number } | null>(null)
  const [descanso, setDescanso] = useState<{ desde: number; fim: number; total: number; aSeguir: string } | null>(null)
  const [aviso, setAviso] = useState<{ texto: string; ate: number } | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const cancelarSom = useRef<() => void>(() => {})
  const titulo = useRef<HTMLHeadingElement>(null)

  const item = treino.itens[indice]
  const exercicio = EXERCICIOS[item.exercicio]
  const feitas = seriesDe(sessao, item.exercicio)
  const cumprido = feitas.length >= item.series
  const anterior = useMemo(() => ultimaVez(sessoes, item.exercicio, sessao.data, treino.id), [sessoes, item.exercicio, sessao.data, treino.id])
  const recorde = useMemo(() => recordes(sessoes, sessao.data), [sessoes, sessao.data]).get(item.exercicio)
  const chave = `${item.exercicio}:${feitas.length}`
  const valor = ajuste?.chave === chave ? ajuste.valor : sugestao(item, feitas.length + 1, anterior)
  const passo = PASSO[exercicio.unidade]
  const totalDeSeries = treino.itens.reduce((s, x) => s + x.series, 0)
  const faltam = treino.itens.reduce((s, x) => s + Math.max(0, x.series - seriesDe(sessao, x.exercicio).length), 0)

  // o relógio da tela pode estar um quarto de segundo atrasado em relação ao toque: nunca mostra mais que o total
  const restante = descanso ? Math.min(descanso.total, segundosRestantes(descanso.fim, agora)) : 0
  const emDescanso = !!descanso && restante > 0
  const descansoAcabou = !!descanso && !emDescanso && agora < descanso.fim + AVISO_VISIVEL
  const cronoAqui = crono && crono.exercicio === item.exercicio ? crono : null

  const pararSom = () => {
    cancelarSom.current()
    cancelarSom.current = () => {}
  }
  const agendarSom = (segundos: number) => {
    pararSom()
    if (som) cancelarSom.current = agendarAviso(segundos)
  }

  // ao sair da tela, nenhum bipe fica agendado; ao entrar, o leitor de tela começa pelo nome do exercício
  useEffect(() => {
    titulo.current?.focus()
    return () => cancelarSom.current()
  }, [])

  // Em segundo plano o iPhone congela o áudio: ao voltar, o bipe é agendado de novo para o tempo que realmente falta.
  const fimDoDescanso = descanso?.fim
  useEffect(() => {
    if (!fimDoDescanso || !som) return
    const aoVoltar = () => {
      if (document.visibilityState !== 'visible') return
      cancelarSom.current()
      const falta = (fimDoDescanso - instante()) / 1000
      cancelarSom.current = falta > 0 ? agendarAviso(falta) : () => {}
    }
    document.addEventListener('visibilitychange', aoVoltar)
    return () => document.removeEventListener('visibilitychange', aoVoltar)
  }, [fimDoDescanso, som])

  const irPara = (n: number) => {
    setIndice(n)
    setConfirmando(false)
    titulo.current?.focus()
  }

  const iniciarDescanso = (segundos: number, aSeguir: string) => {
    const neste = instante()
    setDescanso({ desde: neste, fim: neste + segundos * 1000, total: segundos, aSeguir })
    agendarSom(segundos)
  }

  const ajustarDescanso = (delta: number) => {
    if (!descanso) return
    const neste = instante()
    const fim = ajustarFim(descanso.fim, delta, neste)
    setDescanso({ ...descanso, fim, total: Math.max(descanso.total, Math.ceil((fim - neste) / 1000)) })
    agendarSom((fim - neste) / 1000)
  }

  const pularDescanso = () => {
    pararSom()
    setDescanso(null)
  }

  const aoConcluir = () => {
    pararSom()
    guardarCrono(null)
    concluir()
  }

  const aoDesfazer = () => {
    // a série desfeita leva junto o descanso que ela tinha iniciado
    pularDescanso()
    desfazer(item.exercicio)
    setAjuste(null)
  }

  const aoRegistrar = () => {
    if (cumprido) return
    const depois = registrarSerie(sessao, item.exercicio, valor)
    registrar(item.exercicio, valor)
    setAjuste(null)
    setConfirmando(false)
    if (som) tocarAcerto()
    const bateu = recorde && valor > recorde.valor && valor > Math.max(0, ...feitas)
    setAviso(bateu ? { texto: `Recorde! ${textoValor(item.exercicio, valor)}. O anterior era ${textoValor(item.exercicio, recorde.valor)}.`, ate: instante() + AVISO_VISIVEL * 2 } : null)
    const proximo = proximoItem(treino.itens, depois)
    if (proximo === null) {
      aoConcluir()
      return
    }
    const fechou = feitas.length + 1 >= item.series
    if (fechou) irPara(proximo)
    iniciarDescanso(item.descanso, fechou ? EXERCICIOS[treino.itens[proximo].exercicio].nome : `série ${feitas.length + 2} de ${item.series}`)
  }

  const iniciarCrono = () => {
    // exercício parado (prancha): 5 segundos para se posicionar; a corrida começa a contar na hora
    const preparo = exercicio.unidade === 'seg' ? PREPARO : 0
    const novo = { data: sessao.data, exercicio: item.exercicio, inicio: instante() + preparo * 1000 }
    setCrono(novo)
    guardarCrono(novo)
    pararSom()
    if (!som) return
    if (preparo) {
      // bipes na largada e de novo ao chegar ao topo do alvo, para não precisar olhar a tela
      const largada = agendarAviso(preparo), topo = agendarAviso(preparo + item.alvo[1])
      cancelarSom.current = () => {
        largada()
        topo()
      }
    } else tocarAcerto()
  }

  const pararCrono = () => {
    if (!cronoAqui) return
    const neste = instante()
    const segundos = segundosDecorridos(cronoAqui.inicio, neste)
    setCrono(null)
    guardarCrono(null)
    pararSom()
    if (neste < cronoAqui.inicio) return
    const medido = exercicio.unidade === 'min' ? Math.round(segundos / 60) : segundos
    setAjuste({ chave, valor: Math.max(1, Math.min(VALOR_MAXIMO, medido)) })
  }

  const mudarValor = (delta: number) => setAjuste({ chave, valor: Math.max(1, Math.min(VALOR_MAXIMO, valor + delta)) })

  const pendente = proximoItem(treino.itens, sessao)

  return (
    <div className="execucao" role="dialog" aria-modal="true" aria-label="Treino em andamento">
      <header className="exec-topo">
        <button className="exec-sair" onClick={sair} aria-label="Sair do treino sem concluir"><X aria-hidden /></button>
        <div className="exec-onde">
          <b>Exercício {indice + 1} de {treino.itens.length}</b>
          <span>{totalDeSeries - faltam} de {totalDeSeries} séries, {Math.floor(segundosDecorridos(sessao.inicio, agora) / 60)} min</span>
        </div>
        {acesa === 'acesa' && <span className="exec-acesa" title="A tela fica acesa durante o treino"><Sun aria-hidden /><span className="so-leitor">Tela acesa</span></span>}
      </header>
      <div className="exec-pontos" aria-hidden>
        {treino.itens.map((x, n) => (
          <i key={x.exercicio} className={`${seriesDe(sessao, x.exercicio).length >= x.series ? 'cheio' : ''} ${n === indice ? 'atual' : ''}`} />
        ))}
      </div>

      <div className="exec-corpo">
        <h1 ref={titulo} tabIndex={-1}>{exercicio.nome}</h1>
        <p className="exec-alvo">{item.series} {item.series === 1 ? 'série' : 'séries'} de {textoAlvo(item)}</p>
        <p className="exec-como">{exercicio.execucao}</p>

        <ol className="exec-series" aria-label="Séries deste exercício">
          {Array.from({ length: item.series }, (_, n) => {
            const feita = n < feitas.length
            const antes = anterior?.valores[n]
            return (
              <li key={n} className={feita ? 'feita' : n === feitas.length ? 'atual' : undefined}>
                <span className="marca">{feita ? <Check aria-hidden /> : n + 1}</span>
                <span className="rotulo">Série {n + 1}</span>
                <span className="antes">{antes ? `da última vez ${textoValor(item.exercicio, antes)}` : ''}</span>
                <b>{feita ? textoValor(item.exercicio, feitas[n]) : n === feitas.length ? 'agora' : ''}</b>
              </li>
            )
          })}
        </ol>

        {feitas.length > 0 && <button className="exec-desfazer" onClick={aoDesfazer}><Undo2 aria-hidden />Desfazer a última série</button>}

        <p className="exec-ref">
          {recorde
            ? <><Trophy aria-hidden />Recorde: {textoValor(item.exercicio, recorde.valor)} em {dataCurta(recorde.data)}</>
            : anterior ? null : 'Primeira vez neste exercício. Hoje você marca o número a superar.'}
        </p>
        {acesa === 'negada' && <p className="exec-ref">Este aparelho não manteve a tela acesa. Toque nela de vez em quando ou aumente o bloqueio automático.</p>}
        {erroAoSalvar && <p className="aviso" role="alert">Não deu para salvar a série neste aparelho. Registre de novo; se continuar, feche e abra o app.</p>}

        <div className="exec-nav">
          <button disabled={indice === 0} onClick={() => irPara(indice - 1)}><ChevronLeft aria-hidden />Anterior</button>
          <button disabled={indice === treino.itens.length - 1} onClick={() => irPara(indice + 1)}>{cumprido ? 'Próximo' : 'Pular'}<ChevronRight aria-hidden /></button>
        </div>

        {sessao.series.length > 0 && (confirmando ? (
          <div className="exec-confirma" role="group" aria-label="Concluir o treino antes do fim" ref={(painel) => painel?.scrollIntoView({ block: 'nearest' })}>
            <p>{faltam === 1 ? 'Falta 1 série' : `Faltam ${faltam} séries`} da ficha. O treino conta como feito com o que você registrou.</p>
            <button className="botao" onClick={aoConcluir}>Concluir agora</button>
            <button className="botao fantasma" onClick={() => setConfirmando(false)}>Continuar treinando</button>
          </div>
        ) : (
          <button className="exec-concluir" onClick={() => setConfirmando(true)}>Concluir treino antes do fim</button>
        ))}
      </div>

      <footer className={`exec-doca ${emDescanso ? 'descanso' : ''}`}>
        <div className="so-leitor" role="status">
          {emDescanso ? `Descanso de ${descanso.total} segundos` : descansoAcabou ? 'Descanso acabou.' : ''}
        </div>
        {aviso && agora < aviso.ate && <p className="exec-recorde" role="status"><Trophy aria-hidden />{aviso.texto}</p>}

        {emDescanso ? (
          <>
            <div className="exec-rotulo"><span>Descanso</span><span>A seguir: {descanso.aSeguir}</span></div>
            <div className="exec-relogio" role="timer" aria-label={`Faltam ${restante} segundos de descanso`}>{relogio(restante)}</div>
            <div className="exec-trilho" aria-hidden><i style={{ width: `${Math.min(100, (restante / descanso.total) * 100)}%` }} /></div>
            <div className="exec-ajustes">
              <button onClick={() => ajustarDescanso(-AJUSTE_DESCANSO)} aria-label={`Tirar ${AJUSTE_DESCANSO} segundos do descanso`}>−{AJUSTE_DESCANSO} s</button>
              <button className="pular" onClick={pularDescanso} disabled={agora - descanso.desde < TRAVA_DO_PULAR}><SkipForward aria-hidden />Pular descanso</button>
              <button onClick={() => ajustarDescanso(AJUSTE_DESCANSO)} aria-label={`Somar ${AJUSTE_DESCANSO} segundos ao descanso`}>+{AJUSTE_DESCANSO} s</button>
            </div>
          </>
        ) : cronoAqui ? (
          <>
            <div className="exec-rotulo"><span>{agora < cronoAqui.inicio ? 'Prepare-se' : 'Cronômetro'}</span><span>Alvo: {textoAlvo(item)}</span></div>
            {agora < cronoAqui.inicio
              ? <div className="exec-relogio preparo" role="timer" aria-label="Segundos para começar">{segundosRestantes(cronoAqui.inicio, agora)}</div>
              : <div className="exec-relogio" role="timer" aria-label="Tempo decorrido">{relogio(segundosDecorridos(cronoAqui.inicio, agora))}</div>}
            <button className="botao largo" onClick={pararCrono}><Square aria-hidden />{agora < cronoAqui.inicio ? 'Cancelar' : 'Parar e anotar'}</button>
          </>
        ) : cumprido ? (
          <>
            <div className="exec-rotulo"><span>Exercício cumprido</span><span>{feitas.map((v) => textoValor(item.exercicio, v)).join(', ')}</span></div>
            {pendente === null
              ? <button className="botao largo" onClick={aoConcluir}><Check aria-hidden />Concluir treino</button>
              : <button className="botao largo" onClick={() => irPara(pendente)}>Ir para {EXERCICIOS[treino.itens[pendente].exercicio].nome}<ChevronRight aria-hidden /></button>}
          </>
        ) : (
          <>
            <div className="exec-rotulo">
              <span>Série {feitas.length + 1} de {item.series}{descansoAcabou ? ': vai!' : ''}</span>
              <span>Alvo: {textoAlvo(item)}</span>
            </div>
            <div className="exec-passo" role="group" aria-label={PERGUNTA[exercicio.unidade]}>
              <button onClick={() => mudarValor(-passo)} disabled={valor <= 1} aria-label={`Menos ${passo}`}><Minus aria-hidden /></button>
              <output aria-live="polite"><b>{valor}</b><small>{PERGUNTA[exercicio.unidade].toLowerCase()}{exercicio.porLado ? ', cada lado' : ''}</small></output>
              <button onClick={() => mudarValor(passo)} disabled={valor >= VALOR_MAXIMO} aria-label={`Mais ${passo}`}><Plus aria-hidden /></button>
            </div>
            <div className="exec-acoes">
              {exercicio.unidade !== 'reps' && <button className="botao fantasma" onClick={iniciarCrono}><Timer aria-hidden />{exercicio.unidade === 'seg' ? `Cronometrar (começa em ${PREPARO} s)` : 'Cronometrar'}</button>}
              <button className="botao largo" onClick={aoRegistrar}><Check aria-hidden />Registrar série</button>
            </div>
          </>
        )}
      </footer>
    </div>
  )
}
