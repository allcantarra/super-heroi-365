import { describe, expect, it } from 'vitest'
import { EXERCICIOS, FICHAS, type Grupo, type IdExercicio } from '../conteudo/treinos'
import { jornada, missaoDeAgora, registroVazio, type RegistroDia } from './dia'
import { ROTINA_PADRAO, missoesDoDia } from './rotina'
import { somarDias } from './tempo'
import {
  ajustarFim, concluir, desfazerSerie, diasComTreino, duracaoEstimada, fichaDoDia, normalizarSessao, proximoItem, reabrir, recordes, recordesBatidos,
  registrarSerie, relogio, resumoDaSessao, segundosDecorridos, segundosRestantes, seriesDe, sessaoNova, sugestao, textoAlvo, textoValor, treinoDaData, treinoFeito, ultimaVez,
  type Sessao,
} from './treino'

// 2026-11-09 é segunda-feira
const DIA_UM = '2026-11-09'
const T0 = Date.UTC(2026, 10, 9, 9)

const sessao = (data: string, treino: string, series: [IdExercicio, number][], concluida = true): Sessao =>
  ({ data, treino, inicio: T0, fim: concluida ? T0 + 30 * 60_000 : null, series: series.map(([exercicio, valor]) => ({ exercicio, valor })) })
const mapa = (...lista: Sessao[]) => new Map(lista.map((s) => [s.data, s]))

describe('conteúdo das fichas', () => {
  const usados = new Set(FICHAS.flatMap((f) => f.treinos.flatMap((t) => t.itens.map((i) => i.exercicio))))

  it('tem o Protocolo de Choque de 4 semanas e os 4 trimestres, cobrindo os 365 dias', () => {
    expect(FICHAS.map((f) => f.id)).toEqual(['choque', 't1', 't2', 't3', 't4'])
    expect(FICHAS.map((f) => f.ultimoDia)).toEqual([28, 91, 182, 273, 365])
  })

  it('cada ficha tem 6 treinos, de A a F, com exercícios que existem e sem repetir no mesmo treino', () => {
    for (const ficha of FICHAS) {
      expect(ficha.treinos.map((t) => t.letra), ficha.id).toEqual(['A', 'B', 'C', 'D', 'E', 'F'])
      for (const treino of ficha.treinos) {
        const ids = treino.itens.map((i) => i.exercicio)
        expect(new Set(ids).size, `${ficha.id}-${treino.letra}`).toBe(ids.length)
        for (const id of ids) expect(EXERCICIOS[id], id).toBeDefined()
      }
    }
  })

  it('todo exercício do catálogo é usado e tem descrição de execução', () => {
    for (const [id, ex] of Object.entries(EXERCICIOS)) {
      expect(usados.has(id as IdExercicio), id).toBe(true)
      expect(ex.execucao.length, id).toBeGreaterThan(40)
      expect(ex.execucao.length, id).toBeLessThan(220)
    }
  })

  it('séries, alvo e descanso ficam em faixas sensatas', () => {
    for (const ficha of FICHAS) for (const treino of ficha.treinos) for (const item of treino.itens) {
      const onde = `${ficha.id}-${treino.letra} ${item.exercicio}`
      expect(item.descanso, onde).toBeGreaterThanOrEqual(30)
      expect(item.descanso, onde).toBeLessThanOrEqual(90)
      expect(item.niveis.length, onde).toBe(ficha.id === 'choque' ? 4 : 1)
      for (const [series, minimo, maximo] of item.niveis) {
        expect(series, onde).toBeGreaterThanOrEqual(1)
        expect(series, onde).toBeLessThanOrEqual(4)
        expect(minimo, onde).toBeGreaterThanOrEqual(1)
        expect(maximo, onde).toBeGreaterThanOrEqual(minimo)
        if (EXERCICIOS[item.exercicio].unidade === 'min') expect(series, onde).toBe(1)
      }
    }
  })

  it('o Protocolo de Choque parte do zero e nunca regride de uma semana para a outra', () => {
    for (const treino of FICHAS[0].treinos) for (const item of treino.itens) {
      expect(item.niveis[0][0], item.exercicio).toBeLessThanOrEqual(2)
      for (let s = 1; s < 4; s++) {
        expect(item.niveis[s][0], item.exercicio).toBeGreaterThanOrEqual(item.niveis[s - 1][0])
        expect(item.niveis[s][2], item.exercicio).toBeGreaterThanOrEqual(item.niveis[s - 1][2])
      }
    }
  })

  it('todo treino cabe na manhã: de 12 a 40 minutos em qualquer semana', () => {
    for (let numero = 1; numero <= 365; numero++) {
      const data = somarDias(DIA_UM, numero - 1)
      const treino = treinoDaData(DIA_UM, data)
      if (!treino) continue
      const minutos = duracaoEstimada(treino.itens)
      expect(minutos, `${treino.id} semana ${treino.semana}`).toBeGreaterThanOrEqual(12)
      expect(minutos, `${treino.id} semana ${treino.semana}`).toBeLessThanOrEqual(40)
    }
  })

  it('toda semana trabalha empurrar, puxar, pernas, core e fôlego, com ombros e costas duas vezes', () => {
    for (const ficha of FICHAS) {
      const grupos = (g: Grupo) => ficha.treinos.filter((t) => t.itens.some((i) => EXERCICIOS[i.exercicio].grupo === g)).length
      for (const g of ['empurrar', 'puxar', 'pernas', 'core', 'folego'] as Grupo[]) expect(grupos(g), `${ficha.id} ${g}`).toBeGreaterThanOrEqual(2)
    }
  })

  it('os textos falam em atlético e definido, nunca em volume pelo volume', () => {
    const texto = JSON.stringify([FICHAS, EXERCICIOS]).toLowerCase()
    for (const proibida of ['monstro', 'gigante', 'fisicultur', 'academia', 'halter', 'barra fixa']) expect(texto).not.toContain(proibida)
  })
})

