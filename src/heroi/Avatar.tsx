import type { ReactNode } from 'react'
import type { Estagio } from '../dominio/jogo'
import { CABELOS, PELES, UNIFORMES, escurecer, type Aparencia } from './aparencia'
import { CX, entre, espelhar, geometria, pontos, poseNatural, type Ponto, type Pose } from './geometria'

const TRACO = '#15122e'
const AMARELO = '#ffd60a'
const VERMELHO = '#e63946'

interface AvatarProps {
  estagio: Estagio
  aparencia: Aparencia
  pose?: Pose
}

function Segmento({ a, b, largura, cor, opacidade }: { a: Ponto; b: Ponto; largura: number; cor: string; opacidade?: number }) {
  return <polyline points={pontos(a, b)} fill="none" stroke={cor} strokeWidth={largura} strokeLinecap="round" strokeLinejoin="round" opacity={opacidade} />
}

function Raio({ escala, y, cor }: { escala: number; y: number; cor: string }) {
  const forma: Ponto[] = [[4, -13], [-7, 2], [0, 2], [-4, 13], [8, -3], [1, -3]]
  return (
    <polygon
      points={forma.map(([x, yy]) => `${CX + x * escala},${y + yy * escala}`).join(' ')}
      fill={cor}
      stroke={TRACO}
      strokeWidth={2.5}
      strokeLinejoin="round"
    />
  )
}

