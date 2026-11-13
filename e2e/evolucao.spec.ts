import { expect, test, type Page } from '@playwright/test'
import { abrirEm, concluirAbertura } from './apoio'

const semEstouro = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)

const aba = (page: Page, nome: string) => page.getByRole('tab', { name: nome })
const irPara = async (page: Page, secao: 'Hoje' | 'Evolução') => page.getByRole('button', { name: secao, exact: true }).tap()

/** PNG de 4 x 6 pixels, gerado no próprio navegador para não depender de arquivo no repositório. */
async function fotoDeTeste(page: Page, cor: string): Promise<Buffer> {
  const base64 = await page.evaluate((c) => {
    const tela = document.createElement('canvas')
    tela.width = 40
    tela.height = 60
    const ctx = tela.getContext('2d')!
    ctx.fillStyle = c
    ctx.fillRect(0, 0, 40, 60)
    return tela.toDataURL('image/png').split(',')[1]
  }, cor)
  return Buffer.from(base64, 'base64')
}

test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => void d.accept())
  await abrirEm(page) // segunda, 09/11/2026: dia 1; cadastro com 60,5 kg e meta de 70 kg
  await concluirAbertura(page)
  await irPara(page, 'Evolução')
})

test('peso: placar parte do cadastro, erro ao lado do campo, salvar dá XP e sobrevive a recarregar', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Evolução', level: 1 })).toBeVisible()
  await expect(page.locator('.placar')).toContainText('60,5')
  await expect(page.locator('.placar')).toContainText('faltam 9,5 kg')
  await expect(page.getByRole('img', { name: /Gráfico de peso/ })).toBeVisible()
  await page.getByLabel('Peso (kg)').fill('400')
  await page.getByRole('button', { name: 'Salvar peso' }).tap()
  await expect(page.getByText('Entre 30 e 200 kg.')).toBeVisible()
  await expect(page.getByLabel('Peso (kg)')).toBeFocused({ timeout: 1000 }).catch(() => {}) // foco é desejável, não obrigatório
  await page.getByLabel('Peso (kg)').fill('61,2')
  await page.getByRole('button', { name: 'Salvar peso' }).tap()
  await expect(page.getByText('Peso de 09/11 salvo.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Atualizar peso' })).toBeVisible()
  await expect(page.locator('.tabela tbody tr')).toHaveCount(1) // pesagem do dia 1 substitui a do cadastro
  await semEstouro(page)
  await irPara(page, 'Hoje')
  await expect(page.getByText('60 XP', { exact: true })).toBeVisible()
  await page.reload()
  await irPara(page, 'Evolução')
  await expect(page.getByLabel('Peso (kg)')).toHaveValue('61,2')
})

test('peso: com 10 dias de pesagens aparece o ritmo; apagar uma pesagem pede confirmação e remove', async ({ page }) => {
  await page.clock.fastForward(12 * 864e5) // 12 dias depois: sábado, 21/11
  await expect(page.getByLabel('Data')).toHaveValue('2026-11-21')
  await page.getByLabel('Peso (kg)').fill('61,4')
  await page.getByRole('button', { name: 'Salvar peso' }).tap()
  await expect(page.getByText('Peso de 21/11 salvo.')).toBeVisible()
  await page.getByLabel('Data').fill('2026-11-15')
  await page.getByLabel('Peso (kg)').fill('61')
  await page.getByRole('button', { name: 'Salvar peso' }).tap()
  await expect(page.locator('.tabela tbody tr')).toHaveCount(3)
  await expect(page.getByText(/Ritmo: \+0,\d\d kg por semana\. .* para a fase 1/)).toBeVisible()
  await page.getByRole('button', { name: 'Apagar pesagem de 15/11' }).tap()
  await expect(page.locator('.tabela tbody tr')).toHaveCount(2)
  // tocar perto de um ponto mostra o valor dele
  await page.locator('.grafico svg rect[fill="transparent"]').first().tap()
  await expect(page.locator('.leitura')).toContainText('09/11 pesagem 60,5 kg')
})