describe('treino do dia', () => {
  it('segunda é o treino A do Choque, semana 1, com o primeiro degrau da progressão', () => {
    const t = treinoDaData(DIA_UM, DIA_UM)!
    expect(t).toMatchObject({ id: 'choque-A', nomeFicha: 'Protocolo de Choque', semana: 1, semanasDaFicha: 4, nome: 'Empurrar' })
    expect(t.itens[0]).toEqual({ exercicio: 'flexaoInclinada', series: 2, alvo: [6, 8], descanso: 60 })
  })

  it('a mesma segunda, três semanas depois, sobe para o último degrau', () => {
    const t = treinoDaData(DIA_UM, somarDias(DIA_UM, 21))!
    expect(t).toMatchObject({ id: 'choque-A', semana: 4 })
    expect(t.itens[0]).toMatchObject({ series: 3, alvo: [10, 12] })
  })

  it('domingo é descanso e antes do dia 1 não há treino', () => {
    expect(treinoDaData(DIA_UM, somarDias(DIA_UM, 6))).toBeNull()
    expect(treinoDaData(DIA_UM, somarDias(DIA_UM, -1))).toBeNull()
  })

  it('troca de ficha no dia 29, 92, 183 e 274, e mantém a última depois do dia 365', () => {
    expect([28, 29, 91, 92, 182, 183, 273, 274, 365, 400].map((n) => fichaDoDia(n).id)).toEqual(['choque', 't1', 't1', 't2', 't2', 't3', 't3', 't4', 't4', 't4'])
    const dia29 = treinoDaData(DIA_UM, somarDias(DIA_UM, 28))!
    expect(dia29).toMatchObject({ id: 't1-A', semana: 1, semanasDaFicha: 9 })
  })

  it('quando o dia 1 cai no meio da semana, o treino segue o dia da semana', () => {
    const quinta = '2026-11-12'
    expect(treinoDaData(quinta, quinta)!.id).toBe('choque-D')
    expect(treinoDaData(quinta, somarDias(quinta, 7))!.semana).toBe(2)
  })

  it('escreve o alvo e o valor por extenso', () => {
    const itens = treinoDaData(DIA_UM, somarDias(DIA_UM, 2))!.itens
    expect(textoAlvo(itens[0])).toBe('6 a 8 repetições')
    expect(textoAlvo(itens[4])).toBe('10 a 15 segundos por lado')
    expect(textoAlvo({ exercicio: 'prancha', series: 1, alvo: [30, 30], descanso: 30 })).toBe('30 segundos')
    expect(textoValor('caminhadaTrote', 15)).toBe('15 min')
    expect(textoValor('flexao', 9)).toBe('9 rep')
  })
})

