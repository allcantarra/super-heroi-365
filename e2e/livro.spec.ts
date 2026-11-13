import { expect, test, type Page } from '@playwright/test'
import { aba, abrirEm, concluirAbertura } from './apoio'

const semEstouro = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
const conta = (page: Page) => page.locator('.livro-conta')

test.beforeEach(async ({ page }) => {
  await abrirEm(page)
  await concluirAbertura(page)
  await aba(page, 'Cardápio').tap()
  await page.getByRole('tab', { name: 'Receitas' }).tap()
})

test('livro de receitas: todos os pratos, busca sem acento, filtro por refeição e por besteira', async ({ page }) => {
  await expect(conta(page)).toContainText(/3\d\d receitas no livro/)
  await semEstouro(page)

  await page.getByLabel('Buscar receita').fill('acai')
  await expect(conta(page)).toContainText(/\d+ receitas? encontradas?/)
  const nomes = await page.locator('details.receita summary span').allInnerTexts()
  expect(nomes.length).toBeGreaterThan(0)
  for (const n of nomes) expect(n.toLowerCase()).toMatch(/açaí/)

  await page.getByLabel('Buscar receita').fill('')
  await page.getByLabel('Refeição').selectOption({ label: 'Jantar' })
  await page.getByLabel('Tipo').selectOption({ label: 'Besteira planejada' })
  const besteiras = page.locator('details.receita')
  expect(await besteiras.count()).toBeGreaterThanOrEqual(4)
  await besteiras.filter({ hasText: 'Pizza caseira de mussarela' }).locator('summary').tap()
  const pizza = page.locator('details.receita[open]')
  await expect(pizza).toContainText('Besteira planejada')
  await expect(pizza).toContainText('Ingredientes')
  await expect(pizza).toContainText('Modo de preparo')
  await expect(pizza).toContainText(/disco/)
  await semEstouro(page)

  await page.getByLabel('Buscar receita').fill('xyzw')
  await expect(page.getByText('Nenhuma receita com esse filtro.')).toBeVisible()
})

test('fritura mostra a versão na airfryer e lanche diz como levar', async ({ page }) => {
  await page.getByLabel('Buscar receita').fill('nuggets')
  await page.locator('details.receita summary').first().tap()
  await expect(page.locator('details.receita[open]')).toContainText('Na airfryer:')
  await page.getByLabel('Buscar receita').fill('coxinha')
  await page.getByLabel('Refeição').selectOption({ label: 'Lanches' })
  await page.locator('details.receita summary').first().tap()
  await expect(page.locator('details.receita[open]')).toContainText('Para levar:')
  await semEstouro(page)
})
