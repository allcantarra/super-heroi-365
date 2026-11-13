import { expect, test, type Page } from '@playwright/test'
import { abrirEm, concluirAbertura, perfilGravado } from './apoio'

const semEstouro = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)

const refeicao = (page: Page, n: number) => page.locator('details.refeicao').nth(n)
const aba = (page: Page, nome: string) => page.getByRole('tab', { name: nome })

test.beforeEach(async ({ page }) => {
  await abrirEm(page) // segunda-feira, 9 de novembro de 2026: dia 1, semana 1
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

test.describe('cardápio: dia', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole('button', { name: 'Cardápio' }).tap()
  })

  test('abre no dia de hoje, com as 8 refeições, a de agora aberta e o total perto da meta', async ({ page }) => {
    await expect(page.getByText('Dia 1 de 365, segunda')).toBeVisible()
    await expect(page.getByLabel('Data')).toHaveValue('2026-11-09')
    await expect(page.locator('details.refeicao')).toHaveCount(8)
    await expect(page.locator('details.refeicao[open]')).toHaveCount(1)
    await expect(page.locator('details.refeicao.agora')).toContainText('Pré-treino, agora')
    await expect(page.getByRole('button', { name: 'Dia anterior' })).toBeDisabled()
    await page.getByLabel('Metas da fase').tap()
    await expect(page.getByText('meta 2750')).toBeVisible()
    const kcal = Number(await page.locator('.macros dd').first().innerText())
    expect(Math.abs(kcal - 2750) / 2750).toBeLessThan(0.05)
    await expect(refeicao(page, 3)).toContainText('marmita')
    await expect(refeicao(page, 2)).toContainText('portátil')
    await semEstouro(page)
  })

  test('navega pelos dias: o cardápio muda, o almoço da marmita volta dois dias depois', async ({ page }) => {
    const titulo = (n: number) => refeicao(page, n).locator('.titulo').innerText()
    const almocoSegunda = await titulo(3), jantarSegunda = await titulo(6)
    await page.getByRole('button', { name: 'Próximo dia' }).tap()
    await expect(page.getByText('Dia 2 de 365, terça')).toBeVisible()
    expect(await titulo(3)).not.toBe(almocoSegunda)
    expect(await titulo(6)).not.toBe(jantarSegunda)
    await expect(page.locator('details.refeicao.agora')).toHaveCount(0)
    await page.getByRole('button', { name: 'Próximo dia' }).tap()
    expect(await titulo(3)).toBe(almocoSegunda)
    await page.getByRole('button', { name: 'Hoje', exact: true }).first().tap()
    await expect(page.getByText('Dia 1 de 365, segunda')).toBeVisible()
  })

  test('uma data lá na frente mostra a fase certa e outras quantidades', async ({ page }) => {
    await page.getByLabel('Data').fill('2027-05-03')
    await expect(page.getByText('Dia 176 de 365, segunda')).toBeVisible()
    await expect(page.getByText('Fase 3: Volume Atlético')).toBeVisible()
    await page.getByLabel('Metas da fase').tap()
    await expect(page.getByText('meta 3250')).toBeVisible()
    const kcal = Number(await page.locator('.macros dd').first().innerText())
    expect(Math.abs(kcal - 3250) / 3250).toBeLessThan(0.05)
    await page.getByLabel('Data').fill('2027-11-08')
    await expect(page.getByText('Dia 365 de 365')).toBeVisible()
    await expect(page.getByText('Fase 4: Definição')).toBeVisible()
  })

  test('trocar o jantar vale só naquele dia, aparece na tela Hoje e sobrevive a recarregar', async ({ page }) => {
    await refeicao(page, 6).locator('summary').tap()
    await page.getByLabel('Trocar Jantar').selectOption({ label: 'Churrasco com arroz' })
    await expect(refeicao(page, 6).locator('summary')).toContainText('Churrasco com arroz')
    await expect.poll(async () => (await perfilGravado(page)).trocas).toEqual({ '2026-11-09:jantar': 'jantar7' })
    await page.reload()
    await page.getByRole('button', { name: 'Hoje', exact: true }).tap()
    await expect(page.getByRole('button', { name: /Jantar.*Churrasco com arroz/ })).toBeVisible()
    await page.getByRole('button', { name: 'Cardápio' }).tap()
    await expect(refeicao(page, 6).locator('summary')).toContainText('Churrasco com arroz')
    await refeicao(page, 6).locator('summary').tap()
    await page.getByLabel('Trocar Jantar').selectOption({ label: 'Hambúrguer caseiro no pão (original)' })
    await expect(refeicao(page, 6).locator('summary')).toContainText('Hambúrguer caseiro no pão')
    await expect.poll(async () => (await perfilGravado(page)).trocas).toEqual({})
  })

  test('o lanche de trabalho só oferece opção portátil', async ({ page }) => {
    await refeicao(page, 2).locator('summary').tap()
    await expect(page.getByLabel('Trocar Lanche da manhã')).toBeVisible()
    const opcoes = await page.getByLabel('Trocar Lanche da manhã').locator('option').allTextContents()
    expect(opcoes.length).toBeGreaterThanOrEqual(10)
    expect(opcoes.join('|')).not.toMatch(/Arroz|Macarrão|Omelete|Purê|Lasanha/)
  })

  test('ver receita abre a receita do prato', async ({ page }) => {
    await refeicao(page, 3).locator('summary').tap()
    await refeicao(page, 3).getByRole('button', { name: 'Ver receita' }).tap()
    await expect(aba(page, 'Receitas')).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('details[open] summary')).toContainText('Batata assada crocante')
    await expect(page.locator('details[open]')).toContainText('Modo de preparo')
    await semEstouro(page)
  })
})

