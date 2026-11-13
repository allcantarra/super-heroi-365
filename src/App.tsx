import { CalendarCheck, Dumbbell, TrendingUp, Utensils, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDados } from './dados/useDados'
import { dataLocal } from './dominio/tempo'
import { diasComTreino } from './dominio/treino'
import { Cardapio } from './telas/Cardapio'
import { Hoje } from './telas/Hoje'
import { PrimeiraAbertura } from './telas/PrimeiraAbertura'
import { Ajustes } from './telas/Ajustes'
import { Evolucao } from './telas/Evolucao'
import { Treino } from './telas/Treino'
import { AvisoInstalar } from './ui/AvisoInstalar'
import { useAgora } from './ui/useAgora'

type Aba = 'hoje' | 'cardapio' | 'treino' | 'evolucao'

const ABAS: { id: Aba; nome: string; icone: LucideIcon }[] = [
  { id: 'hoje', nome: 'Hoje', icone: CalendarCheck },
  { id: 'cardapio', nome: 'Cardápio', icone: Utensils },
  { id: 'treino', nome: 'Treino', icone: Dumbbell },
  { id: 'evolucao', nome: 'Evolução', icone: TrendingUp },
]

function abaDoEndereco(): Aba {
  const h = location.hash.slice(1)
  return ABAS.some((a) => a.id === h) ? (h as Aba) : 'hoje'
}

export function App() {
  const [aba, setAba] = useState<Aba>(abaDoEndereco)
  const [ajustando, setAjustando] = useState(false)
  const [emAjustes, setEmAjustes] = useState(false)
  const { estado, erroAoSalvar, tentarDeNovo, salvarPerfil, mudarDia, mudarSessao, evolucao } = useDados()
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

  // A missão de treino de cada dia vem das sessões registradas; o resto do app lê os dias já com ela.
  const diasDoJogo = useMemo(() => (estado.fase === 'pronto' ? diasComTreino(estado.dados.dias, estado.dados.sessoes, hoje) : null), [estado, hoje])

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

  if (emAjustes) {
    return (
      <main className="app">
        <Ajustes
          perfil={dados.perfil}
          hoje={hoje}
          voltar={() => { setEmAjustes(false); window.scrollTo(0, 0) }}
          editarPerfil={() => { setEmAjustes(false); setAjustando(true); window.scrollTo(0, 0) }}
        />
      </main>
    )
  }

  return (
    <>
      <main className="app">
        {aba === 'hoje' ? (
          <Hoje dados={{ ...dados, dias: diasDoJogo! }} hoje={hoje} agora={agora} erroAoSalvar={erroAoSalvar} mudarDia={(d, m) => void mudarDia(d, m)} abrirAjustes={() => { setEmAjustes(true); window.scrollTo(0, 0) }} abrirTreino={() => ir('treino')} />
        ) : aba === 'cardapio' ? (
          <Cardapio perfil={dados.perfil} feitasHoje={diasDoJogo!.get(hoje)?.feitas ?? []} inicioHoje={diasDoJogo!.get(hoje)?.inicio} hoje={hoje} salvarPerfil={(p) => void salvarPerfil(p)} />
        ) : aba === 'treino' ? (
          <Treino dados={dados} hoje={hoje} erroAoSalvar={erroAoSalvar} mudarSessao={(d, n, m) => void mudarSessao(d, n, m)} irParaHoje={() => ir('hoje')} />
        ) : (
          <Evolucao dados={dados} hoje={hoje} erroAoSalvar={erroAoSalvar} acoes={evolucao} />
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