describe('sessão', () => {
  const itens = treinoDaData(DIA_UM, DIA_UM)!.itens

  it('registra séries em ordem e aponta o próximo exercício com série faltando', () => {
    let s = sessaoNova(DIA_UM, 'choque-A', T0)
    expect(proximoItem(itens, s)).toBe(0)
    s = registrarSerie(s, 'flexaoInclinada', 8)
    expect(proximoItem(itens, s)).toBe(0)
    s = registrarSerie(s, 'flexaoInclinada', 7)
    expect(seriesDe(s, 'flexaoInclinada')).toEqual([8, 7])
    expect(proximoItem(itens, s)).toBe(1)
    for (const item of itens.slice(1)) for (let n = 0; n < item.series; n++) s = registrarSerie(s, item.exercicio, 5)
    expect(proximoItem(itens, s)).toBeNull()
  })

  it('limita o valor registrado a um inteiro entre 1 e 999', () => {
    const s = sessaoNova(DIA_UM, 'choque-A', T0)
    expect(registrarSerie(s, 'flexao', 0).series[0].valor).toBe(1)
    expect(registrarSerie(s, 'flexao', 7.6).series[0].valor).toBe(8)
    expect(registrarSerie(s, 'flexao', 5000).series[0].valor).toBe(999)
  })

  it('só conta como feito depois de concluído, e só conclui com série registrada', () => {
    const vazia = sessaoNova(DIA_UM, 'choque-A', T0)
    expect(treinoFeito(undefined)).toBe(false)
    expect(treinoFeito(concluir(vazia, T0 + 1000))).toBe(false)
    const comSerie = registrarSerie(vazia, 'flexaoInclinada', 8)
    expect(treinoFeito(comSerie)).toBe(false)
    const concluida = concluir(comSerie, T0 + 31 * 60_000)
    expect(treinoFeito(concluida)).toBe(true)
    expect(treinoFeito(reabrir(concluida))).toBe(false)
  })

  it('desfazer apaga a última série do exercício; sem série, o treino volta a ficar aberto', () => {
    let s = sessao(DIA_UM, 'choque-A', [['flexaoInclinada', 8], ['pike', 5], ['flexaoInclinada', 6]])
    s = desfazerSerie(s, 'flexaoInclinada')
    expect(s.series).toEqual([{ exercicio: 'flexaoInclinada', valor: 8 }, { exercicio: 'pike', valor: 5 }])
    expect(desfazerSerie(s, 'mergulho')).toBe(s)
    s = desfazerSerie(desfazerSerie(s, 'pike'), 'flexaoInclinada')
    expect(s.series).toEqual([])
    expect(s.fim).toBeNull()
  })

  it('resume séries, repetições e duração', () => {
    const s = sessao(DIA_UM, 'choque-A', [['flexaoInclinada', 8], ['flexaoInclinada', 7], ['prancha', 20]])
    expect(resumoDaSessao(s, itens)).toEqual({ series: 3, seriesPrevistas: 10, repeticoes: 15, minutos: 30 })
    expect(resumoDaSessao(reabrir(s), itens).minutos).toBeNull()
  })

  it('normaliza o que vem do banco e descarta o que não dá para aproveitar', () => {
    expect(normalizarSessao(null)).toBeNull()
    expect(normalizarSessao({ data: '2026-13-40', treino: 'choque-A', inicio: T0 })).toBeNull()
    expect(normalizarSessao({ data: DIA_UM, treino: '', inicio: T0 })).toBeNull()
    expect(normalizarSessao({ data: DIA_UM, treino: 'choque-A', inicio: 'ontem' })).toBeNull()
    const s = normalizarSessao({
      data: DIA_UM, treino: 'choque-A', inicio: T0, fim: T0 - 5,
      series: [{ exercicio: 'flexao', valor: 8 }, { exercicio: 'inventado', valor: 8 }, { exercicio: 'flexao', valor: -1 }, { exercicio: 'flexao', valor: 2.5 }, { exercicio: 'toString', valor: 3 }, null],
    })
    expect(s).toEqual({ data: DIA_UM, treino: 'choque-A', inicio: T0, fim: null, series: [{ exercicio: 'flexao', valor: 8 }] })
    // concluída sem nenhuma série válida volta a ficar em aberto
    expect(normalizarSessao({ data: DIA_UM, treino: 'choque-A', inicio: T0, fim: T0 + 9, series: [] })!.fim).toBeNull()
  })
})

