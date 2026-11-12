import type { Page } from '@playwright/test'

/** Segunda-feira, 9 de novembro de 2026, 10h. Dia de treino, antes do corte da cafeína. */
export const SEGUNDA_10H = new Date(2026, 10, 9, 10, 0, 0)

export async function abrirEm(page: Page, quando: Date = SEGUNDA_10H) {
  await page.clock.install({ time: quando })
  await page.goto('/')
}

/** Passa pela primeira abertura com dados fictícios e a rotina padrão. */
export async function concluirAbertura(page: Page) {
  await page.getByLabel('Peso de hoje (kg)').fill('60,5')
  await page.getByLabel('Meta de peso (kg)').fill('70')
  await page.getByLabel('Altura (cm)').fill('175')
  await page.getByLabel('Idade').fill('30')
  await page.getByRole('button', { name: 'Continuar' }).tap()
  await page.getByRole('button', { name: 'Continuar' }).tap()
  await page.getByRole('button', { name: 'Começar' }).tap()
}
