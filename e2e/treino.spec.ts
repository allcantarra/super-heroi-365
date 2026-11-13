import { expect, test, type Page } from '@playwright/test'
import { aba, abrirEm, concluirAbertura, entrarNoTreino, marcarTreinoComoNaEtapa3, pularAlongamento, sessaoGravada, treinoRapido } from './apoio'

const HOJE = '2026-11-09'

const semEstouro = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)

const registrar = (page: Page) => page.getByRole('button', { name: 'Registrar série' })
const pular = (page: Page) => page.getByRole('button', { name: 'Pular descanso' })
const relogio = (page: Page) => page.locator('.exec-relogio')
const valor = (page: Page) => page.locator('.exec-passo output b')
const titulo = (page: Page, nome: string) => page.getByRole('heading', { name: nome, level: 1, exact: true })
const missaoTreino = (page: Page) => page.getByRole('button', { name: /Treino.*06:15/ })

/** Conta os pedidos de tela acesa, já que o navegador de teste não tem tela para apagar. */
async function contarTravasDeTela(page: Page) {
  await page.addInitScript(() => {
    const janela = window as unknown as { travas: number }
    janela.travas = 0
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: { request: async () => (janela.travas++, { release: async () => {}, addEventListener: () => {} }) },
    })
  })
}

