import { ChevronDown, ListOrdered } from 'lucide-react'
import { EXERCICIOS, type IdExercicio } from '../conteudo/treinos'

/** Passo a passo completo do exercício, recolhido por padrão para não empurrar o registro da série para baixo. */
export function PassoAPasso({ exercicio, aberto = false }: { exercicio: IdExercicio; aberto?: boolean }) {
  const ex = EXERCICIOS[exercicio]
  return (
    // a chave reabre o painel no estado inicial sempre que o exercício muda
    <details key={exercicio} className="passo-a-passo" open={aberto}>
      <summary><ListOrdered aria-hidden />Passo a passo<ChevronDown aria-hidden className="seta" /></summary>
      <h3>Posição inicial</h3>
      <p>{ex.inicio}</p>
      <h3>Execução</h3>
      <ol>{ex.passos.map((p) => <li key={p}>{p}</li>)}</ol>
      <h3>Respiração</h3>
      <p>{ex.respiracao}</p>
      <h3>Erros comuns</h3>
      <ul>{ex.erros.map((e) => <li key={e}>{e}</li>)}</ul>
      <h3>Mais fácil</h3>
      <p>{ex.maisFacil}</p>
      <h3>Mais difícil</h3>
      <p>{ex.maisDificil}</p>
    </details>
  )
}
