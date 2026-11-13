// Captura as telas da etapa 6 em 375 px, com dados fictícios. Rodar com o app em http://localhost:5365 (npm run dev).
import { chromium } from '@playwright/test'

const URL = process.argv[2] ?? 'http://localhost:5365/'
const navegador = await chromium.launch()
const contexto = await navegador.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 })
const pagina = await contexto.newPage()
await pagina.clock.install({ time: new Date(2026, 10, 9, 10, 0, 0) })
const foto = (nome, inteira = true) => pagina.screenshot({ path: `docs/capturas/${nome}.png`, fullPage: inteira })

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

// uma semana de domingos a domingos não dá; avança até o domingo e vence o dia com as refeições
await pagina.clock.fastForward(6 * 864e5)
await pagina.getByText('DIA 7 DE 365').waitFor()
for (let i = 0; i < 6; i++) await pagina.getByRole('button', { name: 'FEITO' }).click()
for (let i = 0; i < 12; i++) await pagina.getByRole('button', { name: /UM COPO|META BATIDA/ }).first().click().catch(() => {})
await pagina.waitForTimeout(900)
await pagina.getByLabel('Chefão da fase').scrollIntoViewIfNeeded()
await foto('etapa6-hoje-chefao', false)

await pagina.getByRole('button', { name: 'Evolução', exact: true }).click()
await pagina.getByRole('tab', { name: 'Herói' }).click()
await pagina.locator('.conquistas').scrollIntoViewIfNeeded()
await foto('etapa6-heroi-conquistas-gibi')

await pagina.getByRole('button', { name: 'Hoje', exact: true }).click()
await pagina.getByRole('button', { name: 'Ajustes', exact: true }).click()
await pagina.getByRole('heading', { name: 'Ajustes', level: 1 }).waitFor()
await foto('etapa6-ajustes')
await navegador.close()
console.log('capturas da etapa 6 salvas em docs/capturas')
