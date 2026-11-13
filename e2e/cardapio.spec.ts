import { expect, test, type Page } from '@playwright/test'
import { abrirEm, concluirAbertura, perfilGravado } from './apoio'

const semEstouro = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)

test.beforeEach(async ({ page }) => {
  await abrirEm(page) // segunda-feira
  await concluirAbertura(page)
})

test('a tela Hoje mostra o prato e os ingredientes da missão de agora', async ({ page }) => {
  const agora = page.getByLabel('Missão de agora')
  await expect(agora).toContainText('Banana com pasta de amendoim')
  await expect(agora).toContainText('1 banana')
  await expect(agora).toContainText('Guaraná em pó')
  await expect(page.getByRole('button', { name: /Almoço.*Arroz, bife e batata/ })).toBeVisible()
  await semEstouro(page)
})

test('depois das 15h o guaraná aparece cortado na missão', async ({ page }) => {
  await page.clock.fastForward('05:01:00')
  await expect(page.getByLabel('Missão de agora').locator('li.cortado')).toContainText('Guaraná em pó (cortado: passou das 15h)')
})

test.describe('cardápio', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole('button', { name: 'Cardápio' }).tap()
  })

  test('abre na fase atual e no dia de hoje, com as 8 refeições e o total perto da meta', async ({ page }) => {
    await expect(page.getByLabel('Fase', { exact: true })).toHaveValue('1')
    await expect(page.getByLabel('Dia da semana')).toHaveValue('1')
    await expect(page.locator('details.refeicao')).toHaveCount(8)
    await expect(page.locator('details.refeicao[open]')).toHaveCount(1)
    await expect(page.locator('details.refeicao.agora')).toContainText('Pré-treino, agora')
    await page.getByLabel('Metas da fase').tap()
    await expect(page.getByText('meta 2750')).toBeVisible()
    const kcal = Number(await page.locator('.macros dd').first().innerText())
    expect(Math.abs(kcal - 2750) / 2750).toBeLessThan(0.05)
    await expect(page.locator('details.refeicao').nth(3)).toContainText('marmita')
    await expect(page.locator('details.refeicao').nth(2)).toContainText('portátil')
    await semEstouro(page)
  })

  test('mudar a fase muda as quantidades e a meta', async ({ page }) => {
    const almoco = page.locator('details.refeicao').nth(3)
    await almoco.locator('summary').tap()
    const antes = await almoco.locator('.itens').innerText()
    await page.getByLabel('Fase', { exact: true }).selectOption('3')
    await page.getByLabel('Metas da fase').tap()
    await expect(page.getByText('meta 3250')).toBeVisible()
    expect(await almoco.locator('.itens').innerText()).not.toBe(antes)
  })

  test('trocar uma refeição vale no cardápio, na tela Hoje e depois de recarregar', async ({ page }) => {
    const jantar = page.locator('details.refeicao').nth(6)
    await jantar.locator('summary').tap()
    await page.getByLabel('Trocar Jantar').selectOption({ label: 'Churrasco com arroz' })
    await expect(jantar.locator('summary')).toContainText('Churrasco com arroz')
    await expect.poll(async () => (await perfilGravado(page)).trocas).toEqual({ '1:jantar': 'jantar7' })
    await page.reload()
    await page.getByRole('button', { name: 'Hoje' }).tap()
    await expect(page.getByRole('button', { name: /Jantar.*Churrasco com arroz/ })).toBeVisible()
    await page.getByRole('button', { name: 'Cardápio' }).tap()
    await expect(page.locator('details.refeicao').nth(6).locator('summary')).toContainText('Churrasco com arroz')
    // voltar ao prato original
    await page.locator('details.refeicao').nth(6).locator('summary').tap()
    await page.getByLabel('Trocar Jantar').selectOption({ label: 'Macarrão alho e óleo com frango (original)' })
    await expect(page.locator('details.refeicao').nth(6).locator('summary')).toContainText('Macarrão alho e óleo com frango')
  })

  test('o lanche de trabalho só oferece opção portátil', async ({ page }) => {
    await page.locator('details.refeicao').nth(2).locator('summary').tap()
    await expect(page.getByLabel('Trocar Lanche da manhã')).toBeVisible()
    const opcoes = await page.getByLabel('Trocar Lanche da manhã').locator('option').allTextContents()
    expect(opcoes.length).toBeGreaterThanOrEqual(8)
    expect(opcoes.join('|')).not.toMatch(/Arroz|Macarrão|Omelete|Purê/)
  })

  test('ver receita abre a receita do prato', async ({ page }) => {
    await page.locator('details.refeicao').nth(3).locator('summary').tap()
    await page.locator('details.refeicao').nth(3).getByRole('button', { name: 'Ver receita' }).tap()
    await expect(page.getByRole('tab', { name: 'Receitas' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('details[open] summary')).toContainText('Batata assada crocante')
    await expect(page.locator('details[open]')).toContainText('Modo de preparo')
    await semEstouro(page)
  })

  test('lista de compras: peso cru, marcar item sobrevive a recarregar, limpar desmarca', async ({ page }) => {
    await page.getByRole('tab', { name: 'Compras' }).tap()
    await expect(page.getByText('Arroz cru')).toBeVisible()
    await expect(page.getByText('Peito de frango (cru)')).toBeVisible()
    await expect(page.locator('.contador')).toHaveText(/^0 de \d+ itens no carrinho$/)
    await page.getByLabel(/Arroz cru/).check()
    await expect(page.locator('.contador')).toHaveText(/^1 de \d+ itens no carrinho$/)
    await expect.poll(async () => (await perfilGravado(page)).comprados).toEqual(['arroz'])
    await page.reload()
    await page.getByRole('button', { name: 'Cardápio' }).tap()
    await page.getByRole('tab', { name: 'Compras' }).tap()
    await expect(page.getByLabel(/Arroz cru/)).toBeChecked()
    const semana = await page.locator('.compra', { hasText: 'Leite integral' }).locator('b').innerText()
    await page.getByLabel('Comprar para').selectOption('4')
    expect(await page.locator('.compra', { hasText: 'Leite integral' }).locator('b').innerText()).not.toBe(semana)
    await semEstouro(page)
    await page.getByRole('button', { name: 'Limpar marcações' }).tap()
    await expect(page.getByLabel(/Arroz cru/)).not.toBeChecked()
  })

  test('nada proibido aparece no cardápio, nas receitas nem nas compras', async ({ page }) => {
    const proibido = /feij|verdura|salada |alface|cenoura|peixe|atum|camar/i
    for (const dia of ['0', '1', '2', '3', '4', '5', '6']) {
      await page.getByLabel('Dia da semana').selectOption(dia)
      expect(await page.locator('details.refeicao').allTextContents().then((t) => t.join(' '))).not.toMatch(proibido)
    }
    await page.getByRole('tab', { name: 'Receitas' }).tap()
    expect(await page.locator('main').innerText()).not.toMatch(proibido)
    await page.getByRole('tab', { name: 'Compras' }).tap()
    expect(await page.locator('main').innerText()).not.toMatch(proibido)
  })
})
