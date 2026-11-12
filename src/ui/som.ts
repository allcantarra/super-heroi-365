let contexto: AudioContext | undefined

/** Som curto de acerto. Precisa ser chamado dentro do toque do usuário, senão o iPhone bloqueia. */
export function tocarAcerto(): void {
  try {
    const Classe = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Classe) return
    contexto ??= new Classe()
    void contexto.resume()
    const t = contexto.currentTime
    const osc = contexto.createOscillator(), ganho = contexto.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(220, t)
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.12)
    ganho.gain.setValueAtTime(0.1, t)
    ganho.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    osc.connect(ganho)
    ganho.connect(contexto.destination)
    osc.start(t)
    osc.stop(t + 0.2)
  } catch {
    // sem som, o app continua funcionando
  }
}
