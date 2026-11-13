// Captura as telas da etapa 5 em 375 px, com algumas semanas de dados fictícios. Rodar com o app em http://localhost:5365 (npm run dev).
import { chromium } from '@playwright/test'

const URL = process.argv[2] ?? 'http://localhost:5365/'
const navegador = await chromium.launch()
const contexto = await navegador.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 })
const pagina = await contexto.newPage()
pagina.on('dialog', (d) => void d.accept())
await pagina.clock.install({ time: new Date(2026, 10, 9, 10, 0, 0) })
const foto = (nome, inteira = true) => pagina.screenshot({ path: `docs/capturas/${nome}.png`, fullPage: inteira })
const dia = 864e5

await pagina.goto(URL)
// valores fictícios: as capturas vão para o repositório público
await pagina.getByLabel('Peso de hoje (kg)').fill('60,5')
await pagina.getByLabel('Meta de peso (kg)').fill('70')
await pagina.getByLabel('Altura (cm)').fill('175')
await pagina.getByLabel('Idade').fill('30')
await pagina.getByRole('button', { name: 'Continuar' }).click()
await pagina.getByRole('button', { name: 'Continuar' }).click()
await pagina.getByRole('button', { name: 'Começar' }).click()
await pagina.getByText('DIA 1 DE 365').waitFor()
for (let i = 0; i < 4; i++) await pagina.getByRole('button', { name: 'FEITO' }).click()

await pagina.getByRole('button', { name: 'Evolução', exact: true }).click()
const pesos = [['2026-11-16', '61,0'], ['2026-11-23', '61,6'], ['2026-11-30', '61,9'], ['2026-12-07', '62,4'], ['2026-12-14', '62,8']]
await pagina.clock.fastForward(36 * dia)
await pagina.getByLabel('Data').waitFor()
for (const [data, kg] of pesos) {
  await pagina.getByLabel('Data').fill(data)
  await pagina.getByLabel('Peso (kg)').fill(kg)
  await pagina.getByRole('button', { name: /Salvar peso|Atualizar peso/ }).click()
  await pagina.getByText(/salvo\./).waitFor()
}
await foto('etapa5-peso')
await pagina.locator('.grafico').screenshot({ path: 'docs/capturas/etapa5-grafico.png' })

await pagina.getByRole('tab', { name: 'Medidas' }).click()
for (const [data, braco, peito, cintura] of [['2026-11-09', '30', '92', '80'], ['2026-12-14', '31,5', '94,5', '80,5']]) {
  await pagina.getByLabel('Data').fill(data)
  await pagina.getByLabel('Braço (cm)').fill(braco)
  await pagina.getByLabel('Peito (cm)').fill(peito)
  await pagina.getByLabel('Cintura (cm)').fill(cintura)
  await pagina.getByRole('button', { name: /Salvar medidas|Atualizar medidas/ }).click()
  await pagina.getByText(/salvas\./).waitFor()
}
await foto('etapa5-medidas')

await pagina.getByRole('tab', { name: 'Fotos' }).click()
const imagem = async (cor) => Buffer.from(await pagina.evaluate((c) => {
  const t = document.createElement('canvas')
  t.width = 300
  t.height = 400
  const g = t.getContext('2d')
  g.fillStyle = c
  g.fillRect(0, 0, 300, 400)
  g.fillStyle = '#e8b48a'
  g.beginPath()
  g.arc(150, 110, 45, 0, 7)
  g.fill()
  g.fillRect(95, 165, 110, 150)
  return t.toDataURL('image/png').split(',')[1]
}, cor), 'base64')
await pagina.locator('#foto-do-mes').setInputFiles({ name: 'mes2.png', mimeType: 'image/png', buffer: await imagem('#5d6d7e') })
await pagina.locator('.galeria-fotos figure').first().waitFor()
await foto('etapa5-fotos')

await pagina.getByRole('tab', { name: 'Herói' }).click()
await pagina.locator('article.atributo').first().waitFor()
await foto('etapa5-heroi')
await navegador.close()
console.log('capturas da etapa 5 salvas em docs/capturas')
