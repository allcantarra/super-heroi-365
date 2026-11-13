import { describe, expect, it } from 'vitest'
import { PRATOS } from '../conteudo/pratos'
import { buscarReceitas } from './ReceitaDoPrato'

describe('busca do livro de receitas', () => {
  it('acha sem acento e com várias palavras, em ordem alfabética', () => {
    const acai = buscarReceitas('acai')
    expect(acai.length).toBeGreaterThan(0)
    for (const id of acai) expect(JSON.stringify(PRATOS[id]).toLowerCase()).toMatch(/açaí/)
    const frangoCatupiry = buscarReceitas('FRANGO catupiry')
    expect(frangoCatupiry.length).toBeGreaterThan(0)
    const nomes = buscarReceitas('').map((id) => PRATOS[id].nome)
    expect(nomes).toEqual([...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR')))
    expect(nomes.length).toBe(Object.keys(PRATOS).length)
  })

  it('filtra por refeição e por etiqueta', () => {
    for (const id of buscarReceitas('', 'jantar', 'besteira')) {
      expect(PRATOS[id].categoria).toBe('jantar')
      expect(PRATOS[id].etiquetas).toContain('besteira')
    }
    expect(buscarReceitas('', 'pre', 'besteira')).toEqual([])
    expect(buscarReceitas('nadaquecasa')).toEqual([])
  })
})
