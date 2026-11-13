import { Check, Coffee, Dumbbell, Flame, Minus, Plus, Settings, Shield } from 'lucide-react'
import { useRef, useState, type CSSProperties } from 'react'
import { alimento, textoQuantidade } from '../conteudo/alimentos'
import type { IdRefeicao } from '../conteudo/cardapio'
import type { Dados } from '../dados/useDados'
import { cardapioDaData, macrosDoPrato, prato } from '../dominio/cardapio'
import { META_COPOS, ML_POR_COPO, XP_COPO, alternarMissao, cafeinaLiberada, jornada, missaoDeAgora, mudarCopos, registroVazio, resumoDoDia, type RegistroDia } from '../dominio/dia'
import { xpDaEvolucao } from '../dominio/evolucao'
import { TITULOS, estagioDoNivel, progressoDe } from '../dominio/jogo'
import { missoesDoDia, type Missao } from '../dominio/rotina'
import { FASES, faseDoDia, horaLocal, numeroDoDia } from '../dominio/tempo'
import { duracaoEstimada, treinoDaData, treinoFeito } from '../dominio/treino'
import { Avatar } from '../heroi/Avatar'
import { Pow, type Golpe } from '../ui/Pow'
import { tocarAcerto } from '../ui/som'

interface Props {
  dados: Dados
  hoje: string
  agora: Date
  erroAoSalvar: boolean
  mudarDia: (data: string, mudanca: (r: RegistroDia) => RegistroDia) => void
  abrirAjustes: () => void
  abrirTreino: () => void
}

const PALAVRAS = ['POW!', 'BAM!', 'ZAP!']
const litros = (copos: number) => ((copos * ML_POR_COPO) / 1000).toFixed(2).replace('.', ',')

