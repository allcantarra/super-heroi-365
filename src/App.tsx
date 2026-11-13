import { CalendarCheck, Dumbbell, TrendingUp, Utensils, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDados } from './dados/useDados'
import { dataLocal } from './dominio/tempo'
import { Cardapio } from './telas/Cardapio'
import { Hoje } from './telas/Hoje'
import { PrimeiraAbertura } from './telas/PrimeiraAbertura'
import { AvisoInstalar } from './ui/AvisoInstalar'
import { useAgora } from './ui/useAgora'

type Aba = 'hoje' | 'cardapio' | 'treino' | 'evolucao'
type AbaEmBreve = 'treino' | 'evolucao'

const ABAS: { id: Aba; nome: string; icone: LucideIcon }[] = [
  { id: 'hoje', nome: 'Hoje', icone: CalendarCheck },
  { id: 'cardapio', nome: 'Cardápio', icone: Utensils },
  { id: 'treino', nome: 'Treino', icone: Dumbbell },
  { id: 'evolucao', nome: 'Evolução', icone: TrendingUp },
]

const EM_BREVE: Record<AbaEmBreve, { titulo: string; texto: string }> = {
  treino: { titulo: 'Ficha em montagem', texto: 'O treino guiado, com cronômetro e registro de séries, chega na etapa 4.' },
  evolucao: { titulo: 'Sem registros ainda', texto: 'Peso, medidas e fotos em quadrinho chegam na etapa 5.' },
}

function abaDoEndereco(): Aba {
  const h = location.hash.slice(1)
  return ABAS.some((a) => a.id === h) ? (h as Aba) : 'hoje'
}

export function App() {
  const [aba, setAba] = useState<Aba>(abaDoEndereco)
  const [ajustando, setAjustando] = useState(false)
  const { estado, erroAoSalvar, tentarDeNovo, salvarPerfil, mudarDia } = useDados()
  const agora = useAgora()
  const hoje = dataLocal(agora)

  useEffect(() => {
    const aoMudar = () => setAba(abaDoEndereco())
    window.addEventListener('hashchange', aoMudar)
    return () => window.removeEventListener('hashchange', aoMudar)
  }, [])

  const ir = (id: Aba) => {
    location.hash = id
    window.scrollTo(0, 0)
  }

  if (estado.fase === 'carregando') {
    return <main className="app"><p role="status">Abrindo seu gibi...</p></main>
  }

  if (estado.fase === 'erro') {
    return (
      <main className="app">
        <div className="painel escuro" role="alert" style={{ marginTop: 40 }}>
          <h2>Não consegui abrir seus dados</h2>
          <p>O armazenamento do aparelho não respondeu. Se o Safari estiver em modo privado, saia dele e abra o app de novo.</p>
          <button className="botao" style={{ marginTop: 14 }} onClick={tentarDeNovo}>Tentar de novo</button>
        </div>
      </main>
    )
  }

  const { dados } = estado
  const primeiraVez = !dados.perfil.diaUm

  if (primeiraVez || ajustando) {
    return (
      <main className="app">
        <PrimeiraAbertura
          perfil={dados.perfil}
          hoje={hoje}
          editando={!primeiraVez}
          aoCancelar={() => setAjustando(false)}
          aoSalvar={(perfil) => {
            void salvarPerfil(perfil)
            setAjustando(false)
            window.scrollTo(0, 0)
          }}
        />
        {erroAoSalvar && <p className="aviso" role="alert">Não deu para salvar neste aparelho. Tente de novo.</p>}
        {primeiraVez && <AvisoInstalar />}
      </main>
    )
  }

  const atual = ABAS.find((a) => a.id === aba)!

  return (
    <>
      <main className="app">
        {aba === 'hoje' ? (
          <Hoje dados={dados} hoje={hoje} agora={agora} erroAoSalvar={erroAoSalvar} mudarDia={(d, m) => void mudarDia(d, m)} abrirAjustes={() => { setAjustando(true); window.scrollTo(0, 0) }} />
        ) : aba === 'cardapio' ? (
          <Cardapio perfil={dados.perfil} hoje={hoje} salvarPerfil={(p) => void salvarPerfil(p)} />
        ) : (
          <div className="vazio">
            <atual.icone aria-hidden />
            <h1>{EM_BREVE[aba].titulo}</h1>
            <p>{EM_BREVE[aba].texto}</p>
          </div>
        )}
      </main>
      <AvisoInstalar />
      <nav className="nav" aria-label="Seções do app">
        {ABAS.map(({ id, nome, icone: Icone }) => (
          <button key={id} onClick={() => ir(id)} aria-current={aba === id ? 'page' : undefined}>
            <Icone aria-hidden />
            {nome}
          </button>
        ))}
      </nav>
    </>
  )
}