test.describe('treino', () => {
  test.beforeEach(async ({ page }) => {
    await contarTravasDeTela(page)
    await abrirEm(page)
    await concluirAbertura(page)
    await aba(page, 'Treino').tap()
  })

  test('treino inteiro: séries, descanso, cronômetro, conclusão, missão cumprida e recarregar', async ({ page }) => {
    const erros: string[] = []
    page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
    page.on('pageerror', (e) => erros.push(e.message))

    await expect(page.getByText('Protocolo de Choque, semana 1 de 4')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'EMPURRAR' })).toBeVisible()
    await expect(page.getByText(/5 exercícios, cerca de \d+ minutos/)).toBeVisible()
    await expect(page.getByText(/Nenhum recorde ainda\./)).toBeVisible()
    await semEstouro(page)
    await entrarNoTreino(page)

    // primeiro exercício: descrição, alvo e sugestão no piso do alvo
    await expect(titulo(page, 'Flexão com as mãos no sofá')).toBeVisible()
    await expect(page.getByText('2 séries de 6 a 8 repetições')).toBeVisible()
    await expect(page.locator('.exec-como')).toContainText('Desça o peito em 3 segundos')
    await expect(page.getByText(/Primeira vez neste exercício\./)).toBeVisible()
    await expect(page.getByText('Exercício 1 de 5')).toBeVisible()
    await expect(page.getByText('Tela acesa')).toBeAttached()
    expect(await page.evaluate(() => (window as unknown as { travas: number }).travas)).toBeGreaterThan(0)
    await expect(valor(page)).toHaveText('6')
    await semEstouro(page)

    // registra 8 repetições: o descanso de 60 s começa sozinho
    await page.getByRole('button', { name: 'Mais 1' }).tap()
    await page.getByRole('button', { name: 'Mais 1' }).tap()
    await registrar(page).tap()
    await expect(page.getByText('A seguir: série 2 de 2')).toBeVisible()
    await expect(relogio(page)).toHaveText(/^(1:00|0:5\d)$/)
    await expect(page.locator('.exec-series li').first()).toContainText('8 rep')
    await semEstouro(page)

    // somar e tirar 15 s, e deixar o descanso acabar sozinho
    await page.getByRole('button', { name: 'Somar 15 segundos ao descanso' }).tap()
    await expect(relogio(page)).toHaveText(/^1:(0\d|1[0-5])$/)
    await page.getByRole('button', { name: 'Tirar 15 segundos do descanso' }).tap()
    await page.getByRole('button', { name: 'Tirar 15 segundos do descanso' }).tap()
    await expect(relogio(page)).toHaveText(/^0:(3\d|4[0-5])$/)
    await page.clock.fastForward(46_000)
    await expect(relogio(page)).toBeHidden()
    await expect(page.getByText('Série 2 de 2: vai!')).toBeVisible()

    // segunda série fecha o exercício: a tela já mostra o próximo durante o descanso
    await expect(valor(page)).toHaveText('6')
    await registrar(page).tap()
    await expect(titulo(page, 'Flexão pike')).toBeVisible()
    await expect(page.getByText('A seguir: Flexão pike')).toBeVisible()
    await pular(page).tap()

    // pike, mergulho e toque no ombro: 2 séries cada
    for (const nome of ['Flexão pike', 'Mergulho na cadeira', 'Prancha com toque no ombro']) {
      await expect(titulo(page, nome)).toBeVisible()
      for (let serie = 0; serie < 2; serie++) {
        await registrar(page).tap()
        await pular(page).tap()
      }
    }

    // prancha é por tempo: o cronômetro mede e anota
    await expect(titulo(page, 'Prancha')).toBeVisible()
    await expect(page.getByText('2 séries de 15 a 20 segundos')).toBeVisible()
    await page.getByRole('button', { name: /Cronometrar/ }).tap()
    // 5 segundos para se posicionar antes de a contagem valer
    await expect(page.getByText('Prepare-se')).toBeVisible()
    await page.clock.fastForward(23_000)
    await expect(relogio(page)).toHaveText(/^0:(1[89]|2\d)$/)
    await page.getByRole('button', { name: 'Parar e anotar' }).tap()
    await expect(valor(page)).toHaveText(/^(1[89]|2\d)$/)
    await registrar(page).tap()
    await pular(page).tap()

    // a última série conclui o treino sozinha
    await registrar(page).tap()
    await expect(page.getByRole('heading', { name: 'TREINO CONCLUÍDO' })).toBeVisible()
    await expect(page.locator('.pow')).toContainText('+120 XP')
    await expect(page.locator('.treino-numeros')).toContainText('10 de 10')
    await expect(page.locator('.treino-recordes li')).toHaveCount(5)
    await semEstouro(page)
    await pularAlongamento(page)

    // a missão de treino da tela Hoje está cumprida
    await page.getByRole('button', { name: 'VER MEU DIA' }).tap()
    await expect(missaoTreino(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText('1/1')).toBeVisible()
    await expect(page.getByText('120 XP', { exact: true })).toBeVisible()

    // e continua cumprida depois de recarregar
    await expect.poll(async () => (await sessaoGravada(page, HOJE))?.fim ?? null).not.toBeNull()
    expect((await sessaoGravada(page, HOJE))!.series).toHaveLength(10)
    await page.reload()
    await expect(missaoTreino(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText('120 XP', { exact: true })).toBeVisible()
    await aba(page, 'Treino').tap()
    await expect(page.getByRole('heading', { name: 'TREINO CONCLUÍDO' })).toBeVisible()
    await expect(page.locator('.treino-semana li').first()).toContainText('Feito')
    expect(erros).toEqual([])
  })

  test('o descanso continua certo depois de o app passar um tempo em segundo plano', async ({ page }) => {
    await entrarNoTreino(page)
    await registrar(page).tap()
    await expect(relogio(page)).toBeVisible()
    // congela o relógio da página, como o iPhone faz com o app em segundo plano
    const agora = await page.evaluate(() => Date.now())
    await page.clock.pauseAt(agora + 5_000)
    const [, segundosAntes] = (await relogio(page).textContent())!.split(':').map(Number)
    // 30 segundos passam sem nenhum temporizador rodar; ao voltar, a conta é pelo instante final
    await page.clock.setSystemTime(agora + 35_000)
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await expect(relogio(page)).toHaveText(`0:${String(segundosAntes - 30).padStart(2, '0')}`)
    // e se o descanso inteiro passou em segundo plano, a volta já encontra a série liberada
    await page.clock.setSystemTime(agora + 600_000)
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await expect(relogio(page)).toBeHidden()
    await expect(registrar(page)).toBeVisible()
  })

  test('sair no meio guarda as séries; recarregar e continuar retoma do ponto certo; desfazer apaga', async ({ page }) => {
    await entrarNoTreino(page)
    await registrar(page).tap()
    await pular(page).tap()
    await page.getByRole('button', { name: 'Sair do treino sem concluir' }).tap()
    await expect(page.getByText('1 série registrada até agora.')).toBeVisible()
    await expect.poll(async () => (await sessaoGravada(page, HOJE))?.series.length).toBe(1)
    await page.reload()

    // em andamento não cumpre a missão
    await aba(page, 'Hoje').tap()
    await expect(missaoTreino(page)).toHaveAttribute('aria-pressed', 'false')
    await missaoTreino(page).tap()
    await entrarNoTreino(page)
    await expect(titulo(page, 'Flexão com as mãos no sofá')).toBeVisible()
    await expect(page.getByText('Série 2 de 2', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Desfazer a última série' }).tap()
    await expect(page.getByText('Série 1 de 2', { exact: true })).toBeVisible()
    await expect.poll(async () => (await sessaoGravada(page, HOJE))?.series.length).toBe(0)

    // pular exercício e voltar
    await page.getByRole('button', { name: 'Pular', exact: true }).tap()
    await expect(titulo(page, 'Flexão pike')).toBeVisible()
    await page.getByRole('button', { name: 'Anterior' }).tap()
    await expect(titulo(page, 'Flexão com as mãos no sofá')).toBeVisible()
  })

  test('concluir antes do fim pede confirmação; reabrir desfaz a missão e o XP', async ({ page }) => {
    await entrarNoTreino(page)
    await expect(page.getByRole('button', { name: 'Concluir treino antes do fim' })).toHaveCount(0)
    await registrar(page).tap()
    await pular(page).tap()
    await page.getByRole('button', { name: 'Concluir treino antes do fim' }).tap()
    await expect(page.getByText(/Faltam 9 séries da ficha\./)).toBeVisible()
    await page.getByRole('button', { name: 'Continuar treinando' }).tap()
    await page.getByRole('button', { name: 'Concluir treino antes do fim' }).tap()
    await page.getByRole('button', { name: 'Concluir agora' }).tap()
    await expect(page.getByRole('heading', { name: 'TREINO CONCLUÍDO' })).toBeVisible()
    await pularAlongamento(page)
    await expect(page.locator('.treino-numeros')).toContainText('1 de 10')

    await page.getByRole('button', { name: 'Reabrir treino' }).tap()
    await expect(page.getByText('Série 2 de 2', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Sair do treino sem concluir' }).tap()
    await aba(page, 'Hoje').tap()
    await expect(missaoTreino(page)).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByText('0 XP', { exact: true })).toBeVisible()
  })

  test('na semana seguinte mostra o último treino igual, sugere o mesmo número e avisa o recorde', async ({ page }) => {
    await entrarNoTreino(page)
    await page.getByRole('button', { name: 'Mais 1' }).tap()
    await registrar(page).tap()
    await pular(page).tap()
    await page.getByRole('button', { name: 'Concluir treino antes do fim' }).tap()
    await page.getByRole('button', { name: 'Concluir agora' }).tap()
    await expect(page.getByRole('heading', { name: 'TREINO CONCLUÍDO' })).toBeVisible()
    await pularAlongamento(page)

    // segunda-feira seguinte: mesma ficha, semana 2
    await page.clock.fastForward(7 * 24 * 3_600_000)
    await expect(page.getByText('Protocolo de Choque, semana 2 de 4')).toBeVisible()
    await entrarNoTreino(page)
    await expect(page.getByText('3 séries de 6 a 8 repetições')).toBeVisible()
    await expect(page.getByText('da última vez 7 rep')).toBeVisible()
    await expect(page.getByText('Recorde: 7 rep em 09/11')).toBeVisible()
    await expect(valor(page)).toHaveText('7')
    await registrar(page).tap()
    await expect(page.locator('.exec-recorde')).toHaveCount(0)
    await pular(page).tap()
    await page.getByRole('button', { name: 'Mais 1' }).tap()
    await registrar(page).tap()
    await expect(page.locator('.exec-recorde')).toHaveText('Recorde! 8 rep. O anterior era 7 rep.')
  })

  test('depois da hora, o treino cede a vez na missão de agora e continua na lista', async ({ page }) => {
    await aba(page, 'Hoje').tap()
    await page.getByRole('button', { name: 'FEITO' }).tap()
    await expect(page.getByRole('heading', { name: 'CAFÉ REFORÇADO' })).toBeVisible()
    await missaoTreino(page).tap()
    await expect(page.getByRole('heading', { name: 'EMPURRAR' })).toBeVisible()
  })

  test('treino marcado à mão na etapa 3 continua valendo e pode ser desfeito', async ({ page }) => {
    await marcarTreinoComoNaEtapa3(page, HOJE)
    await page.reload()
    await aba(page, 'Hoje').tap()
    await expect(missaoTreino(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText('120 XP', { exact: true })).toBeVisible()
    await missaoTreino(page).tap()
    await expect(missaoTreino(page)).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByText('0 XP', { exact: true })).toBeVisible()
    // desfeita a marca antiga, o toque passa a levar para a tela de treino
    await missaoTreino(page).tap()
    await expect(page.getByRole('heading', { name: 'EMPURRAR' })).toBeVisible()
  })

  test('treino com série registrada e não concluído conta quando o dia vira', async ({ page }) => {
    await entrarNoTreino(page)
    await registrar(page).tap()
    await pular(page).tap()
    await page.getByRole('button', { name: 'Sair do treino sem concluir' }).tap()
    await aba(page, 'Hoje').tap()
    await expect(page.getByText('0 XP', { exact: true })).toBeVisible()
    await page.clock.fastForward(14 * 3_600_000 + 60_000)
    await expect(page.getByText('DIA 2 DE 365')).toBeVisible()
    await expect(page.getByText('120 XP', { exact: true })).toBeVisible()
    await aba(page, 'Treino').tap()
    await expect(page.locator('.treino-semana li').first()).toContainText('Feito')
    await expect(page.getByRole('heading', { name: 'FÔLEGO E ABDÔMEN' })).toBeVisible()
  })

  test('cronômetro esquecido ligado não sobra para depois de concluir e reabrir', async ({ page }) => {
    await entrarNoTreino(page)
    await registrar(page).tap()
    await pular(page).tap()
    for (let n = 0; n < 4; n++) await page.getByRole('button', { name: 'Pular', exact: true }).tap()
    await expect(titulo(page, 'Prancha')).toBeVisible()
    await page.getByRole('button', { name: /Cronometrar/ }).tap()
    await page.clock.fastForward(8_000)
    await page.getByRole('button', { name: 'Concluir treino antes do fim' }).tap()
    await page.getByRole('button', { name: 'Concluir agora' }).tap()
    await expect(page.getByRole('heading', { name: 'TREINO CONCLUÍDO' })).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('cronometro-treino'))).toBeNull()
    await pularAlongamento(page)
    await page.getByRole('button', { name: 'Reabrir treino' }).tap()
    await expect(titulo(page, 'Flexão com as mãos no sofá')).toBeVisible()
    await expect(registrar(page)).toBeVisible()
  })

  test('desfazer a série durante o descanso encerra o descanso', async ({ page }) => {
    await entrarNoTreino(page)
    await registrar(page).tap()
    await expect(relogio(page)).toBeVisible()
    await page.getByRole('button', { name: 'Desfazer a última série' }).tap()
    await expect(relogio(page)).toBeHidden()
    await expect(page.getByText('Série 1 de 2', { exact: true })).toBeVisible()
  })

  test('treino rápido e seis refeições vencem o dia', async ({ page }) => {
    await treinoRapido(page)
    await aba(page, 'Hoje').tap()
    for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'FEITO' }).tap()
    await expect(page.getByText(/Dia vencido\./)).toBeVisible()
  })
})

