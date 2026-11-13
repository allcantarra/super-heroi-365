import { BedDouble, Check, Play, RotateCcw, Trophy } from 'lucide-react'
import { useState } from 'react'
import { AQUECIMENTO, EXERCICIOS, type IdExercicio } from '../conteudo/treinos'
import type { Dados } from '../dados/useDados'
import { jornada } from '../dominio/dia'
import { progressoDe } from '../dominio/jogo'
import { dataCurta, numeroDoDia, segundaDaSemana, somarDias } from '../dominio/tempo'
import {
  concluir, desfazerSerie, diasComTreino, duracaoEstimada, reabrir, recordes, recordesBatidos, registrarSerie, resumoDaSessao, seriesDe, sessaoNova, siglaDe, textoCurto, textoValor, treinoDaData, treinoFeito, ultimaVez,
  type Sessao, type TreinoDoDia,
} from '../dominio/treino'
import { Pow, type Golpe } from '../ui/Pow'
import { instante } from '../ui/useTique'
import { Execucao } from './Execucao'

interface Props {
  dados: Dados
  hoje: string
  erroAoSalvar: boolean
  mudarSessao: (data: string, nova: Sessao, mudanca: (s: Sessao) => Sessao) => void
  irParaHoje: () => void
}

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function Treino({ dados, hoje, erroAoSalvar, mudarSessao, irParaHoje }: Props) {
  const { perfil, dias, sessoes } = dados
  const diaUm = perfil.diaUm!
  const treino = treinoDaData(diaUm, hoje)
  const sessao = sessoes.get(hoje)
  const [executando, setExecutando] = useState(false)
  const [golpe, setGolpe] = useState<Golpe | null>(null)

  const gravar = (mudanca: (s: Sessao) => Sessao) => {
    // a sessão sempre carrega a ficha de hoje, mesmo que a data do dia 1 tenha sido ajustada depois de começar
    if (treino) mudarSessao(hoje, sessaoNova(hoje, treino.id, instante()), (s) => ({ ...mudanca(s), treino: treino.id }))
  }

  const comecar = () => {
    // sem série ainda, o relógio do treino começa agora: abrir a ficha de manhã e treinar à noite não infla a duração
    gravar((s) => (s.series.length === 0 ? { ...s, inicio: instante(), fim: null } : reabrir(s)))
    setExecutando(true)
    window.scrollTo(0, 0)
  }

  /** Calcula o que o treino rende antes de gravar, para comemorar na hora. */
  const aoConcluir = () => {
    if (!treino) return
    const antes = jornada(diaUm, hoje, perfil.rotina, diasComTreino(dias, new Map(sessoes).set(hoje, reabrir(sessao ?? sessaoNova(hoje, treino.id, 1))), hoje))
    const feita: Sessao = { data: hoje, treino: treino.id, inicio: 1, fim: 2, series: [{ exercicio: treino.itens[0].exercicio, valor: 1 }] }
    const depois = jornada(diaUm, hoje, perfil.rotina, diasComTreino(dias, new Map(sessoes).set(hoje, feita), hoje))
    const ganho = depois.xpTotal - antes.xpTotal
    const nivel = progressoDe(depois.xpTotal).nivel
    if (ganho > 0) setGolpe({ id: instante(), palavra: nivel > progressoDe(antes.xpTotal).nivel ? `NÍVEL ${nivel}!` : 'BOOM!', linha: `+${ganho} XP` })
    gravar((s) => concluir(s, instante()))
    setExecutando(false)
    window.scrollTo(0, 0)
  }

  if (executando && treino && sessao && sessao.fim === null) {
    return (
      <Execucao
        treino={treino}
        sessao={sessao}
        sessoes={sessoes}
        som={perfil.som}
        erroAoSalvar={erroAoSalvar}
        registrar={(exercicio, valor) => gravar((s) => registrarSerie(s, exercicio, valor))}
        desfazer={(exercicio) => gravar((s) => desfazerSerie(s, exercicio))}
        concluir={aoConcluir}
        sair={() => setExecutando(false)}
      />
    )
  }

  const numero = numeroDoDia(diaUm, hoje)
  const referencia = treino ?? treinoDaData(diaUm, somarDias(hoje, 1))
  const feitos = diasComTreino(dias, sessoes, hoje)
  const segunda = segundaDaSemana(hoje)
  const melhores = [...recordes(sessoes)].sort(([a], [b]) => EXERCICIOS[a].nome.localeCompare(EXERCICIOS[b].nome, 'pt-BR'))

  return (
    <>
      <header className="treino-topo">
        <h1>Treino</h1>
        {referencia && <p>{referencia.nomeFicha}, semana {referencia.semana} de {referencia.semanasDaFicha}</p>}
      </header>

      {erroAoSalvar && <p className="aviso" role="alert" style={{ marginBottom: 24 }}>Não deu para salvar neste aparelho. Tente de novo; se continuar, feche e abra o app.</p>}

      {!treino ? (
        <section className="painel escuro" aria-label="Treino de hoje">
          <span className="aba">{numero < 1 ? 'ANTES DO DIA 1' : 'DOMINGO'}</span>
          <h2 className="grande">{numero < 1 ? 'A JORNADA AINDA NÃO COMEÇOU' : 'DESCANSO'}</h2>
          <p><BedDouble aria-hidden className="icone-linha" />{numero < 1 ? `Seu primeiro treino é em ${dataCurta(diaUm)}.` : 'Hoje o corpo constrói o que você treinou na semana. Durma bem e coma tudo.'}</p>
          {referencia && numero >= 1 && <p className="treino-meta">Amanhã: {referencia.nome}, {referencia.foco.toLowerCase()}.</p>}
        </section>
      ) : treinoFeito(sessao) ? (
        <Concluido treino={treino} sessao={sessao!} sessoes={sessoes} irParaHoje={irParaHoje} reabrir={comecar} />
      ) : (
        <section className="painel" aria-label="Treino de hoje">
          <span className="aba">TREINO DE HOJE</span>
          <h2 className="grande">{treino.nome.toUpperCase()}</h2>
          <p>{treino.foco}</p>
          <p className="treino-meta">{treino.itens.length} exercícios, cerca de {duracaoEstimada(treino.itens)} minutos</p>
          <ul className="treino-lista">
            {treino.itens.map((item) => {
              const feitas = seriesDe(sessao, item.exercicio).length
              return (
                <li key={item.exercicio} className={feitas >= item.series ? 'feito' : undefined}>
                  <span>{EXERCICIOS[item.exercicio].nome}</span>
                  <b>{textoCurto(item)}</b>
                </li>
              )
            })}
          </ul>
          <p className="treino-nota">{treino.nota}</p>
          <p className="treino-nota">{AQUECIMENTO}</p>
          {sessao && sessao.series.length > 0 && <p className="recompensa">{sessao.series.length} {sessao.series.length === 1 ? 'série registrada' : 'séries registradas'} até agora.</p>}
          <button className="botao largo" onClick={comecar}><Play aria-hidden />{sessao && sessao.series.length > 0 ? 'CONTINUAR TREINO' : 'COMEÇAR TREINO'}</button>
        </section>
      )}

      <h2 className="secao">SEMANA</h2>
      <ol className="treino-semana">
        {DIAS.map((dia, n) => {
          const data = somarDias(segunda, n)
          const doDia = treinoDaData(diaUm, data)
          const feito = feitos.get(data)?.feitas.includes('treino') ?? false
          return (
            <li key={dia} className={data === hoje ? 'hoje' : undefined} aria-current={data === hoje ? 'date' : undefined}>
              <span className="dia">{dia}</span>
              <span className="qual">
                {doDia ? <>{doDia.nome}<small>{doDia.foco}</small></> : <>Antes do dia 1<small>A jornada começa em {dataCurta(diaUm)}</small></>}
              </span>
              <span className={`estado ${feito ? 'feito' : ''}`}>{feito ? <><Check aria-hidden /><span className="so-leitor">Feito</span></> : data === hoje ? 'hoje' : ''}</span>
            </li>
          )
        })}
        <li className="folga"><span className="dia">Dom</span><span className="qual">Descanso</span><span className="estado" /></li>
      </ol>

      <h2 className="secao">RECORDES</h2>
      {melhores.length === 0 ? (
        <p className="treino-vazio">Nenhum recorde ainda. A melhor série de cada exercício aparece aqui depois do primeiro treino.</p>
      ) : (
        <ul className="treino-recordes">
          {melhores.map(([id, r]) => (
            <li key={id}><Trophy aria-hidden /><span>{EXERCICIOS[id].nome}</span><b>{textoValor(id, r.valor)}</b><small>{dataCurta(r.data)}</small></li>
          ))}
        </ul>
      )}

      <Pow golpe={golpe} aoTerminar={() => setGolpe(null)} />
    </>
  )
}

