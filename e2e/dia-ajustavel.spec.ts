import { expect, test, type Page } from '@playwright/test'
import { abrirEm, concluirAbertura } from './apoio'

const semEstouro = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
const aviso = (page: Page) => page.getByLabel('Horário do dia')
// rotina padrão do cadastro de teste: acorda 06:00, sai 07:30, chega 19:30; fim de semana acorda 08:00
const SEGUNDA = (h: number, m: number) => new Date(2026, 10, 9, h, m, 0)

test('atraso pequeno (menos de 15 minutos) não muda nada', async ({ page }) => {
  await abrirEm(page, SEGUNDA(6, 10))
  await concluirAbertura(page)
  await page.getByRole('button', { name: 'FEITO' }).tap()
  await expect(aviso(page)).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Treino.*06:15/ })).toBeVisible()
})

test('começar 40 minutos depois junta pré-treino e café e manda o treino para a noite; dá para voltar ao normal', async ({ page }) => {
  await abrirEm(page, SEGUNDA(6, 40))
  await concluirAbertura(page)
  await page.getByRole('button', { name: 'FEITO' }).tap()
  await expect(aviso(page)).toContainText('Seu dia começou às 06:40, 40 minutos depois do previsto.')
  await expect(page.getByRole('button', { name: /Pré-treino e café/ })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: /Café reforçado/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Treino.*19:45/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Jantar.*20:30/ })).toBeVisible()
  await expect(page.getByText(/Para vencer o dia: 6 das 7 refeições/)).toBeVisible()
  await semEstouro(page)

  await aviso(page).getByLabel('Corrigir a hora').selectOption('06:15')
  await expect(aviso(page)).toContainText('06:15, 15 minutos depois')
  await expect(page.getByRole('button', { name: /Treino.*06:30/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Café reforçado.*07:20/ })).toBeVisible()

  await aviso(page).getByRole('button', { name: 'Usar horários normais' }).tap()
  await expect(aviso(page)).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Treino.*06:15/ })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: /Treino.*06:15/ })).toBeVisible()
})

test('no sábado o dia inteiro anda com a hora real', async ({ page }) => {
  await abrirEm(page, new Date(2026, 10, 14, 10, 0, 0))
  await concluirAbertura(page)
  await expect(page.getByRole('button', { name: /Treino.*08:15/ })).toBeVisible()
  await page.getByRole('button', { name: 'FEITO' }).tap()
  await expect(aviso(page)).toContainText('10:00, 120 minutos depois')
  await expect(page.getByRole('button', { name: /Treino.*10:15/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Lanche reforçado/ })).toBeVisible()
})

test('o cadastro pede a rotina de fim de semana e recusa fim de semana curto demais', async ({ page }) => {
  await abrirEm(page)
  await page.getByLabel('Peso de hoje (kg)').fill('60')
  await page.getByLabel('Meta de peso (kg)').fill('70')
  await page.getByLabel('Altura (cm)').fill('175')
  await page.getByLabel('Idade').fill('30')
  await page.getByRole('button', { name: 'Continuar' }).tap()
  await expect(page.getByLabel('No fim de semana, acordo às')).toHaveValue('08:00')
  await page.getByLabel('No fim de semana, acordo às').fill('16:00')
  await page.getByRole('button', { name: 'Continuar' }).tap()
  await expect(page.getByText(/Deixe pelo menos 9 horas/)).toBeVisible()
  await semEstouro(page)
})

test('acabamento: água vira selo na meta, comprado desce para o fim, apagar confirma no estilo do app', async ({ page }) => {
  await abrirEm(page)
  await concluirAbertura(page)
  for (let i = 0; i < 12; i++) await page.getByRole('button', { name: /UM COPO/ }).tap()
  await expect(page.getByText('Meta de água batida')).toBeVisible()
  await expect(page.getByRole('button', { name: /UM COPO|META BATIDA/ })).toHaveCount(0)

  await page.getByRole('button', { name: 'Cardápio' }).tap()
  await page.getByRole('tab', { name: 'Compras' }).tap()
  const setor = page.locator('.setor').first()
  const primeiro = (await setor.locator('.compra span').first().innerText()).trim()
  await setor.locator('.compra').first().locator('input').check()
  await expect(setor.locator('.compra span').last()).toHaveText(primeiro)

  await page.getByRole('button', { name: 'Evolução', exact: true }).tap()
  await page.getByLabel('Peso (kg)').fill('61')
  await page.getByRole('button', { name: 'Salvar peso' }).tap()
  await page.getByRole('button', { name: /Apagar pesagem de/ }).tap()
  const dialogo = page.getByRole('alertdialog')
  await expect(dialogo).toContainText('Não dá para desfazer.')
  await dialogo.getByRole('button', { name: 'Cancelar' }).tap()
  await expect(page.getByRole('button', { name: /Apagar pesagem de/ })).toHaveCount(1)
  await page.getByRole('button', { name: /Apagar pesagem de/ }).tap()
  await dialogo.getByRole('button', { name: 'Apagar' }).tap()
  await expect(page.getByRole('button', { name: /Apagar pesagem de/ })).toHaveCount(0)
})
