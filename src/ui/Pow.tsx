export interface Golpe {
  id: number
  palavra: string
  linha: string
}

/** Onomatopeia que estoura na tela ao cumprir uma missão. Some sozinha. */
export function Pow({ golpe, aoTerminar }: { golpe: Golpe | null; aoTerminar: () => void }) {
  if (!golpe) return null
  return (
    <div key={golpe.id} className="pow" role="status" onAnimationEnd={aoTerminar}>
      <div>
        <b>{golpe.palavra}</b>
        <span>{golpe.linha}</span>
      </div>
    </div>
  )
}