function Concluido({ treino, sessao, sessoes, irParaHoje, reabrir }: { treino: TreinoDoDia; sessao: Sessao; sessoes: Map<string, Sessao>; irParaHoje: () => void; reabrir: () => void }) {
  const resumo = resumoDaSessao(sessao, treino.itens)
  const batidos = new Set(recordesBatidos(sessoes, sessao))
  const feitos = [...new Set(sessao.series.map((s) => s.exercicio))] as IdExercicio[]
  return (
    <section className="painel azul" aria-label="Treino de hoje">
      <span className="aba">MISSÃO CUMPRIDA</span>
      <h2 className="grande">TREINO CONCLUÍDO</h2>
      <p>{treino.nome}: {treino.foco.toLowerCase()}.</p>
      <dl className="treino-numeros">
        <div><dt>minutos</dt><dd>{resumo.minutos}</dd></div>
        <div><dt>séries</dt><dd>{resumo.series}<small> de {resumo.seriesPrevistas}</small></dd></div>
        <div><dt>repetições</dt><dd>{resumo.repeticoes}</dd></div>
      </dl>
      {batidos.size > 0 && <p className="recompensa"><Trophy aria-hidden className="icone-linha" />{batidos.size === 1 ? '1 recorde batido' : `${batidos.size} recordes batidos`} hoje.</p>}
      <ul className="treino-feito">
        {feitos.map((id) => {
          const antes = ultimaVez(sessoes, id, sessao.data, treino.id)
          return (
            <li key={id}>
              <span>{EXERCICIOS[id].nome}{batidos.has(id) && <Trophy aria-label="Recorde" />}</span>
              <b>{seriesDe(sessao, id).join(', ')} {siglaDe(id)}</b>
              <small>{antes ? `da última vez: ${antes.valores.join(', ')}` : 'primeira vez'}</small>
            </li>
          )
        })}
      </ul>
      <button className="botao largo" onClick={irParaHoje}>VER MEU DIA</button>
      <button className="botao fantasma" style={{ marginTop: 12 }} onClick={reabrir}><RotateCcw aria-hidden />Reabrir treino</button>
    </section>
  )
}
