import { expect, test } from '@playwright/test'
import { abrirEm, concluirAbertura } from './apoio'

test('navega entre as quatro seções e volta pelo botão do navegador', async ({ page }) => {
  await abrirEm(page)
  await concluirAbertura(page)
  await page.getByRole('button', { name: 'Treino', exact: true }).tap()
  await expect(page.getByRole('heading', { name: 'Ficha em montagem' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Treino', exact: true })).toHaveAttribute('aria-current', 'page')
  await page.getByRole('button', { name: 'Evolução' }).tap()
  await expect(page.getByRole('heading', { name: 'Sem registros ainda' })).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Ficha em montagem' })).toBeVisible()
})

test('funciona sem internet depois da primeira visita', async ({ page, context }) => {
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Quem está por trás da máscara' })).toBeVisible()
})

test('o manifesto de instalação está publicado', async ({ request }) => {
  const r = await request.get('/manifest.webmanifest')
  expect(r.ok()).toBe(true)
  const m = await r.json()
  expect(m.display).toBe('standalone')
  expect(m.icons.length).toBeGreaterThanOrEqual(2)
})
