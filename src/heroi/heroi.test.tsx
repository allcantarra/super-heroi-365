import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Estagio } from '../dominio/jogo'
import { APARENCIA_PADRAO, normalizarAparencia } from './aparencia'
import { Avatar } from './Avatar'
import { CX, espelhar, geometria, poseNatural } from './geometria'

const ESTAGIOS: Estagio[] = [1, 2, 3, 4]

describe('geometria do herói', () => {
  it('o corpo cresce a cada estágio', () => {
    const g = ESTAGIOS.map((e) => geometria(e, 'quadril'))
    for (let i = 1; i < g.length; i++) {
      expect(g[i].ombro).toBeGreaterThan(g[i - 1].ombro)
      expect(g[i].peito).toBeGreaterThan(g[i - 1].peito)
      expect(g[i].braco).toBeGreaterThan(g[i - 1].braco)
    }
  })

  it('ombro cresce mais que a cintura, formando o V', () => {
    const civil = geometria(1, 'civil'), lenda = geometria(4, 'quadril')
    expect(lenda.ombro / lenda.cintura).toBeGreaterThan(civil.ombro / civil.cintura)
  })

  it('espelha pontos em torno do eixo central', () => {
    expect(espelhar([CX - 30, 50])).toEqual([CX + 30, 50])
  })

  it('na pose de vitória o punho fica acima do ombro', () => {
    const g = geometria(3, 'vitoria')
    expect(g.pPunho[1]).toBeLessThan(g.pOmbro[1])
  })

  it('civil não faz pose de herói por padrão', () => {
    expect(poseNatural(1)).toBe('civil')
    expect(poseNatural(2)).toBe('quadril')
  })
})

describe('aparência', () => {
  it('aceita aparência válida', () => {
    const a = { pele: 'Escura', cabelo: 'Loiro', uniforme: 'Roxo', corte: 'Careca' }
    expect(normalizarAparencia(a)).toEqual(a)
  })

  it('troca valor desconhecido ou ausente pelo padrão', () => {
    expect(normalizarAparencia({ pele: 'Verde', uniforme: '<script>' })).toEqual(APARENCIA_PADRAO)
    expect(normalizarAparencia(null)).toEqual(APARENCIA_PADRAO)
  })
})

describe('Avatar', () => {
  it.each(ESTAGIOS)('desenha o estágio %i sem valores inválidos', (estagio) => {
    const { container } = render(<Avatar estagio={estagio} aparencia={APARENCIA_PADRAO} />)
    expect(screen.getByRole('img', { name: `Seu herói, estágio ${estagio} de 4` })).toBeTruthy()
    expect(container.innerHTML).not.toMatch(/NaN|undefined/)
  })

  it('usa a cor do uniforme escolhido só depois de virar herói', () => {
    const verde = { ...APARENCIA_PADRAO, uniforme: 'Verde' as const }
    expect(render(<Avatar estagio={1} aparencia={verde} />).container.innerHTML).not.toContain('#1fa187')
    expect(render(<Avatar estagio={2} aparencia={verde} />).container.innerHTML).toContain('#1fa187')
  })
})
