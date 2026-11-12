import { expect, test } from '@playwright/test'

test('abre no nível 1 como civil, sem erro no console', async ({ page }) => {
  const erros: string[] = []
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
  page.on('pageerror', (e) => erros.push(e.message))
  await page.goto('/')
  await expect(page.getByText('NÍVEL 1')).toBeVisible()
  await expect(page.getByRole('img', { name: 'Seu herói, estágio 1 de 4' }).first()).toBeVisible()
  expect(erros).toEqual([])
})

test('a personalização do herói continua depois de recarregar', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Uniforme').selectOption('Verde')
  await page.getByLabel('Corte').selectOption('Careca')
  await expect(page.getByLabel('Uniforme')).toHaveValue('Verde')
  await page.reload()
  await expect(page.getByLabel('Uniforme')).toHaveValue('Verde')
  await expect(page.getByLabel('Corte')).toHaveValue('Careca')
  // o estágio 2 da galeria usa a cor escolhida
  await expect(page.locator('figure').nth(1).locator('[fill="#1fa187"]').first()).toBeAttached()
})

test('navega entre as quatro seções e volta pelo botão do navegador', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Treino' }).tap()
  await expect(page.getByRole('heading', { name: 'Ficha em montagem' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Treino' })).toHaveAttribute('aria-current', 'page')
  await page.getByRole('button', { name: 'Cardápio' }).tap()
  await expect(page.getByRole('heading', { name: 'Cardápio em preparo' })).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Ficha em montagem' })).toBeVisible()
})

test('nada estoura a largura da tela de 375 px', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('NÍVEL 1')).toBeVisible()
  const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(sobra).toBe(0)
})

test('funciona sem internet depois da primeira visita', async ({ page, context }) => {
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByText('NÍVEL 1')).toBeVisible()
})

test('o manifesto de instalação está publicado', async ({ request }) => {
  const r = await request.get('/manifest.webmanifest')
  expect(r.ok()).toBe(true)
  const m = await r.json()
  expect(m.display).toBe('standalone')
  expect(m.icons.length).toBeGreaterThanOrEqual(2)
})
