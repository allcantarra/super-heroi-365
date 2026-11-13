import type { Page } from '@playwright/test'

/** Segunda-feira, 9 de novembro de 2026, 10h. Dia de treino, antes do corte da cafeína. */
export const SEGUNDA_10H = new Date(2026, 10, 9, 10, 0, 0)

export async function abrirEm(page: Page, quando: Date = SEGUNDA_10H) {
  await page.clock.install({ time: quando })
  await page.goto('/')
}

/** Passa pela primeira abertura com dados fictícios e a rotina padrão. */
export async function concluirAbertura(page: Page) {
  await page.getByLabel('Peso de hoje (kg)').fill('60,5')
  await page.getByLabel('Meta de peso (kg)').fill('70')
  await page.getByLabel('Altura (cm)').fill('175')
  await page.getByLabel('Idade').fill('30')
  await page.getByRole('button', { name: 'Continuar' }).tap()
  await page.getByRole('button', { name: 'Continuar' }).tap()
  await page.getByRole('button', { name: 'Começar' }).tap()
  // só segue quando o perfil foi gravado e a tela Hoje apareceu; recarregar antes disso perde o cadastro
  await page.getByText('DIA 1 DE 365').waitFor()
}

/** Lê o perfil direto do banco do navegador. A tela responde antes de a gravação terminar; quem vai recarregar precisa esperar o banco. */
export function perfilGravado(page: Page): Promise<{ trocas?: Record<string, string>; comprados?: string[] }> {
  return page.evaluate(
    () =>
      new Promise((resolver) => {
        const pedido = indexedDB.open('super-heroi-365')
        pedido.onsuccess = () => {
          const leitura = pedido.result.transaction('perfil').objectStore('perfil').get('eu')
          leitura.onsuccess = () => {
            resolver(leitura.result ?? {})
            pedido.result.close()
          }
        }
      }),
  )
}