export function Hoje({ dados, hoje, agora, erroAoSalvar, mudarDia, abrirAjustes, abrirTreino }: Props) {
  const { perfil, dias, sessoes } = dados
  const diaUm = perfil.diaUm!
  const [golpe, setGolpe] = useState<Golpe | null>(null)
  const serie = useRef(0)

  const missoes = missoesDoDia(perfil.rotina, hoje)
  const registro = dias.get(hoje) ?? registroVazio(hoje)
  const resumo = resumoDoDia(registro, missoes)
  const trilha = jornada(diaUm, hoje, perfil.rotina, dias)
  /** XP de pesagem semanal e foto mensal: vem dos registros da Evolução, não das missões do dia. */
  const xpExtra = xpDaEvolucao(diaUm, hoje, dados.pesagens.keys(), dados.mesesComFoto)
  const progresso = progressoDe(trilha.xpTotal + xpExtra)
  const estagio = estagioDoNivel(progresso.nivel)
  const numero = numeroDoDia(diaUm, hoje)
  const fase = faseDoDia(numero)
  const proxima = missaoDeAgora(registro, missoes, horaLocal(agora))
  const treino = treinoDaData(diaUm, hoje)
  const sessao = sessoes.get(hoje)
  /** Marca de treino feita à mão, antes de existir a tela de treino: continua valendo e pode ser desfeita com um toque. */
  const treinoMarcadoAMao = registro.feitas.includes('treino') && !treinoFeito(sessao)
  const cafeina = cafeinaLiberada(agora)
  const cardapio = cardapioDaData(diaUm, hoje, perfil.trocas)
  /** O que comer na missão: prato do cardápio do dia; o treino não tem prato. */
  const pratoDa = (m: Missao) => (m.tipo === 'refeicao' ? prato(cardapio[m.id as IdRefeicao]) : null)
  const pratoAgora = proxima ? pratoDa(proxima) : null

  /** Calcula o que a mudança rende antes de gravar, para mostrar o retorno na hora do toque. */
  const aplicar = (mudanca: (r: RegistroDia) => RegistroDia, comemorar: boolean) => {
    if (comemorar) {
      const depois = new Map(dias).set(hoje, mudanca(registro))
      const novo = jornada(diaUm, hoje, perfil.rotina, depois)
      const ganho = novo.xpTotal - trilha.xpTotal
      const nivelNovo = progressoDe(novo.xpTotal + xpExtra).nivel
      const palavra = nivelNovo > progresso.nivel ? `NÍVEL ${nivelNovo}!` : PALAVRAS[novo.xpTotal % PALAVRAS.length]
      if (ganho > 0) setGolpe({ id: ++serie.current, palavra, linha: `+${ganho} XP` })
      if (perfil.som) tocarAcerto()
    }
    mudarDia(hoje, mudanca)
  }
  // O treino se cumpre registrando séries: o toque leva para a tela de treino em vez de marcar.
  const alternar = (m: Missao) => (m.tipo === 'treino' && !treinoMarcadoAMao ? abrirTreino() : aplicar((r) => alternarMissao(r, m.id), !registro.feitas.includes(m.id)))

  return (
    <>
      <section className="heroi" aria-label="Seu herói">
        <div className={`quadro e${estagio}`}>
          <Avatar estagio={estagio} aparencia={perfil.aparencia} pose={resumo.completo && estagio > 1 ? 'vitoria' : undefined} />
        </div>
        <div>
          <span className="etiqueta">DIA {numero} DE 365</span>
          <div className="nivel">NÍVEL {progresso.nivel}</div>
          <div className="titulo-heroi">{TITULOS[estagio]}</div>
          <div className="xp" role="progressbar" aria-label="Experiência" aria-valuemin={0} aria-valuemax={progresso.xpDoNivel} aria-valuenow={progresso.xpNoNivel}>
            <i style={{ width: `${progresso.xpDoNivel ? (progresso.xpNoNivel / progresso.xpDoNivel) * 100 : 100}%` }} />
          </div>
          <div className="xp-texto"><span>{progresso.xpNoNivel} XP</span><span>{progresso.xpDoNivel || 'máximo'}</span></div>
          <div className="selos">
            <span className="selo fogo" title="Dias vencidos seguidos"><Flame aria-hidden />{trilha.sequencia} {trilha.sequencia === 1 ? 'dia' : 'dias'}</span>
            <span className="selo escudo" title="Cada escudo cobre um dia perdido"><Shield aria-hidden />{trilha.escudos} {trilha.escudos === 1 ? 'escudo' : 'escudos'}</span>
          </div>
        </div>
      </section>

      {erroAoSalvar && <p className="aviso" role="alert" style={{ marginBottom: 24 }}>Não deu para salvar neste aparelho. Toque de novo; se continuar, feche e abra o app.</p>}

      {proxima ? (
        <section className="painel" aria-label="Missão de agora">
          <span className="aba">MISSÃO DE AGORA, {proxima.hora}</span>
          <h2 className="grande">{proxima.nome.toUpperCase()}</h2>
          {pratoAgora ? (
            <>
              <p>{pratoAgora.nome}</p>
              <ul className="itens" style={{ marginTop: 8 }}>
                {pratoAgora.itens.map((item) => {
                  const cortado = !cafeina && alimento(item.a).cafeina
                  return <li key={item.a} className={cortado ? 'cortado' : undefined}><span>{textoQuantidade(item.a, item.q[fase - 1])}</span>{alimento(item.a).nome}{cortado ? ' (cortado: passou das 15h)' : ''}</li>
                })}
              </ul>
            </>
          ) : treino ? (
            <p>{treino.nome}: {treino.foco.toLowerCase()}. {treino.itens.length} exercícios, cerca de {duracaoEstimada(treino.itens)} minutos.</p>
          ) : (
            <p>{proxima.detalhe}</p>
          )}
          <div className="recompensa">Recompensa: +{proxima.xp} XP{pratoAgora ? `, ${Math.round(macrosDoPrato(cardapio[proxima.id as IdRefeicao], fase).kcal)} kcal` : ''}</div>
          {proxima.tipo === 'treino'
            ? <button className="botao largo" onClick={abrirTreino}><Dumbbell aria-hidden />{sessao && sessao.series.length > 0 ? 'CONTINUAR TREINO' : 'COMEÇAR TREINO'}</button>
            : <button className="botao largo" onClick={() => alternar(proxima)}><Check aria-hidden />FEITO</button>}
        </section>
      ) : (
        <section className="painel" aria-label="Missão de agora">
          <span className="aba">FIM DO CAPÍTULO</span>
          <h2 className="grande">DIA COMPLETO</h2>
          <p>Todas as missões cumpridas. Agora o trabalho é dormir.</p>
        </section>
      )}

      <div className="barra-poder">
        <span>Comida</span>
        <div className="trilho"><i style={{ '--cor': 'var(--amarelo)', width: `${(resumo.refeicoesFeitas / resumo.refeicoesTotal) * 100}%` } as CSSProperties} /></div>
        <span>{resumo.refeicoesFeitas}/{resumo.refeicoesTotal}</span>
      </div>
      <div className="barra-poder">
        <span>Água</span>
        <div className="trilho"><i style={{ '--cor': 'var(--azul)', width: `${(resumo.copos / META_COPOS) * 100}%` } as CSSProperties} /></div>
        <span>{litros(resumo.copos)} de {(META_COPOS * ML_POR_COPO) / 1000} L</span>
      </div>
      <div className="agua">
        <button className="menos" aria-label="Tirar um copo de água" disabled={resumo.copos === 0} onClick={() => aplicar((r) => mudarCopos(r, -1), false)}><Minus aria-hidden /></button>
        <button className="mais" disabled={resumo.copos >= META_COPOS} onClick={() => { if (perfil.som) tocarAcerto(); aplicar((r) => mudarCopos(r, 1), false) }}>
          <Plus aria-hidden />{resumo.copos >= META_COPOS ? 'META BATIDA' : `UM COPO, +${XP_COPO} XP`}
        </button>
      </div>
      <div className="barra-poder">
        <span>Treino</span>
        <div className="trilho"><i style={{ '--cor': 'var(--vermelho)', width: resumo.treinoFeito ? '100%' : '0%' } as CSSProperties} /></div>
        <span>{resumo.temTreino ? (resumo.treinoFeito ? '1/1' : '0/1') : 'folga'}</span>
      </div>

      <p className="regra">{resumo.vencido ? 'Dia vencido.' : `Para vencer o dia: 6 das ${resumo.refeicoesTotal} refeições${resumo.temTreino ? ' e o treino' : ''}.`} A água vale XP extra.</p>

      <div className={`cafeina ${cafeina ? '' : 'fechada'}`} role="status">
        <Coffee aria-hidden />
        {cafeina ? 'Guaraná e café liberados até 15:00.' : 'Cafeína encerrada por hoje: sem guaraná e sem café até amanhã.'}
      </div>

      <h2 className="secao">MISSÕES DO DIA</h2>
      {missoes.map((m) => {
        const feita = registro.feitas.includes(m.id)
        return (
          <button key={m.id} className="missao" aria-pressed={feita} onClick={() => alternar(m)}>
            <span className="caixa"><Check aria-hidden /></span>
            <span>
              <span className="nome">{m.nome}</span>
              <span className="detalhe">{pratoDa(m)?.nome ?? (treino ? `${treino.nome}: ${treino.foco.toLowerCase()}` : m.detalhe)}</span>
            </span>
            <span className="quando">{m.hora}<small>+{m.xp} XP</small></span>
          </button>
        )
      })}

      <div className="rodape-tela">
        <p style={{ color: 'var(--apagado)', marginBottom: 12 }}>Fase {fase}: {FASES[fase].nome}.</p>
        <button className="botao fantasma" onClick={abrirAjustes}><Settings aria-hidden />Ajustar rotina e perfil</button>
      </div>

      <Pow golpe={golpe} aoTerminar={() => setGolpe(null)} />
    </>
  )
}
