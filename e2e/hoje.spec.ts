import { expect, test, type Page } from '@playwright/test'
import { aba, abrirEm, concluirAbertura, marcarTreinoComoNaEtapa3, treinoRapido } from './apoio'

const semEstouro = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)

const feito = (page: Page) => page.getByRole('button', { name: 'FEITO' })

test.describe('primeira abertura', () => {
  test('mostra erro ao lado do campo e não perde o que foi digitado', async ({ page }) => {
    await abrirEm(page)
    await page.getByLabel('Peso de hoje (kg)').fill('600')
    await page.getByLabel('Altura (cm)').fill('175')
    await page.getByRole('button', { name: 'Continuar' }).tap()
    await expect(page.getByText('Entre 30 e 200 kg.')).toBeVisible()
    await expect(page.getByText('Informe um número.')).toHaveCount(2)
    await expect(page.getByLabel('Altura (cm)')).toHaveValue('175')
    await expect(page.getByLabel('Peso de hoje (kg)')).toBeFocused()
    await expect(page.getByRole('heading', { name: 'Quem está por trás da máscara' })).toBeVisible()
    await semEstouro(page)
  })

  test('recusa rotina fora de ordem e mostra a prévia do dia quando está certa', async ({ page }) => {
    await abrirEm(page)
    await page.getByLabel('Peso de hoje (kg)').fill('60')
    await page.getByLabel('Meta de peso (kg)').fill('70')
    await page.getByLabel('Altura (cm)').fill('175')
    await page.getByLabel('Idade').fill('30')
    await page.getByRole('button', { name: 'Continuar' }).tap()
    await expect(page.getByText('SEU DIA VAI FICAR ASSIM')).toBeVisible()
    await page.getByLabel('Termino o trabalho às').fill('07:00')
    await expect(page.getByText('SEU DIA VAI FICAR ASSIM')).toBeHidden()
    await page.getByRole('button', { name: 'Continuar' }).tap()
    await expect(page.getByText('Precisa ser depois do horário anterior.').first()).toBeVisible()
    await page.getByLabel('Termino o trabalho às').fill('18:18')
    await page.getByLabel('Acordo às', { exact: true }).fill('05:30')
    await page.getByLabel('Chego em casa às').fill('21:30')
    await expect(page.locator('.previa li').first()).toHaveText('05:30Pré-treino')
    await semEstouro(page)
    await page.getByRole('button', { name: 'Continuar' }).tap()
    await page.getByRole('button', { name: 'Começar' }).tap()
    await expect(page.getByText('MISSÃO DE AGORA, 05:30')).toBeVisible()
  })
})

