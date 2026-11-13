/** Vilão de gibi: uma bolha com cara. Derrotado, ganha olhos em X e as estrelinhas de nocaute. */
export function Vilao({ cor, nome, derrotado }: { cor: string; nome: string; derrotado: boolean }) {
  const T = '#15122e'
  return (
    <svg viewBox="0 0 120 96" role="img" aria-label={derrotado ? `${nome}, derrotado` : nome}>
      <path d="M8 88Q2 34 38 24Q60 4 86 24Q118 34 112 88Z" fill={cor} stroke={T} strokeWidth={4} strokeLinejoin="round" opacity={derrotado ? 0.55 : 1} />
      {derrotado ? (
        <>
          <path d="M33 44l12 10M45 44 33 54M75 44l12 10M87 44 75 54" stroke={T} strokeWidth={4} strokeLinecap="round" />
          <path d="M48 72q12-8 24 0" fill="none" stroke={T} strokeWidth={4} strokeLinecap="round" />
          <text x="60" y="16" textAnchor="middle" fontFamily="Anton" fontSize="14" fill="#ffd60a">K.O.</text>
        </>
      ) : (
        <>
          <path d="M30 50q9 7 18 0M72 50q9 7 18 0" fill="none" stroke={T} strokeWidth={4} strokeLinecap="round" />
          <path d="M28 40l20 4M92 40l-20 4" stroke={T} strokeWidth={4} strokeLinecap="round" />
          <ellipse cx="60" cy="70" rx="10" ry="7" fill={T} />
        </>
      )}
    </svg>
  )
}
