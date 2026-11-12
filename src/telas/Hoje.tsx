import { Flame, Shield } from 'lucide-react'
import { useAparencia } from '../dados/useAparencia'
import { NIVEL_DO_ESTAGIO, TITULOS, estagioDoNivel, progressoDe, type Estagio } from '../dominio/jogo'
import { Avatar } from '../heroi/Avatar'
import { CABELOS, CORTES, PELES, UNIFORMES, type Aparencia } from '../heroi/aparencia'

const ESTAGIOS: Estagio[] = [1, 2, 3, 4]

function Lista<K extends keyof Aparencia>({ rotulo, campo, opcoes, aparencia, mudar }: {
  rotulo: string
  campo: K
  opcoes: readonly Aparencia[K][]
  aparencia: Aparencia
  mudar: (a: Aparencia) => void
}) {
  return (
    <label className="campo">
      {rotulo}
      <select value={aparencia[campo]} onChange={(e) => mudar({ ...aparencia, [campo]: e.target.value as Aparencia[K] })}>
        {opcoes.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}

export function Hoje() {
  const { aparencia, estado, erroAoSalvar, mudar, tentarDeNovo } = useAparencia()
  // Etapa 1: ainda não há missões, então o XP é zero. A etapa 2 calcula o total a partir dos registros.
  const progresso = progressoDe(0)
  const estagio = estagioDoNivel(progresso.nivel)

  if (estado === 'carregando') {
    return <p role="status">Abrindo seu gibi...</p>
  }

  if (estado === 'erro') {
    return (
      <div className="painel escuro" role="alert">
        <h2>Não consegui abrir seus dados</h2>
        <p>O armazenamento do aparelho não respondeu. Se o Safari estiver em modo privado, saia dele e abra o app de novo.</p>
        <button className="botao" style={{ marginTop: 14 }} onClick={tentarDeNovo}>Tentar de novo</button>
      </div>
    )
  }

  return (
    <>
      <section className="heroi" aria-label="Seu herói">
        <div className={`quadro e${estagio}`}>
          <Avatar estagio={estagio} aparencia={aparencia} />
        </div>
        <div>
          <span className="etiqueta">SUPER-HERÓI 365</span>
          <div className="nivel">NÍVEL {progresso.nivel}</div>
          <div className="titulo-heroi">{TITULOS[estagio]}</div>
          <div className="xp" role="progressbar" aria-label="Experiência" aria-valuemin={0} aria-valuemax={progresso.xpDoNivel} aria-valuenow={progresso.xpNoNivel}>
            <i style={{ width: `${progresso.xpDoNivel ? (progresso.xpNoNivel / progresso.xpDoNivel) * 100 : 100}%` }} />
          </div>
          <div className="xp-texto"><span>{progresso.xpNoNivel} XP</span><span>{progresso.xpDoNivel}</span></div>
          <div className="selos">
            <span className="selo fogo" title="Dias seguidos"><Flame aria-hidden /><span aria-label="0 dias seguidos">0</span></span>
            <span className="selo escudo" title="Escudos"><Shield aria-hidden /><span aria-label="0 escudos">0</span></span>
          </div>
        </div>
      </section>

      <section className="painel azul">
        <span className="aba">MONTE SEU HERÓI</span>
        <p>Ele começa como civil e ganha corpo, uniforme e capa conforme você cumpre as missões.</p>
        <div className="campos">
          <Lista rotulo="Pele" campo="pele" opcoes={Object.keys(PELES) as Aparencia['pele'][]} aparencia={aparencia} mudar={mudar} />
          <Lista rotulo="Cabelo" campo="cabelo" opcoes={Object.keys(CABELOS) as Aparencia['cabelo'][]} aparencia={aparencia} mudar={mudar} />
          <Lista rotulo="Corte" campo="corte" opcoes={CORTES} aparencia={aparencia} mudar={mudar} />
          <Lista rotulo="Uniforme" campo="uniforme" opcoes={Object.keys(UNIFORMES) as Aparencia['uniforme'][]} aparencia={aparencia} mudar={mudar} />
        </div>
        {erroAoSalvar && <p className="aviso" role="alert">Não deu para salvar a escolha neste aparelho. Ela vale só até fechar o app.</p>}
      </section>

      <h2 className="secao">A EVOLUÇÃO QUE VEM AÍ</h2>
      <div className="galeria">
        {ESTAGIOS.map((e) => (
          <figure key={e} className={e === estagio ? 'atual' : undefined}>
            <div className={`quadro e${e}`}>
              <Avatar estagio={e} aparencia={aparencia} />
            </div>
            <figcaption>
              {TITULOS[e]}
              <small>{e === estagio ? 'Você está aqui' : `A partir do nível ${NIVEL_DO_ESTAGIO[e]}`}</small>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  )
}
