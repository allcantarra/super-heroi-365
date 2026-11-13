let contexto: AudioContext | undefined

/** Contexto de áudio único do app. Só é criado ou retomado dentro de um toque, senão o iPhone bloqueia. */
function audio(): AudioContext | null {
  const Classe = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Classe) return null
  contexto ??= new Classe()
  void contexto.resume()
  return contexto
}

function tom(ctx: AudioContext, saida: AudioNode, quando: number, de: number, ate: number, duracao: number, volume: number): void {
  const osc = ctx.createOscillator(), ganho = ctx.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(de, quando)
  if (ate !== de) osc.frequency.exponentialRampToValueAtTime(ate, quando + duracao * 0.6)
  ganho.gain.setValueAtTime(volume, quando)
  ganho.gain.exponentialRampToValueAtTime(0.001, quando + duracao)
  osc.connect(ganho)
  ganho.connect(saida)
  osc.start(quando)
  osc.stop(quando + duracao)
}

/** Som curto de acerto. Precisa ser chamado dentro do toque do usuário, senão o iPhone bloqueia. */
export function tocarAcerto(): void {
  try {
    const ctx = audio()
    if (ctx) tom(ctx, ctx.destination, ctx.currentTime, 220, 880, 0.2, 0.1)
  } catch {
    // sem som, o app continua funcionando
  }
}

/**
 * Agenda um aviso sonoro para daqui a `segundos` (fim do descanso, alvo da prancha): três bipes curtos nos últimos 3 segundos e um longo no zero.
 * O agendamento fica no relógio do próprio áudio, feito no toque que registrou a série: não depende de temporizador da página.
 * Devolve a função que cancela (pular ou ajustar o descanso).
 */
export function agendarAviso(segundos: number): () => void {
  try {
    const ctx = audio()
    if (!ctx || segundos <= 0) return () => {}
    const saida = ctx.createGain()
    saida.connect(ctx.destination)
    const fim = ctx.currentTime + segundos
    for (const antes of [3, 2, 1]) if (segundos > antes) tom(ctx, saida, fim - antes, 660, 660, 0.09, 0.08)
    tom(ctx, saida, fim, 990, 990, 0.55, 0.12)
    return () => {
      try {
        saida.disconnect()
      } catch {
        // já desconectado
      }
    }
  } catch {
    return () => {}
  }
}
