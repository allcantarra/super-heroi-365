// Gera os PNGs do app a partir de public/favicon.svg. Rodar: npm run icones
import { readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const svg = readFileSync('public/favicon.svg', 'utf8')
const alvos = [['pwa-192x192.png', 192], ['pwa-512x512.png', 512], ['apple-touch-icon.png', 180]]
const navegador = await chromium.launch()
for (const [arquivo, lado] of alvos) {
  const pagina = await navegador.newPage({ viewport: { width: lado, height: lado } })
  await pagina.setContent(`<style>html,body{margin:0}svg{display:block;width:${lado}px;height:${lado}px}</style>${svg}`)
  await pagina.screenshot({ path: `public/${arquivo}` })
  await pagina.close()
}
await navegador.close()
console.log('ícones gerados:', alvos.map((a) => a[0]).join(', '))
