// Mostra calorias e macros de cada dia em cada fase, contra a meta. Rodar: node scripts/relatorio-macros.ts
import { METAS } from '../src/conteudo/cardapio.ts'
import { macrosDoDia } from '../src/dominio/cardapio.ts'
import type { Fase } from '../src/dominio/tempo.ts'

for (const f of [1, 2, 3, 4] as Fase[]) {
  const dias = [0, 1, 2, 3, 4, 5, 6].map((d) => macrosDoDia(d, f, {}))
  const faixa = (k: 'kcal' | 'p' | 'c' | 'g') => `${Math.round(Math.min(...dias.map((m) => m[k])))}-${Math.round(Math.max(...dias.map((m) => m[k])))}`
  const m = METAS[f]
  console.log(`fase ${f} | kcal ${faixa('kcal')} (meta ${m.kcal}) | P ${faixa('p')} (${m.p}) | C ${faixa('c')} (${m.c}) | G ${faixa('g')} (${m.g})`)
}