describe('último treino igual e recordes', () => {
  const s1 = sessao('2026-11-09', 'choque-A', [['flexaoInclinada', 8], ['flexaoInclinada', 6], ['pike', 4]])
  const s2 = sessao('2026-11-13', 'choque-E', [['pike', 6], ['flexaoJoelhos', 7]])
  const s3 = sessao('2026-11-16', 'choque-A', [['flexaoInclinada', 9], ['flexaoInclinada', 9], ['pike', 5]])
  const todas = mapa(s1, s2, s3)

  it('mostra a última sessão do mesmo treino, anterior à data', () => {
    expect(ultimaVez(todas, 'flexaoInclinada', '2026-11-16', 'choque-A')).toEqual({ data: '2026-11-09', valores: [8, 6] })
    expect(ultimaVez(todas, 'flexaoInclinada', '2026-11-23', 'choque-A')).toEqual({ data: '2026-11-16', valores: [9, 9] })
    expect(ultimaVez(todas, 'flexaoInclinada', '2026-11-09', 'choque-A')).toBeNull()
  })

  it('prefere o mesmo treino mesmo que o exercício tenha aparecido depois em outro', () => {
    expect(ultimaVez(todas, 'pike', '2026-11-16', 'choque-A')).toEqual({ data: '2026-11-09', valores: [4] })
  })

  it('sem sessão do mesmo treino, usa a última em que o exercício apareceu', () => {
    expect(ultimaVez(todas, 'pike', '2026-12-07', 't1-A')).toEqual({ data: '2026-11-16', valores: [5] })
  })

  it('sugere o valor da última vez para a série; sem histórico, o piso do alvo', () => {
    const item = { exercicio: 'flexaoInclinada' as const, series: 3, alvo: [6, 8] as [number, number], descanso: 60 }
    expect(sugestao(item, 1, null)).toBe(6)
    expect(sugestao(item, 2, { data: '2026-11-09', valores: [8, 6] })).toBe(6)
    expect(sugestao(item, 3, { data: '2026-11-09', valores: [8, 6] })).toBe(6)
  })

  it('recorde é a melhor série de cada exercício, com a data em que saiu', () => {
    const r = recordes(todas)
    expect(r.get('flexaoInclinada')).toEqual({ valor: 9, data: '2026-11-16' })
    expect(r.get('pike')).toEqual({ valor: 6, data: '2026-11-13' })
    expect(recordes(todas, '2026-11-16').get('flexaoInclinada')).toEqual({ valor: 8, data: '2026-11-09' })
  })

  it('recorde batido exige histórico: primeira vez não conta, empate não conta', () => {
    expect(recordesBatidos(todas, s1)).toEqual([])
    expect(recordesBatidos(todas, s2)).toEqual(['pike'])
    expect(recordesBatidos(todas, s3)).toEqual(['flexaoInclinada'])
  })
})

