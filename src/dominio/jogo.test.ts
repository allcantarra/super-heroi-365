import { describe, expect, it } from 'vitest'
import { estagioDoNivel, NIVEL_MAXIMO, progressoDe, xpParaSubir } from './jogo'

describe('progressão', () => {
  it('começa no nível 1 sem XP', () => {
    expect(progressoDe(0)).toEqual({ nivel: 1, xpNoNivel: 0, xpDoNivel: 400 })
  })

  it('sobe de nível exatamente no limite', () => {
    expect(progressoDe(399).nivel).toBe(1)
    expect(progressoDe(400)).toEqual({ nivel: 2, xpNoNivel: 0, xpDoNivel: 560 })
  })

  it('chega ao nível 4 com 1680 XP, como a spec prevê', () => {
    expect(progressoDe(1679).nivel).toBe(3)
    expect(progressoDe(1680).nivel).toBe(4)
  })

  it('para no nível máximo', () => {
    const total = Array.from({ length: NIVEL_MAXIMO - 1 }, (_, i) => xpParaSubir(i + 1)).reduce((a, b) => a + b, 0)
    expect(total).toBe(207760)
    expect(progressoDe(total)).toEqual({ nivel: 50, xpNoNivel: 0, xpDoNivel: 0 })
    expect(progressoDe(total * 3).nivel).toBe(50)
  })

  it('trata XP negativo ou quebrado como zero ou inteiro', () => {
    expect(progressoDe(-50).nivel).toBe(1)
    expect(progressoDe(400.9).xpNoNivel).toBe(0)
  })
})

describe('estágio do herói', () => {
  it.each([
    [1, 1], [3, 1], [4, 2], [19, 2], [20, 3], [37, 3], [38, 4], [50, 4],
  ])('nível %i é estágio %i', (nivel, estagio) => {
    expect(estagioDoNivel(nivel)).toBe(estagio)
  })
})
