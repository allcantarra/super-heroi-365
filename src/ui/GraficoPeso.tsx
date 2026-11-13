import { useState } from 'react'
import type { PontoDeTendencia } from '../dominio/evolucao'
import { dataCurta, diasEntre, somarDias } from '../dominio/tempo'

/** Cores validadas contra o fundo escuro (dataviz, checagens de luminosidade, daltonismo e contraste). */
const COR_PESAGEM = '#4f86e0'
const COR_TENDENCIA = '#b38a00'
const FUNDO = '#0b0920'

const kg = (n: number) => n.toFixed(1).replace('.', ',')

interface Props {
  pontos: PontoDeTendencia[]
  meta: number
}

const L = 343, A = 240, ESQ = 34, DIR = 8, TOPO = 10, BASE = 24

/** Passo de grade que dá de 3 a 6 linhas na faixa de pesos. */
function passoDaGrade(faixa: number): number {
  for (const p of [0.5, 1, 2, 5, 10]) if (faixa / p <= 8) return p
  return 20
}

/**
 * Peso ao longo do tempo: pontos de pesagem, linha de tendência e a faixa da meta (meta ± 1 kg).
 * Tocar perto de um ponto mostra o valor dele na linha acima do gráfico.
 */
export function GraficoPeso({ pontos, meta }: Props) {
  const [escolhido, setEscolhido] = useState<number | null>(null)
  const atual = pontos[escolhido ?? pontos.length - 1]
  const inicio = pontos[0].data
  const fim = diasEntre(inicio, pontos[pontos.length - 1].data) < 14 ? somarDias(inicio, 14) : pontos[pontos.length - 1].data
  const totalDias = diasEntre(inicio, fim)
  const valores = [...pontos.flatMap((p) => [p.kg, p.tendencia]), meta - 1, meta + 1]
  const passo = passoDaGrade(Math.max(...valores) - Math.min(...valores) + 2)
  const minimo = Math.floor((Math.min(...valores) - 0.5) / passo) * passo
  const maximo = Math.ceil((Math.max(...valores) + 0.5) / passo) * passo
  const x = (data: string) => ESQ + (diasEntre(inicio, data) / totalDias) * (L - ESQ - DIR)
  const y = (v: number) => TOPO + ((maximo - v) / (maximo - minimo)) * (A - TOPO - BASE)
  const grade = Array.from({ length: Math.round((maximo - minimo) / passo) + 1 }, (_, i) => minimo + i * passo)
  const linha = pontos.map((p, i) => `${i ? 'L' : 'M'}${x(p.data).toFixed(1)},${y(p.tendencia).toFixed(1)}`).join(' ')
  const rotulosX = [inicio, ...(totalDias > 40 ? [somarDias(inicio, Math.round(totalDias / 2))] : []), fim]

  return (
    <figure className="grafico">
      <div className="legenda" aria-hidden>
        <span><i className="ponto" style={{ background: COR_PESAGEM }} />Pesagem</span>
        <span><i className="traco" style={{ background: COR_TENDENCIA }} />Tendência</span>
        <span><i className="amostra-meta" />Meta</span>
      </div>
      <p className="leitura" role="status">
        <b>{dataCurta(atual.data)}</b> pesagem {kg(atual.kg)} kg, tendência {kg(atual.tendencia)} kg
      </p>
      <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label={`Gráfico de peso de ${dataCurta(inicio)} a ${dataCurta(pontos[pontos.length - 1].data)}. Tendência atual ${kg(pontos[pontos.length - 1].tendencia)} kg, meta ${kg(meta)} kg.`}>
        {grade.map((v) => (
          <g key={v}>
            <line x1={ESQ} x2={L - DIR} y1={y(v)} y2={y(v)} stroke="#ffffff1f" strokeWidth={1} />
            <text x={ESQ - 6} y={y(v) + 4} textAnchor="end" className="eixo">{Number.isInteger(v) ? v : kg(v)}</text>
          </g>
        ))}
        <rect x={ESQ} width={L - ESQ - DIR} y={y(meta + 1)} height={y(meta - 1) - y(meta + 1)} fill="#fff8e7" fillOpacity={0.18} stroke="#fff8e7" strokeOpacity={0.55} strokeDasharray="4 3" />
        <text x={L - DIR - 4} y={y(meta + 1) + 14} textAnchor="end" className="eixo meta">meta {kg(meta)}</text>
        {rotulosX.map((d, i) => (
          <text key={d} x={x(d)} y={A - 6} textAnchor={i === 0 ? 'start' : i === rotulosX.length - 1 ? 'end' : 'middle'} className="eixo">{dataCurta(d)}</text>
        ))}
        {pontos.length > 1 && <path d={linha} fill="none" stroke={COR_TENDENCIA} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
        {pontos.map((p, i) => (
          <circle key={p.data} cx={x(p.data)} cy={y(p.kg)} r={i === (escolhido ?? pontos.length - 1) ? 6 : 4.5} fill={COR_PESAGEM} stroke={FUNDO} strokeWidth={2} />
        ))}
        {atual && <line x1={x(atual.data)} x2={x(atual.data)} y1={TOPO} y2={A - BASE} stroke="#fff8e7" strokeOpacity={0.35} strokeDasharray="3 3" />}
        {/* alvo de toque maior que o ponto: uma faixa vertical por pesagem */}
        {pontos.map((p, i) => {
          const meio = (a: number, b: number) => (a + b) / 2
          const esq = i === 0 ? ESQ : meio(x(pontos[i - 1].data), x(p.data))
          const dir = i === pontos.length - 1 ? L - DIR : meio(x(p.data), x(pontos[i + 1].data))
          return <rect key={p.data} x={esq} y={TOPO} width={Math.max(1, dir - esq)} height={A - TOPO - BASE} fill="transparent" onClick={() => setEscolhido(i)} />
        })}
      </svg>
    </figure>
  )
}
