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

export interface SessaoGravada { fim: number | null; series: { exercicio: string; valor: number }[] }

/** Sessão de treino de uma data, lida direto do banco do navegador. Quem vai recarregar espera por ela. */
export function sessaoGravada(page: Page, data: string): Promise<SessaoGravada | null> {
  return page.evaluate(
    (dia) =>
      new Promise<SessaoGravada | null>((resolver) => {
        const pedido = indexedDB.open('super-heroi-365')
        pedido.onsuccess = () => {
          const leitura = pedido.result.transaction('sessoes').objectStore('sessoes').get(dia)
          leitura.onsuccess = () => {
            resolver((leitura.result as SessaoGravada | undefined) ?? null)
            pedido.result.close()
          }
        }
      }),
    data,
  )
}

/** Grava a missão de treino como a etapa 3 fazia: marcada à mão, sem sessão. Precisa recarregar para a tela enxergar. */
export function marcarTreinoComoNaEtapa3(page: Page, data: string): Promise<void> {
  return page.evaluate(
    (dia) =>
      new Promise<void>((resolver) => {
        const pedido = indexedDB.open('super-heroi-365')
        pedido.onsuccess = () => {
          const tx = pedido.result.transaction('dias', 'readwrite')
          tx.objectStore('dias').put({ data: dia, feitas: ['treino'], copos: 0 })
          tx.oncomplete = () => {
            pedido.result.close()
            resolver()
          }
        }
      }),
    data,
  )
}

export const aba = (page: Page, nome: 'Hoje' | 'Cardápio' | 'Treino' | 'Evolução') => page.getByRole('navigation').getByRole('button', { name: nome })

/** Treino mínimo que conta como feito: uma série registrada e conclusão antes do fim. Termina na tela Treino. */
export async function treinoRapido(page: Page) {
  await aba(page, 'Treino').tap()
  await page.getByRole('button', { name: /COMEÇAR TREINO|CONTINUAR TREINO/ }).tap()
  await page.getByRole('button', { name: 'Registrar série' }).tap()
  await page.getByRole('button', { name: 'Pular descanso' }).tap()
  await page.getByRole('button', { name: 'Concluir treino antes do fim' }).tap()
  await page.getByRole('button', { name: 'Concluir agora' }).tap()
  await page.getByRole('heading', { name: 'TREINO CONCLUÍDO' }).waitFor()
}
