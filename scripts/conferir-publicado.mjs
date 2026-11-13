// Confere o site publicado em 375 px: cadastro, uma missão, recarregar e offline. Uso: node scripts/conferir-publicado.mjs [url]
import { chromium } from '@playwright/test'

const URL = process.argv[2] ?? 'https://allcantarra.github.io/super-heroi-365/'
const navegador = await chromium.launch()
const contexto = await navegador.newContext({ viewport: { width: 375, height: 812 } })
const pagina = await contexto.newPage()
const erros = [], falhas = []
pagina.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
pagina.on('pageerror', (e) => erros.push(e.message))
pagina.on('response', (r) => r.status() >= 400 && falhas.push(`${r.status()} ${r.url()}`))

await pagina.goto(URL)
await pagina.getByLabel('Peso de hoje (kg)').fill('60,5')
await pagina.getByLabel('Meta de peso (kg)').fill('70')
await pagina.getByLabel('Altura (cm)').fill('175')
await pagina.getByLabel('Idade').fill('30')
await pagina.getByRole('button', { name: 'Continuar' }).click()
await pagina.getByRole('button', { name: 'Continuar' }).click()
await pagina.getByRole('button', { name: 'Começar' }).click()
await pagina.getByText('DIA 1 DE 365').waitFor()
await pagina.getByRole('button', { name: 'FEITO' }).click()
await pagina.getByText('40 XP', { exact: true }).waitFor()
await pagina.reload()
const xpAposRecarregar = await pagina.getByText('40 XP', { exact: true }).isVisible()
await pagina.evaluate(() => navigator.serviceWorker.ready)
await pagina.waitForFunction(() => navigator.serviceWorker.controller !== null)
await contexto.setOffline(true)
await pagina.reload()
const offline = await pagina.getByText('DIA 1 DE 365').isVisible()
await contexto.setOffline(false)
console.log(JSON.stringify({ url: URL, xpAposRecarregar, offline, erros, falhas }))
await navegador.close()
