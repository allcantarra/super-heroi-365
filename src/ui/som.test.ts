import { beforeEach, expect, it, vi } from 'vitest'

interface Nota { inicio: number; fim: number; frequencia: number }
let notas: Nota[]
let desconexoes: number

/** Contexto de áudio de mentira, com o relógio parado em 100 s: só interessa quando cada nota foi agendada. */
class AudioDeMentira {
  currentTime = 100
  destination = {}
  resume = vi.fn(async () => {})
  createGain() {
    return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect: () => void desconexoes++ }
  }
  createOscillator() {
    const nota: Nota = { inicio: 0, fim: 0, frequencia: 0 }
    notas.push(nota)
    return {
      type: 'sine',
      frequency: { setValueAtTime: (f: number) => void (nota.frequencia = f), exponentialRampToValueAtTime() {} },
      connect() {},
      start: (t: number) => void (nota.inicio = t),
      stop: (t: number) => void (nota.fim = t),
    }
  }
}

beforeEach(() => {
  notas = []
  desconexoes = 0
  vi.stubGlobal('AudioContext', AudioDeMentira)
})

it('agenda três bipes curtos e um longo no relógio do áudio, na hora em que o descanso termina', async () => {
  const { agendarAviso } = await import('./som')
  agendarAviso(60)
  expect(notas.map((n) => n.inicio)).toEqual([157, 158, 159, 160])
  expect(notas[3].fim - notas[3].inicio).toBeGreaterThan(0.4)
  expect(notas[3].frequencia).toBeGreaterThan(notas[0].frequencia)
})

it('descanso curto não agenda bipe no passado, e cancelar corta a saída', async () => {
  const { agendarAviso } = await import('./som')
  const cancelar = agendarAviso(2.5)
  expect(notas.map((n) => n.inicio)).toEqual([100.5, 101.5, 102.5])
  cancelar()
  expect(desconexoes).toBe(1)
  expect(agendarAviso(0)).toBeTypeOf('function')
  expect(notas).toHaveLength(3)
})

it('sem suporte a áudio, não quebra', async () => {
  vi.stubGlobal('AudioContext', undefined)
  vi.resetModules()
  const { agendarAviso, tocarAcerto } = await import('./som')
  expect(() => agendarAviso(30)()).not.toThrow()
  expect(() => tocarAcerto()).not.toThrow()
})