describe('missão de treino na tela Hoje', () => {
  const dias = new Map<string, RegistroDia>([
    ['2026-11-09', { data: '2026-11-09', feitas: ['pre', 'treino'], copos: 2 }],
    ['2026-11-10', { data: '2026-11-10', feitas: ['pre'], copos: 0 }],
  ])

  it('sessão concluída cumpre a missão; em andamento, não', () => {
    const efetivos = diasComTreino(dias, mapa(sessao('2026-11-10', 'choque-B', [['prancha', 20]]), sessao('2026-11-11', 'choque-C', [['superman', 8]], false)))
    expect(efetivos.get('2026-11-10')!.feitas).toEqual(['pre', 'treino'])
    expect(efetivos.get('2026-11-11')).toBeUndefined()
  })

  it('treino de dia passado com série registrada conta mesmo sem ter sido concluído; o de hoje, não', () => {
    const aberta = sessao('2026-11-11', 'choque-C', [['superman', 8]], false)
    expect(treinoFeito(aberta, '2026-11-11')).toBe(false)
    expect(treinoFeito(aberta, '2026-11-12')).toBe(true)
    expect(treinoFeito(sessao('2026-11-11', 'choque-C', [], false), '2026-11-12')).toBe(false)
    expect(diasComTreino(dias, mapa(aberta), '2026-11-12').get('2026-11-11')!.feitas).toEqual(['treino'])
    expect(diasComTreino(dias, mapa(aberta), '2026-11-11').get('2026-11-11')).toBeUndefined()
  })

  it('dia marcado à mão antes da tela de treino continua valendo, sem duplicar', () => {
    const efetivos = diasComTreino(dias, mapa(sessao('2026-11-09', 'choque-A', [['pike', 4]])))
    expect(efetivos.get('2026-11-09')!.feitas).toEqual(['pre', 'treino'])
    expect(diasComTreino(dias, new Map()).get('2026-11-09')!.feitas).toContain('treino')
  })

  it('não altera os registros originais e cria o dia quando só existe a sessão', () => {
    const efetivos = diasComTreino(dias, mapa(sessao('2026-11-12', 'choque-D', [['agachamento', 10]])))
    expect(efetivos.get('2026-11-12')).toEqual({ data: '2026-11-12', feitas: ['treino'], copos: 0 })
    expect(dias.has('2026-11-12')).toBe(false)
  })

  it('o XP do treino entra na jornada pela sessão', () => {
    const sem = jornada(DIA_UM, '2026-11-10', ROTINA_PADRAO, dias).xpTotal
    const com = jornada(DIA_UM, '2026-11-10', ROTINA_PADRAO, diasComTreino(dias, mapa(sessao('2026-11-10', 'choque-B', [['prancha', 20]])))).xpTotal
    expect(com - sem).toBe(120)
  })

  it('o treino pendente cede a vez na missão de agora quando chega a hora da próxima', () => {
    const missoes = missoesDoDia(ROTINA_PADRAO, DIA_UM)
    const registro = { ...registroVazio(DIA_UM), feitas: ['pre' as const] }
    expect(missaoDeAgora(registro, missoes)!.id).toBe('treino')
    expect(missaoDeAgora(registro, missoes, '06:30')!.id).toBe('treino')
    expect(missaoDeAgora(registro, missoes, '07:10')!.id).toBe('cafe')
    // passou a janela da manhã: o treino não volta a ocupar o painel entre uma refeição e outra
    expect(missaoDeAgora({ ...registro, feitas: ['pre', 'cafe'] }, missoes, '08:00')!.id).toBe('lancheManha')
    // refeição atrasada não cede a vez: só o treino, que depende de outra tela
    expect(missaoDeAgora(registroVazio(DIA_UM), missoes, '12:00')!.id).toBe('pre')
    // sobrou só o treino: ele volta a ser a missão de agora
    const soTreino = { ...registroVazio(DIA_UM), feitas: missoes.filter((m) => m.id !== 'treino').map((m) => m.id) }
    expect(missaoDeAgora(soTreino, missoes, '21:00')!.id).toBe('treino')
  })
})

describe('cronômetro', () => {
  it('conta pelo instante final: continua certo depois de qualquer tempo em segundo plano', () => {
    const fim = T0 + 60_000
    expect(segundosRestantes(fim, T0)).toBe(60)
    expect(segundosRestantes(fim, T0 + 100)).toBe(60)
    expect(segundosRestantes(fim, T0 + 59_001)).toBe(1)
    expect(segundosRestantes(fim, T0 + 60_000)).toBe(0)
    expect(segundosRestantes(fim, T0 + 10 * 60_000)).toBe(0)
  })

  it('soma e tira segundos sem deixar o fim no passado', () => {
    const fim = T0 + 20_000
    expect(ajustarFim(fim, 15, T0)).toBe(T0 + 35_000)
    expect(ajustarFim(fim, -15, T0)).toBe(T0 + 5_000)
    expect(ajustarFim(fim, -15, T0 + 10_000)).toBe(T0 + 10_000)
  })

  it('escreve minutos e segundos', () => {
    expect([0, 5, 65, 600, -3].map(relogio)).toEqual(['0:00', '0:05', '1:05', '10:00', '0:00'])
    expect(segundosDecorridos(T0, T0 + 61_900)).toBe(61)
    expect(segundosDecorridos(T0, T0 - 5)).toBe(0)
  })
})
