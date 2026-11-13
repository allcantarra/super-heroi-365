import { expect, test, type Page } from '@playwright/test'
import { aba, abrirEm, concluirAbertura, sessaoGravada } from './apoio'

const HOJE = '2026-11-09'
const semEstouro = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
const titulo = (page: Page, nome: string) => page.getByRole('heading', { name: nome, level: 1, exact: true })
const comecarTreino = (page: Page) => page.getByRole('button', { name: 'COMEÇAR TREINO' })

test.beforeEach(async ({ page }) => {
  await abrirEm(page)
  await concluirAbertura(page)
  await aba(page, 'Treino').tap()
})

test('aquecimento guiado de 3 minutos antes da primeira série, com um movimento por vez', async ({ page }) => {
  await expect(page.getByText(/3 minutos de aquecimento guiado/)).toBeVisible()
  await comecarTreino(page).tap()
  const aquecimento = page.getByRole('dialog', { name: 'Aquecimento' })
  await expect(aquecimento).toBeVisible()
  await expect(aquecimento.locator('.roteiro-lista li')).toHaveCount(7)
  await expect(aquecimento.getByText('15 s cada lado')).toBeVisible()
  await semEstouro(page)

  await page.getByRole('button', { name: 'Começar', exact: true }).tap()
  await expect(titulo(page, 'Corrida no lugar leve')).toBeVisible()
  await expect(page.getByText('Movimento 1 de 8')).toBeVisible()
  await expect(page.getByText('A seguir: Giro de braços')).toBeVisible()
  await page.clock.fastForward(31_000)
  await expect(titulo(page, 'Giro de braços')).toBeVisible()
  // balanço de pernas: um lado, depois o outro
  await page.clock.fastForward(60_000)
  await expect(titulo(page, 'Balanço de pernas')).toBeVisible()
  await expect(page.locator('.exec-alvo')).toHaveText('primeiro lado')
  await page.clock.fastForward(15_000)
  await expect(page.locator('.exec-alvo')).toHaveText('outro lado')
  await semEstouro(page)
  await page.clock.fastForward(80_000)
  await expect(titulo(page, 'Pronto')).toBeVisible()
  await page.getByRole('button', { name: /Continuar/ }).tap()
  await expect(titulo(page, 'Flexão com as mãos no sofá')).toBeVisible()
})

test('passo a passo abre sozinho na primeira vez e mostra posição, execução, respiração, erros e variações', async ({ page }) => {
  await comecarTreino(page).tap()
  await page.getByRole('button', { name: 'Pular aquecimento' }).tap()
  const passo = page.locator('details.passo-a-passo')
  await expect(passo).toHaveAttribute('open', '')
  for (const parte of ['Posição inicial', 'Execução', 'Respiração', 'Erros comuns', 'Mais fácil', 'Mais difícil']) {
    await expect(passo.getByRole('heading', { name: parte, exact: true })).toBeVisible()
  }
  expect(await passo.locator('ol li').count()).toBeGreaterThanOrEqual(3)
  await semEstouro(page)
  await passo.locator('summary').tap()
  await expect(passo).not.toHaveAttribute('open', '')
  await expect(page.getByRole('button', { name: 'Registrar série' })).toBeVisible()
})

test('trocar exercício na hora: a ficha mostra o feito, a troca trava na primeira série e sobrevive a recarregar', async ({ page }) => {
  await comecarTreino(page).tap()
  await page.getByRole('button', { name: 'Pular aquecimento' }).tap()
  const trocar = page.getByLabel('Trocar exercício')
  await expect(trocar).toHaveValue('flexaoInclinada')
  const opcoes = await trocar.locator('option').allTextContents()
  expect(opcoes[0]).toBe('Flexão com as mãos no sofá (da ficha)')
  expect(opcoes.length).toBeGreaterThan(1)
  // nenhum exercício que já está no treino de hoje aparece como opção
  for (const ocupado of ['Flexão pike', 'Mergulho na cadeira', 'Prancha com toque no ombro']) expect(opcoes).not.toContain(ocupado)

  const nova = opcoes[1]
  await trocar.selectOption({ label: nova })
  await expect(titulo(page, nova)).toBeVisible()
  await expect(page.getByText('No lugar de Flexão com as mãos no sofá')).toBeVisible()
  await expect(page.getByText('2 séries de 6 a 8 repetições')).toBeVisible()
  await semEstouro(page)

  // voltar para o original desfaz; trocar de novo e registrar trava a troca
  await trocar.selectOption({ label: 'Flexão com as mãos no sofá (da ficha)' })
  await expect(titulo(page, 'Flexão com as mãos no sofá')).toBeVisible()
  await expect(page.getByText(/No lugar de/)).toHaveCount(0)
  await trocar.selectOption({ label: nova })
  await page.getByRole('button', { name: 'Registrar série' }).tap()
  await expect(page.getByLabel('Trocar exercício')).toHaveCount(0)
  await expect.poll(async () => (await sessaoGravada(page, HOJE))?.series.length).toBe(1)
  const gravada = (await sessaoGravada(page, HOJE)) as unknown as { trocas?: Record<string, string>; series: { exercicio: string }[] }
  expect(Object.keys(gravada.trocas ?? {})).toEqual(['flexaoInclinada'])
  expect(gravada.series[0].exercicio).toBe(gravada.trocas!.flexaoInclinada)

  await page.reload()
  await aba(page, 'Treino').tap()
  await expect(page.locator('.treino-lista li').first()).toContainText(nova)
  await expect(page.locator('.treino-lista li').first()).toContainText('no lugar de Flexão com as mãos no sofá')
  await page.getByRole('button', { name: 'CONTINUAR TREINO' }).tap()
  await expect(titulo(page, nova)).toBeVisible()
  await expect(page.getByText('Série 2 de 2', { exact: true })).toBeVisible()
})

test('ao concluir, o alongamento guiado abre sozinho e pode ser refeito depois', async ({ page }) => {
  await comecarTreino(page).tap()
  await page.getByRole('button', { name: 'Pular aquecimento' }).tap()
  await page.getByRole('button', { name: 'Registrar série' }).tap()
  await page.getByRole('button', { name: 'Pular descanso' }).tap()
  await page.getByRole('button', { name: 'Concluir treino antes do fim' }).tap()
  await page.getByRole('button', { name: 'Concluir agora' }).tap()

  const alongamento = page.getByRole('dialog', { name: 'Alongamento' })
  await expect(alongamento).toBeVisible()
  await expect(alongamento.locator('.roteiro-lista li')).toHaveCount(6)
  await semEstouro(page)
  await page.getByRole('button', { name: 'Começar', exact: true }).tap()
  await expect(titulo(page, 'Alongamento de peitoral na parede')).toBeVisible()
  await page.clock.fastForward(181_000)
  await expect(titulo(page, 'Pronto')).toBeVisible()
  await page.getByRole('button', { name: /Continuar/ }).tap()
  await expect(alongamento).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'TREINO CONCLUÍDO' })).toBeVisible()

  await page.getByRole('button', { name: 'Alongar 3 minutos' }).tap()
  await expect(alongamento).toBeVisible()
  await page.getByRole('button', { name: 'Fechar alongamento' }).tap()
  await expect(alongamento).toHaveCount(0)
})