test.describe('dia de missões', () => {
  test.beforeEach(async ({ page }) => {
    await abrirEm(page)
    await concluirAbertura(page)
  })

  test('começa no dia 1, nível 1, sem erro no console', async ({ page }) => {
    const erros: string[] = []
    page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
    page.on('pageerror', (e) => erros.push(e.message))
    await page.reload()
    await expect(page.getByText('DIA 1 DE 365')).toBeVisible()
    await expect(page.getByText('NÍVEL 1')).toBeVisible()
    await expect(page.getByRole('button', { name: /Treino.*06:15/ })).toBeVisible()
    await semEstouro(page)
    expect(erros).toEqual([])
  })

  test('cumprir a missão de agora dá XP, avança a missão e sobrevive a recarregar', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'PRÉ-TREINO' })).toBeVisible()
    await feito(page).tap()
    await expect(page.locator('.pow')).toContainText('+40 XP')
    // são 10h: o treino das 06:15 já cedeu a vez para a refeição seguinte e continua pendente na lista
    await expect(page.getByRole('heading', { name: 'CAFÉ REFORÇADO' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Treino.*06:15/ })).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByText('40 XP', { exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('button', { name: /Pré-treino/ })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText('40 XP', { exact: true })).toBeVisible()
  })

  test('desfazer uma missão devolve o XP a zero', async ({ page }) => {
    const cafe = page.getByRole('button', { name: /Café reforçado/ })
    await cafe.tap()
    await expect(cafe).toHaveAttribute('aria-pressed', 'true')
    await cafe.tap()
    await expect(cafe).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByText('0 XP', { exact: true })).toBeVisible()
  })

  test('água soma até a meta e o botão de tirar funciona', async ({ page }) => {
    const mais = page.getByRole('button', { name: /UM COPO/ })
    await mais.tap()
    await mais.tap()
    await expect(page.getByText('0,50 de 3 L')).toBeVisible()
    await page.getByRole('button', { name: 'Tirar um copo de água' }).tap()
    await expect(page.getByText('0,25 de 3 L')).toBeVisible()
    for (let i = 0; i < 11; i++) await mais.tap()
    await expect(page.getByText('Meta de água batida')).toBeVisible()
    await expect(page.getByText('3,00 de 3 L')).toBeVisible()
  })

  test('vencer o dia sobe de nível, conta a sequência e fecha com dia completo', async ({ page }) => {
    for (let i = 0; i < 8; i++) await feito(page).tap()
    // sobrou só o treino: ele não se marca com um toque, e sem ele o dia não está vencido
    await expect(page.getByRole('heading', { name: 'TREINO', exact: true })).toBeVisible()
    await expect(feito(page)).toHaveCount(0)
    await expect(page.getByText(/Para vencer o dia/)).toBeVisible()
    await treinoRapido(page)
    await aba(page, 'Hoje').tap()
    await expect(page.getByRole('heading', { name: 'DIA COMPLETO' })).toBeVisible()
    // 8 x 40 + 120 + 80 de bônus = 520 XP: passa do nível 1 (400) e sobram 120
    await expect(page.getByText('NÍVEL 2')).toBeVisible()
    await expect(page.getByText('120 XP', { exact: true })).toBeVisible()
    await expect(page.getByText('1 dia', { exact: true })).toBeVisible()
    await expect(page.getByText(/Dia vencido\./)).toBeVisible()
  })

  test('o corte da cafeína vale sozinho quando passa das 15h', async ({ page }) => {
    await expect(page.getByText('Guaraná e café liberados até 15:00.')).toBeVisible()
    await page.clock.fastForward('05:01:00')
    await expect(page.getByText(/Cafeína encerrada por hoje/)).toBeVisible()
  })

  test('à meia-noite o dia vira sozinho e a sequência de ontem continua', async ({ page }) => {
    // treino marcado à mão, como na etapa 3: continua valendo para vencer o dia
    await marcarTreinoComoNaEtapa3(page, '2026-11-09')
    await page.reload()
    await expect(page.getByRole('button', { name: /Treino.*06:15/ })).toHaveAttribute('aria-pressed', 'true')
    for (let i = 0; i < 7; i++) await feito(page).tap()
    await expect(page.getByText(/Dia vencido\./)).toBeVisible()
    await page.clock.fastForward('14:01:00')
    await expect(page.getByText('DIA 2 DE 365')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'PRÉ-TREINO' })).toBeVisible()
    await expect(page.getByText('1 dia', { exact: true })).toBeVisible()
    await expect(page.getByText('0/8')).toBeVisible()
  })

  test('ajustar a rotina muda os horários das missões e pode ser cancelado', async ({ page }) => {
    await page.getByRole('button', { name: 'Ajustes', exact: true }).tap()
    await page.getByRole('button', { name: 'Editar rotina e perfil' }).tap()
    await expect(page.getByLabel('Peso de hoje (kg)')).toHaveValue('60,5')
    await page.getByRole('button', { name: 'Cancelar' }).tap()
    await expect(page.getByText('DIA 1 DE 365')).toBeVisible()
    await page.getByRole('button', { name: 'Ajustes', exact: true }).tap()
    await page.getByRole('button', { name: 'Editar rotina e perfil' }).tap()
    await page.getByRole('button', { name: 'Continuar' }).tap()
    await page.getByLabel('Acordo às', { exact: true }).fill('05:30')
    await page.getByRole('button', { name: 'Continuar' }).tap()
    await page.getByRole('button', { name: 'Salvar ajustes' }).tap()
    await expect(page.getByRole('button', { name: /Treino.*05:45/ })).toBeVisible()
  })
})

test('domingo não tem treino e vence com 6 refeições', async ({ page }) => {
  await abrirEm(page, new Date(2026, 10, 15, 10, 0, 0))
  await concluirAbertura(page)
  await expect(page.getByText('folga')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'LANCHE AO ACORDAR' })).toBeVisible()
  for (let i = 0; i < 6; i++) await feito(page).tap()
  await expect(page.getByText(/Dia vencido\./)).toBeVisible()
})
