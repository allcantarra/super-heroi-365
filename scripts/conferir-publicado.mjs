// Confere o site publicado em 375 px: cadastro, missão, cardápio por data, semana, recarregar e offline.
// Uso: node scripts/conferir-publicado.mjs [url]
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

await pagina.getByRole('button', { name: 'Cardápio' }).click()
await pagina.locator('details.refeicao').first().waitFor()
const refeicoes = await pagina.locator('details.refeicao').count()
await pagina.getByRole('button', { name: 'Próximo dia' }).click()
const dia2 = await pagina.getByText('Dia 2 de 365').waitFor({ timeout: 10000 }).then(() => true, () => false)
await pagina.getByRole('tab', { name: 'Semana' }).click()
await pagina.locator('article.marmita').first().waitFor()
const marmitas = await pagina.locator('article.marmita').count()
await pagina.getByRole('tab', { name: 'Compras' }).click()
await pagina.locator('.compra').first().waitFor()
const itensDeCompra = await pagina.locator('.compra').count()

// Treino: começa, registra uma série (ou cronometra) e confere que a sessão sobrevive a recarregar.
// Usa o relógio real: em domingo não há treino, e o resultado fica como 'folga'.
await pagina.getByRole('button', { name: 'Treino', exact: true }).click()
const comecar = pagina.getByRole('button', { name: /COMEÇAR TREINO|CONTINUAR TREINO/ })
let treino = 'folga'
if (await comecar.waitFor({ timeout: 5000 }).then(() => true, () => false)) {
  await comecar.click()
  const registrar = pagina.getByRole('button', { name: 'Registrar série' })
  if (await registrar.waitFor({ timeout: 5000 }).then(() => true, () => false)) {
    await registrar.click()
    await pagina.getByRole('button', { name: 'Pular descanso' }).waitFor()
  } else {
    await pagina.getByRole('button', { name: /Cronometrar/ }).click()
    await pagina.getByRole('button', { name: 'Parar e anotar' }).click()
  }
  await pagina.reload()
  await pagina.getByRole('button', { name: 'Treino', exact: true }).click()
  treino = await pagina.getByRole('button', { name: /CONTINUAR TREINO/ }).waitFor({ timeout: 10000 }).then(() => 'série gravada', () => 'série perdida')
}

await pagina.getByRole('button', { name: 'Hoje', exact: true }).click()
await pagina.reload()
const xpAposRecarregar = await pagina.getByText('40 XP', { exact: true }).waitFor({ timeout: 10000 }).then(() => true, () => false)
await pagina.evaluate(() => navigator.serviceWorker.ready)
await pagina.waitForFunction(() => navigator.serviceWorker.controller !== null)
await contexto.setOffline(true)
await pagina.reload()
const offline = await pagina.getByText('DIA 1 DE 365').waitFor({ timeout: 10000 }).then(() => true, () => false)
await contexto.setOffline(false)
console.log(JSON.stringify({ url: URL, refeicoes, dia2, marmitas, itensDeCompra, treino, xpAposRecarregar, offline, erros, falhas }))
await navegador.close()