/** Herói vetorial em camadas. O corpo cresce com o estágio; uniforme, capa, máscara e emblema entram aos poucos. */
export function Avatar({ estagio, aparencia, pose }: AvatarProps) {
  const p = pose ?? poseNatural(estagio)
  const g = geometria(estagio, p)
  const m = g.massa
  const heroi = estagio >= 2
  const pele = PELES[aparencia.pele]
  const peleSombra = escurecer(pele, 0.82)
  const corUniforme = UNIFORMES[aparencia.uniforme]
  const traje = heroi ? corUniforme : '#8b89a8'
  const trajeSombra = escurecer(traje, 0.7)
  const corPerna = heroi ? traje : '#4a4866'
  const corBraco = heroi ? traje : pele
  const corLuva = heroi ? AMARELO : pele
  const { ombro: S, peito: C, cintura: W, quadril: H, pescoco: N } = g

  const braco = (f: (p: Ponto) => Ponto, chave: string): ReactNode => {
    const a = f(g.pOmbro), b = f(g.pCotovelo), c = f(g.pPunho), luva = entre(b, c, 0.42)
    return (
      <g key={chave}>
        <Segmento a={a} b={b} largura={g.braco + 8} cor={TRACO} />
        <Segmento a={b} b={c} largura={g.antebraco + 8} cor={TRACO} />
        <Segmento a={a} b={b} largura={g.braco} cor={corBraco} />
        <Segmento a={b} b={c} largura={g.antebraco} cor={corBraco} />
        {heroi && <Segmento a={luva} b={c} largura={g.antebraco} cor={corLuva} />}
        {estagio >= 3 && <Segmento a={entre(a, b, 0.25)} b={entre(a, b, 0.7)} largura={3} cor="#fff" opacidade={0.35} />}
        <circle cx={c[0]} cy={c[1]} r={g.antebraco / 2 + 4.5} fill={corLuva} stroke={TRACO} strokeWidth={3.5} />
        <circle cx={a[0]} cy={a[1]} r={g.braco / 2 + 4 + m * 3} fill={traje} stroke={TRACO} strokeWidth={3.5} />
      </g>
    )
  }

  const perna = (f: (p: Ponto) => Ponto, chave: string): ReactNode => {
    const a = f(g.pQuadril), b = f(g.pJoelho), c = f(g.pPe), bota = entre(b, c, 0.3)
    return (
      <g key={chave}>
        <Segmento a={a} b={b} largura={g.coxa + 8} cor={TRACO} />
        <Segmento a={b} b={c} largura={g.canela + 8} cor={TRACO} />
        <Segmento a={a} b={b} largura={g.coxa} cor={corPerna} />
        <Segmento a={b} b={c} largura={g.canela} cor={corPerna} />
        {heroi ? <Segmento a={bota} b={c} largura={g.canela + 2} cor={AMARELO} /> : <Segmento a={entre(b, c, 0.92)} b={c} largura={g.canela + 2} cor="#2a2840" />}
      </g>
    )
  }

  const torso = `M${CX - N / 2} 90 Q${CX - S * 0.55} 92 ${CX - S} 108 L${CX - C} 138 Q${CX - W - 3} 162 ${CX - W} 184 L${CX - H} 206 L${CX + H} 206 L${CX + W} 184 Q${CX + W + 3} 162 ${CX + C} 138 L${CX + S} 108 Q${CX + S * 0.55} 92 ${CX + N / 2} 90Z`
  const sombraTorso = `M${CX + C * 0.5} 96 L${CX + S} 108 L${CX + C} 138 Q${CX + W + 3} 162 ${CX + W} 184 L${CX + H} 206 L${CX + H * 0.45} 206 Q${CX + W} 150 ${CX + C * 0.5} 96Z`
  const yPeito = 136 + m * 5
  const contorno = { stroke: TRACO, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

  return (
    <svg viewBox="0 0 240 304" role="img" aria-label={`Seu herói, estágio ${estagio} de 4`}>
      {estagio === 4 &&
        Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2, b = a + 0.2
          return <path key={i} d={`M${CX} 150 L${CX + Math.cos(a) * 260} ${150 + Math.sin(a) * 260} L${CX + Math.cos(b) * 260} ${150 + Math.sin(b) * 260}Z`} fill="#fff" opacity={0.45} />
        })}
      {estagio === 3 && <circle cx={CX} cy={140} r={104} fill="#fff" opacity={0.35} />}

      {estagio === 2 && <path d={`M${CX - S + 4} 104 Q${CX - S - 24} 150 ${CX - S - 12} 214 L${CX + S + 12} 214 Q${CX + S + 24} 150 ${CX + S - 4} 104Z`} fill={VERMELHO} strokeWidth={4} {...contorno} />}
      {estagio === 3 && (
        <>
          <path d={`M${CX - S + 4} 104 Q${CX - S - 34} 180 ${CX - S - 24} 290 L${CX + S + 24} 290 Q${CX + S + 34} 180 ${CX + S - 4} 104Z`} fill={VERMELHO} strokeWidth={4} {...contorno} />
          <path d={`M${CX - S - 14} 200 q-4 40 0 84M${CX + S + 14} 200 q4 40 0 84`} fill="none" strokeWidth={2.5} opacity={0.5} {...contorno} />
        </>
      )}
      {estagio === 4 && (
        <>
          <path d={`M${CX - S + 4} 102 Q${CX - S - 58} 140 ${CX - S - 60} 236 Q${CX - S - 38} 250 ${CX - S - 34} 292 L${CX + S + 22} 292 Q${CX + S + 44} 200 ${CX + S - 4} 102Z`} fill={VERMELHO} strokeWidth={4} {...contorno} />
          <path d={`M${CX - S - 30} 150 q-18 50 -10 92M${CX - S - 12} 190 q-10 50 -4 96M${CX + S + 18} 190 q8 50 2 96`} fill="none" strokeWidth={2.5} opacity={0.5} {...contorno} />
        </>
      )}

      {perna((x) => x, 'pe')}
      {perna(espelhar, 'pd')}

      <path d={torso} fill={traje} strokeWidth={4} {...contorno} />
      <path d={sombraTorso} fill={trajeSombra} />
      {estagio >= 3 && (
        <path
          d={`M${CX - N / 2} 90 L${CX - S * 0.62} 97 L${CX - N / 2 + 2} 100ZM${CX + N / 2} 90 L${CX + S * 0.62} 97 L${CX + N / 2 - 2} 100Z`}
          fill={trajeSombra}
          strokeWidth={2.5}
          {...contorno}
        />
      )}
      {heroi ? (
        <path d={`M${CX - 2} ${yPeito} Q${CX - C * 0.5} ${yPeito + 9} ${CX - C + 5} ${yPeito - 6}M${CX + 2} ${yPeito} Q${CX + C * 0.5} ${yPeito + 9} ${CX + C - 5} ${yPeito - 6}`} fill="none" strokeWidth={3} {...contorno} />
      ) : (
        <path d={`M${CX - 9} 92 Q${CX} 102 ${CX + 9} 92`} fill="none" strokeWidth={3} {...contorno} />
      )}
      {estagio >= 3 && <path d={`M${CX} ${yPeito + 4} V186M${CX - 11} 156 H${CX + 11}M${CX - 11} 167 H${CX + 11}M${CX - 10} 178 H${CX + 10}`} fill="none" strokeWidth={2.6} {...contorno} />}
      {estagio === 4 && <path d={`M${CX - W - 4} 156 l7 6M${CX - W - 2} 168 l7 6M${CX + W + 4} 156 l-7 6M${CX + W + 2} 168 l-7 6`} fill="none" strokeWidth={2.6} {...contorno} />}
      <path d={torso} fill="none" strokeWidth={4} {...contorno} />

      {heroi && (
        <>
          <path d={`M${CX - H} 204 L${CX + H} 204 L${CX + 8} 226 L${CX - 8} 226Z`} fill={VERMELHO} strokeWidth={3.5} {...contorno} />
          <rect x={CX - H - 2} y={190} width={2 * H + 4} height={13} fill={AMARELO} stroke={TRACO} strokeWidth={3.5} />
          <rect x={CX - 8} y={188} width={16} height={17} fill="#fff8e7" stroke={TRACO} strokeWidth={3} />
        </>
      )}

      {estagio === 2 && <Raio escala={0.85} y={122} cor={AMARELO} />}
      {estagio === 3 && (
        <>
          <circle cx={CX} cy={122} r={14} fill={AMARELO} stroke={TRACO} strokeWidth={3} />
          <Raio escala={0.75} y={122} cor={VERMELHO} />
        </>
      )}
      {estagio === 4 && (
        <>
          <path d={`M${CX} 102 L${CX + 21} 118 L${CX} 146 L${CX - 21} 118Z`} fill={VERMELHO} strokeWidth={3.5} {...contorno} />
          <Raio escala={1} y={122} cor={AMARELO} />
        </>
      )}

      {braco((x) => x, 'be')}
      {braco(espelhar, 'bd')}
      {estagio >= 3 && (
        <>
          <circle cx={CX - S * 0.62} cy={100} r={5} fill={AMARELO} stroke={TRACO} strokeWidth={2.5} />
          <circle cx={CX + S * 0.62} cy={100} r={5} fill={AMARELO} stroke={TRACO} strokeWidth={2.5} />
        </>
      )}

      <rect x={CX - N / 2} y={74} width={N} height={20} fill={peleSombra} stroke={TRACO} strokeWidth={3.5} />
      <circle cx={CX - 23} cy={52} r={5.5} fill={pele} stroke={TRACO} strokeWidth={3} />
      <circle cx={CX + 23} cy={52} r={5.5} fill={pele} stroke={TRACO} strokeWidth={3} />
      <path d={`M${CX - 22} 42 Q${CX - 22} 20 ${CX} 20 Q${CX + 22} 20 ${CX + 22} 42 L${CX + 20} 62 Q${CX + 13} 82 ${CX} 84 Q${CX - 13} 82 ${CX - 20} 62Z`} fill={pele} strokeWidth={4} {...contorno} />
      <path d={`M${CX + 12} 26 Q${CX + 22} 30 ${CX + 22} 42 L${CX + 20} 62 Q${CX + 15} 76 ${CX + 6} 82 Q${CX + 14} 60 ${CX + 12} 26Z`} fill={peleSombra} />

      {aparencia.corte === 'Curto' && (
        <path d={`M${CX - 24} 44 Q${CX - 28} 14 ${CX} 14 Q${CX + 28} 14 ${CX + 24} 44 Q${CX + 20} 30 ${CX} 30 Q${CX - 20} 30 ${CX - 24} 44Z`} fill={CABELOS[aparencia.cabelo]} strokeWidth={3.5} {...contorno} />
      )}
      {aparencia.corte === 'Topete' && (
        <>
          <path d={`M${CX - 25} 46 Q${CX - 31} 12 ${CX - 4} 11 Q${CX + 10} 1 ${CX + 23} 12 Q${CX + 31} 22 ${CX + 25} 46 Q${CX + 21} 30 ${CX + 6} 31 Q${CX - 13} 32 ${CX - 25} 46Z`} fill={CABELOS[aparencia.cabelo]} strokeWidth={3.5} {...contorno} />
          <path d={`M${CX - 6} 17 Q${CX + 8} 10 ${CX + 17} 17`} fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.35} />
        </>
      )}

      {estagio >= 3 ? (
        <>
          <path d={`M${CX - 23} 38 H${CX + 23} L${CX + 21} 55 Q${CX + 11} 61 ${CX} 54 Q${CX - 11} 61 ${CX - 21} 55Z`} fill={estagio === 4 ? escurecer(corUniforme, 0.45) : TRACO} strokeWidth={2.5} {...contorno} />
          <path d={`M${CX - 16} 47 q6 -6 11 1 q-6 3 -11 -1ZM${CX + 16} 47 q-6 -6 -11 1 q6 3 11 -1Z`} fill="#fff" />
        </>
      ) : (
        <>
          {[CX - 10, CX + 10].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={48} rx={5} ry={3.8} fill="#fff" stroke={TRACO} strokeWidth={2} />
              <circle cx={x + 0.5} cy={48.5} r={2.2} fill={TRACO} />
            </g>
          ))}
          <path d={heroi ? `M${CX - 17} 39 l11 3M${CX + 17} 39 l-11 3` : `M${CX - 16} 41 l10 -3M${CX + 16} 41 l-10 -3`} fill="none" strokeWidth={3.1} {...contorno} />
        </>
      )}
      <path d={`M${CX} 55 l-3 8 h5`} fill="none" strokeWidth={2.4} {...contorno} />
      {estagio === 1 && <path d={`M${CX - 6} 71 Q${CX} 68 ${CX + 6} 71`} fill="none" strokeWidth={2.8} {...contorno} />}
      {estagio === 2 && <path d={`M${CX - 8} 68 Q${CX} 76 ${CX + 8} 68`} fill="none" strokeWidth={2.8} {...contorno} />}
      {estagio === 3 && <path d={`M${CX - 8} 70 Q${CX + 2} 76 ${CX + 10} 67`} fill="none" strokeWidth={2.8} {...contorno} />}
      {estagio === 4 && <path d={`M${CX - 10} 67 Q${CX} 80 ${CX + 10} 67Z`} fill="#fff" strokeWidth={2.5} {...contorno} />}
    </svg>
  )
}