test('antes do café, a missão de agora é o treino e o botão abre a ficha do dia', async ({ page }) => {
  await abrirEm(page, new Date(2026, 10, 9, 6, 20, 0))
  await concluirAbertura(page)
  await page.getByRole('button', { name: 'FEITO' }).tap()
  await expect(page.getByRole('heading', { name: 'TREINO', exact: true })).toBeVisible()
  await expect(page.getByText(/Empurrar: peito, ombros e tríceps\. 5 exercícios/)).toBeVisible()
  await page.getByRole('button', { name: 'COMEÇAR TREINO' }).tap()
  await expect(page.getByRole('heading', { name: 'EMPURRAR' })).toBeVisible()
})

test('domingo é descanso: sem ficha para começar, com o treino de amanhã anunciado', async ({ page }) => {
  await abrirEm(page, new Date(2026, 10, 15, 10, 0, 0))
  await concluirAbertura(page)
  await aba(page, 'Treino').tap()
  await expect(page.getByRole('heading', { name: 'DESCANSO' })).toBeVisible()
  await expect(page.getByText('Amanhã: Empurrar, peito, ombros e tríceps.')).toBeVisible()
  await expect(page.getByRole('button', { name: /COMEÇAR TREINO/ })).toHaveCount(0)
  await semEstouro(page)
})