test.describe('cardápio: semana e compras', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole('button', { name: 'Cardápio' }).tap()
  })

  test('a semana mostra as 3 marmitas com porções e os 7 dias', async ({ page }) => {
    await aba(page, 'Semana').tap()
    await expect(page.getByText('Semana 1, de 09/11 a 15/11')).toBeVisible()
    await expect(page.locator('article.marmita')).toHaveCount(3)
    await expect(page.locator('article.marmita').nth(0)).toContainText('3 porções')
    await expect(page.locator('article.marmita').nth(0)).toContainText('seg, qua, sex')
    await expect(page.locator('article.marmita').nth(0)).toContainText('Arroz, bife e batata')
    await expect(page.locator('article.marmita').nth(1)).toContainText('2 porções')
    await expect(page.locator('.linha-dia')).toHaveCount(7)
    await expect(page.locator('.linha-dia.hoje')).toContainText('seg')
    await semEstouro(page)
  })

  test('trocar a marmita muda o almoço de segunda, quarta e sexta, e só deles', async ({ page }) => {
    await aba(page, 'Semana').tap()
    await page.getByLabel('Trocar marmita A').selectOption({ label: 'Estrogonofe de frango com arroz' })
    await expect(page.locator('article.marmita').nth(0)).toContainText('Estrogonofe de frango com arroz')
    for (const n of [0, 2, 4]) await expect(page.locator('.linha-dia').nth(n)).toContainText('Estrogonofe de frango com arroz')
    for (const n of [1, 3, 5, 6]) await expect(page.locator('.linha-dia').nth(n)).not.toContainText('Estrogonofe')
    await expect.poll(async () => (await perfilGravado(page)).trocas).toEqual({ 's0:A': 'almoco8' })
    // tocar num dia leva ao cardápio daquele dia
    await page.locator('.linha-dia').nth(2).tap()
    await expect(aba(page, 'Dia')).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByText('Dia 3 de 365, quarta')).toBeVisible()
    await expect(refeicao(page, 3).locator('summary')).toContainText('Estrogonofe de frango com arroz')
  })

  test('a próxima semana tem outras marmitas', async ({ page }) => {
    await aba(page, 'Semana').tap()
    const desta = await page.locator('article.marmita h3').allInnerTexts()
    await page.getByRole('button', { name: 'Próxima semana' }).tap()
    await expect(page.getByText('Semana 2, de 16/11 a 22/11')).toBeVisible()
    const proxima = await page.locator('article.marmita h3').allInnerTexts()
    expect(proxima.filter((p) => desta.includes(p))).toEqual([])
    await expect(page.getByRole('button', { name: 'Semana anterior' })).toBeEnabled()
  })

  test('lista de compras da semana: peso cru, marcar sobrevive a recarregar, limpar desmarca', async ({ page }) => {
    await aba(page, 'Compras').tap()
    await expect(page.getByLabel('Comprar para')).toContainText('Esta semana (09/11 a 15/11)')
    await expect(page.getByText('Arroz cru')).toBeVisible()
    await expect(page.locator('.contador')).toHaveText(/^0 de \d+ itens no carrinho$/)
    await page.getByLabel(/Arroz cru/).check()
    await expect(page.locator('.contador')).toHaveText(/^1 de \d+ itens no carrinho$/)
    await expect.poll(async () => (await perfilGravado(page)).comprados).toEqual(['arroz'])
    await page.reload()
    await page.getByRole('button', { name: 'Cardápio' }).tap()
    await aba(page, 'Compras').tap()
    await expect(page.getByLabel(/Arroz cru/)).toBeChecked()
    const semana = await page.locator('.compra', { hasText: 'Leite integral' }).locator('b').innerText()
    await page.getByLabel('Comprar para').selectOption('4')
    expect(await page.locator('.compra', { hasText: 'Leite integral' }).locator('b').innerText()).not.toBe(semana)
    await semEstouro(page)
    await page.getByRole('button', { name: 'Limpar marcações' }).tap()
    await expect(page.getByLabel(/Arroz cru/)).not.toBeChecked()
  })

  test('nada proibido aparece em 30 dias de cardápio, nas receitas nem nas compras', async ({ page }) => {
    const proibido = /feij|verdura|salada |alface|cenoura|peixe|atum|camar/i
    for (let i = 0; i < 30; i++) {
      expect(await page.locator('details.refeicao').allTextContents().then((t) => t.join(' '))).not.toMatch(proibido)
      await page.getByRole('button', { name: 'Próximo dia' }).tap()
    }
    await expect(page.getByText('Dia 31 de 365')).toBeVisible()
    await expect(page.getByText('Fase 2: Ganho Acelerado')).toBeVisible()
    await aba(page, 'Receitas').tap()
    expect(await page.locator('main').innerText()).not.toMatch(proibido)
    await aba(page, 'Compras').tap()
    expect(await page.locator('main').innerText()).not.toMatch(proibido)
  })
})
