import { CalendarCheck, Dumbbell, TrendingUp, Utensils, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Hoje } from './telas/Hoje'
import { AvisoInstalar } from './ui/AvisoInstalar'

type Aba = 'hoje' | 'cardapio' | 'treino' | 'evolucao'

const ABAS: { id: Aba; nome: string; icone: LucideIcon }[] = [
  { id: 'hoje', nome: 'Hoje', icone: CalendarCheck },
  { id: 'cardapio', nome: 'Cardápio', icone: Utensils },
  { id: 'treino', nome: 'Treino', icone: Dumbbell },
  { id: 'evolucao', nome: 'Evolução', icone: TrendingUp },
]

const EM_BREVE: Record<Exclude<Aba, 'hoje'>, { titulo: string; texto: string }> = {
  cardapio: { titulo: 'Cardápio em preparo', texto: 'Os 7 modelos de dia, as receitas e a lista de compras chegam na etapa 3.' },
  treino: { titulo: 'Ficha em montagem', texto: 'O treino guiado, com cronômetro e registro de séries, chega na etapa 4.' },
  evolucao: { titulo: 'Sem registros ainda', texto: 'Peso, medidas e fotos em quadrinho chegam na etapa 5.' },
}

function abaDoEndereco(): Aba {
  const h = location.hash.slice(1)
  return ABAS.some((a) => a.id === h) ? (h as Aba) : 'hoje'
}

export function App() {
  const [aba, setAba] = useState<Aba>(abaDoEndereco)

  useEffect(() => {
    const aoMudar = () => setAba(abaDoEndereco())
    window.addEventListener('hashchange', aoMudar)
    return () => window.removeEventListener('hashchange', aoMudar)
  }, [])

  const ir = (id: Aba) => {
    location.hash = id
    window.scrollTo(0, 0)
  }

  const atual = ABAS.find((a) => a.id === aba)!

  return (
    <>
      <main className="app">
        {aba === 'hoje' ? (
          <Hoje />
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
