// Mostra a faixa de calorias e macros dos dias de cada fase, contra a meta. Rodar: npx vite-node scripts/relatorio-macros.ts
import { METAS } from '../src/conteudo/cardapio.ts'
import { fasePara, macrosDaData } from '../src/dominio/cardapio.ts'
import { somarDias, type Fase } from '../src/dominio/tempo.ts'

const DIA_UM = '2026-11-12'
const ano = Array.from({ length: 365 }, (_, i) => somarDias(DIA_UM, i))

for (const f of [1, 2, 3, 4] as Fase[]) {
  const dias = ano.filter((d) => fasePara(DIA_UM, d) === f).map((d) => macrosDaData(DIA_UM, d, {}))
  const faixa = (k: 'kcal' | 'p' | 'c' | 'g') => `${Math.round(Math.min(...dias.map((m) => m[k])))}-${Math.round(Math.max(...dias.map((m) => m[k])))}`
  const media = (k: 'kcal' | 'p' | 'c' | 'g') => Math.round(dias.reduce((s, m) => s + m[k], 0) / dias.length)
  const m = METAS[f]
  console.log(`fase ${f} (${dias.length} dias) | kcal ${faixa('kcal')} média ${media('kcal')} (meta ${m.kcal}) | P ${faixa('p')} média ${media('p')} (${m.p}) | C ${faixa('c')} média ${media('c')} (${m.c}) | G ${faixa('g')} média ${media('g')} (${m.g})`)
}