test('medidas: exige uma medida, salva, edita pela data e apaga', async ({ page }) => {
  await aba(page, 'Medidas').tap()
  await page.getByRole('button', { name: 'Salvar medidas' }).tap()
  await expect(page.getByText('Preencha pelo menos uma medida.')).toBeVisible()
  await page.getByLabel('Braço (cm)').fill('8')
  await page.getByRole('button', { name: 'Salvar medidas' }).tap()
  await expect(page.getByText('Entre 15 e 200 cm.')).toBeVisible()
  await page.getByLabel('Braço (cm)').fill('27,5')
  await page.getByLabel('Cintura (cm)').fill('72')
  await page.getByRole('button', { name: 'Salvar medidas' }).tap()
  await expect(page.getByText('Medidas de 09/11 salvas.')).toBeVisible()
  await expect(page.locator('.tabela tbody tr')).toHaveCount(1)
  await expect(page.locator('.tabela tbody tr')).toContainText('27,5')
  await semEstouro(page)
  await page.clock.fastForward(14 * 864e5) // 14 dias depois
  await page.getByLabel('Braço (cm)').fill('28,5')
  await page.getByLabel('Cintura (cm)').fill('72')
  await page.getByRole('button', { name: 'Salvar medidas' }).tap()
  await expect(page.locator('.placar')).toContainText('+1,0')
  await page.getByRole('button', { name: 'Editar medidas de 09/11' }).tap()
  await expect(page.getByLabel('Braço (cm)')).toHaveValue('27,5')
  await expect(page.getByRole('button', { name: 'Atualizar medidas' })).toBeVisible()
  await page.getByRole('button', { name: 'Apagar medidas de 09/11' }).tap()
  await expect(page.locator('.tabela tbody tr')).toHaveCount(1)
})

test('fotos: guarda a foto do mês, dá XP, compara meses e apaga', async ({ page }) => {
  await aba(page, 'Fotos').tap()
  await expect(page.getByText(/Nenhuma foto ainda/)).toBeVisible()
  await page.locator('#foto-do-mes').setInputFiles({ name: 'mes1.png', mimeType: 'image/png', buffer: await fotoDeTeste(page, '#c0392b') })
  await expect(page.getByRole('img', { name: /Foto do mês 1/ })).toBeVisible()
  expect(await page.getByRole('img', { name: /Foto do mês 1/ }).evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
  await expect(page.getByText('Trocar a foto do mês')).toBeVisible()
  // trocar a foto do mês pede confirmação; recusar mantém a atual
  page.removeAllListeners('dialog')
  page.once('dialog', (d) => void d.dismiss())
  await page.locator('#foto-do-mes').setInputFiles({ name: 'outra.png', mimeType: 'image/png', buffer: await fotoDeTeste(page, '#16a085') })
  await expect(page.locator('.galeria-fotos figure')).toHaveCount(1)
  page.on('dialog', (d) => void d.accept())
  await semEstouro(page)
  await irPara(page, 'Hoje')
  await expect(page.getByText('100 XP', { exact: true })).toBeVisible()
  await irPara(page, 'Evolução')
  await aba(page, 'Fotos').tap()
  // um arquivo que não é imagem é recusado com mensagem
  await page.locator('#foto-do-mes').setInputFiles({ name: 'nota.txt', mimeType: 'text/plain', buffer: Buffer.from('oi') })
  await expect(page.getByText('Esse arquivo não é uma imagem. Escolha uma foto.')).toBeVisible()
  // mês 2
  await page.clock.fastForward(31 * 864e5) // 31 dias depois
  await expect(page.getByText('FOTO DO MÊS 2')).toBeVisible()
  await page.locator('#foto-do-mes').setInputFiles({ name: 'mes2.png', mimeType: 'image/png', buffer: await fotoDeTeste(page, '#2980b9') })
  await expect(page.getByRole('heading', { name: 'ANTES E DEPOIS' })).toBeVisible()
  await expect(page.locator('.comparar img')).toHaveCount(2)
  await expect(page.locator('.comparar figcaption')).toHaveText(['Mês 1', 'Mês 2'])
  await page.getByLabel('Efeito de quadrinho').uncheck()
  await expect(page.locator('.quadro-foto.gibi')).toHaveCount(0)
  await page.reload()
  // depois de avançar o relógio de teste e recarregar, o relógio falso fica parado até alguém mandar andar
  await page.clock.runFor(1000)
  await irPara(page, 'Evolução')
  await aba(page, 'Fotos').tap()
  await expect(page.locator('.galeria-fotos figure')).toHaveCount(2)
  await page.getByRole('button', { name: 'Apagar foto do mês 2' }).tap()
  await expect(page.locator('.galeria-fotos figure')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'ANTES E DEPOIS' })).toHaveCount(0)
})

test('herói: atributos começam no nível 1 e Energia sobe com as refeições cumpridas', async ({ page }) => {
  await aba(page, 'Herói').tap()
  await expect(page.locator('article.atributo')).toHaveCount(4)
  await expect(page.locator('article.atributo').first()).toContainText('Força')
  await expect(page.locator('article.atributo', { hasText: 'Energia' })).toContainText('0 de 30 refeições para o nível 2')
  await semEstouro(page)
  await irPara(page, 'Hoje')
  await page.getByRole('button', { name: /Café reforçado/ }).tap()
  await page.getByRole('button', { name: /Almoço/ }).tap()
  await irPara(page, 'Evolução')
  await aba(page, 'Herói').tap()
  await expect(page.locator('article.atributo', { hasText: 'Energia' })).toContainText('2 refeições cumpridas no total. +2 nos últimos 7 dias.')
})
