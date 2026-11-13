import { readFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'
import { abrirEm, concluirAbertura, perfilGravado } from './apoio'

const semEstouro = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
const abrirAjustes = (page: Page) => page.getByRole('button', { name: 'Ajustes', exact: true }).tap()

test.beforeEach(async ({ page }) => {
  await abrirEm(page) // segunda, 09/11/2026: dia 1
  await concluirAbertura(page)
})

test('chefão e vilão da semana na tela Hoje reagem às missões', async ({ page }) => {
  const chefao = page.getByLabel('Chefão da fase')
  await expect(chefao).toContainText('A PREGUIÇA')
  await expect(chefao).toContainText('Vida 100%')
  await page.getByRole('button', { name: /Café reforçado/ }).tap()
  await expect(chefao).toContainText('Vida 99%')
  const desafio = page.getByLabel('Vilão da semana')
  await expect(desafio).toContainText('O Desidratado')
  await expect(desafio).toContainText('0/5 Bater a meta de água em 5 dias')
  for (let i = 0; i < 12; i++) await page.getByRole('button', { name: /UM COPO/ }).tap()
  await expect(desafio).toContainText('1/5')
  await semEstouro(page)
})

test('lembretes: gera o .ics só com as missões escolhidas', async ({ page }) => {
  await abrirAjustes(page)
  await expect(page.getByRole('heading', { name: 'Ajustes', level: 1 })).toBeVisible()
  await semEstouro(page)
  await page.getByLabel(/Ceia líquida/).uncheck()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Gerar lembretes' }).tap()
  const arquivo = await download
  expect(arquivo.suggestedFilename()).toBe('super-heroi-365-lembretes.ics')
  const ics = await readFile(await arquivo.path(), 'utf8')
  expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(8)
  expect(ics).not.toContain('SUMMARY:Ceia')
  expect(ics).toContain('SUMMARY:Treino')
  await expect(page.getByText(/Abra no Calendário/)).toBeVisible()
})

test('backup: exporta, recusa arquivo errado, pede confirmação e restaura substituindo tudo', async ({ page }) => {
  await page.getByRole('button', { name: /Café reforçado/ }).tap()
  await abrirAjustes(page)
  await expect(page.getByText('Nenhum backup feito neste aparelho.')).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Fazer backup agora' }).tap()
  const arquivo = await download
  expect(arquivo.suggestedFilename()).toBe('super-heroi-365-backup-2026-11-09.json')
  const caminho = await arquivo.path()
  const conteudo = JSON.parse(await readFile(caminho, 'utf8'))
  expect(conteudo.app).toBe('super-heroi-365')
  expect(conteudo.dias[0].feitas).toContain('cafe')
  await expect(page.getByText('Último backup: 09/11 (hoje).')).toBeVisible()

  // depois do backup, marca outra missão: ela deve sumir ao restaurar
  await page.getByRole('button', { name: 'Voltar para o dia' }).tap()
  await page.getByRole('button', { name: /Almoço/ }).tap()
  await abrirAjustes(page)

  await page.locator('#arquivo-backup').setInputFiles({ name: 'nada.json', mimeType: 'application/json', buffer: Buffer.from('{"app":"outro"}') })
  await expect(page.getByText('Esse arquivo não é um backup do Super-Herói 365.')).toBeVisible()

  await page.locator('#arquivo-backup').setInputFiles(caminho)
  const confirmar = page.getByRole('alertdialog', { name: 'Substituir tudo neste aparelho?' })
  await expect(confirmar).toContainText('1 dia, 0 treinos, 0 pesagens, 0 medidas, 0 fotos')
  await confirmar.getByRole('button', { name: 'Cancelar' }).tap()
  await expect(confirmar).toHaveCount(0)

  await page.locator('#arquivo-backup').setInputFiles(caminho)
  await page.getByRole('button', { name: 'Substituir tudo' }).tap()
  await expect(page.getByText(/Backup restaurado: 1 dia/)).toBeVisible()
  await page.getByRole('button', { name: 'Voltar para o dia' }).tap()
  await expect(page.getByRole('button', { name: /Café reforçado/ })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: /Almoço/ })).toHaveAttribute('aria-pressed', 'false')
  expect((await perfilGravado(page)).trocas).toEqual({})
})

test('a tela Hoje lembra do backup depois de duas semanas sem', async ({ page }) => {
  await expect(page.getByText(/Você ainda não fez backup/)).toHaveCount(0)
  await page.clock.fastForward(15 * 864e5)
  await expect(page.getByText(/Você ainda não fez backup/)).toBeVisible()
  await page.getByRole('button', { name: 'Fazer backup' }).tap()
  await expect(page.getByRole('heading', { name: 'Ajustes', level: 1 })).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Fazer backup agora' }).tap()
  await download
  await page.getByRole('button', { name: 'Voltar para o dia' }).tap()
  await expect(page.getByText(/Você ainda não fez backup/)).toHaveCount(0)
})

test('editar rotina pelos ajustes continua funcionando', async ({ page }) => {
  await abrirAjustes(page)
  await page.getByRole('button', { name: 'Editar rotina, perfil e herói' }).tap()
  await expect(page.getByLabel('Peso de hoje (kg)')).toHaveValue('60,5')
  await page.getByRole('button', { name: 'Cancelar' }).tap()
  await expect(page.getByText('DIA 1 DE 365')).toBeVisible()
})

test('conquistas e gibi na aba Herói', async ({ page }) => {
  await page.getByRole('button', { name: /Café reforçado/ }).tap()
  await page.getByRole('button', { name: 'Evolução', exact: true }).tap()
  await page.getByRole('tab', { name: 'Herói' }).tap()
  await expect(page.getByText(/^1 de \d+ desbloqueadas\.$/)).toBeVisible()
  await expect(page.locator('.conquistas li.feita')).toHaveText(/Primeiro passo/)
  await expect(page.locator('.capitulo-gibi')).toHaveCount(1)
  await expect(page.locator('.capitulo-gibi')).toContainText('PROTOCOLO DE CHOQUE')
  await expect(page.locator('.capitulo-gibi')).toContainText('0 de 30 dias vencidos')
  await semEstouro(page)
  // vencer o dia cria o primeiro quadro
  // domingo (dia 7) não tem treino: 6 refeições vencem o dia
  await page.clock.fastForward(6 * 864e5)
  await page.getByRole('button', { name: 'Hoje', exact: true }).tap()
  await expect(page.getByText('DIA 7 DE 365')).toBeVisible()
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'FEITO' }).tap()
  await page.getByRole('button', { name: 'Evolução', exact: true }).tap()
  await page.getByRole('tab', { name: 'Herói' }).tap()
  await expect(page.locator('.capitulo-gibi')).toContainText('1 de 30 dias vencidos')
  await expect(page.locator('.quadros li')).toHaveText(['DIA 715/11Folga e 6 refeições'])
})
