import { describe, expect, it } from 'vitest'
import { alternarMissao, cafeinaLiberada, jornada, missaoDeAgora, mudarCopos, registroVazio, resumoDoDia, type RegistroDia } from './dia'
import { ROTINA_PADRAO, missoesDoDia, normalizarRotina, validarRotina, type IdMissao } from './rotina'
import { dataLocal, dataValida, diasEntre, faseDoDia, numeroDoDia, somarDias } from './tempo'

const SEGUNDA = '2026-11-09'
const DOMINGO = '2026-11-15'
const REFEICOES: IdMissao[] = ['pre', 'cafe', 'lancheManha', 'almoco', 'lancheTarde', 'trajeto', 'jantar', 'ceia']
const dia = (data: string, feitas: IdMissao[], copos = 0): RegistroDia => ({ data, feitas, copos })
const vencido = (data: string) => dia(data, [...REFEICOES.slice(0, 6), 'treino'])
const resumo = (r: RegistroDia) => resumoDoDia(r, missoesDoDia(ROTINA_PADRAO, r.data))

describe('tempo', () => {
  it('soma dias atravessando mês e ano', () => {
    expect(somarDias('2026-12-31', 1)).toBe('2027-01-01')
    expect(diasEntre('2026-11-12', '2027-11-11')).toBe(364)
  })
  it('numera o dia do projeto a partir de 1', () => {
    expect(numeroDoDia('2026-11-12', '2026-11-12')).toBe(1)
    expect(numeroDoDia('2026-11-12', '2026-11-11')).toBe(0)
  })
  it('usa a data local, não UTC', () => {
    expect(dataLocal(new Date(2026, 10, 12, 23, 59))).toBe('2026-11-12')
    expect(dataLocal(new Date(2026, 10, 13, 0, 1))).toBe('2026-11-13')
  })
  it('recusa data impossível', () => {
    expect(dataValida('2026-02-30')).toBe(false)
    expect(dataValida('2026-11-12')).toBe(true)
  })
  it.each([[1, 1], [30, 1], [31, 2], [120, 2], [121, 3], [240, 3], [241, 4], [400, 4]])('dia %i é fase %i', (n, f) => {
    expect(faseDoDia(n)).toBe(f)
  })
})

describe('rotina', () => {
  it('monta 8 refeições e 1 treino em dia de semana, em ordem de horário', () => {
    const m = missoesDoDia(ROTINA_PADRAO, SEGUNDA)
    expect(m.filter((x) => x.tipo === 'refeicao')).toHaveLength(8)
    expect(m.filter((x) => x.tipo === 'treino')).toHaveLength(1)
    expect(m.map((x) => x.hora)).toEqual([...m.map((x) => x.hora)].sort())
    expect(m[0].id).toBe('pre')
    expect(m[1].id).toBe('treino')
  })
  it('domingo não tem treino', () => {
    expect(missoesDoDia(ROTINA_PADRAO, DOMINGO).some((x) => x.tipo === 'treino')).toBe(false)
  })
  it('segue a rotina de quem acorda 5h30 e chega 21h30', () => {
    const r = { acordar: '05:30', sairDeCasa: '07:30', inicioTrabalho: '08:30', fimTrabalho: '18:18', chegarEmCasa: '21:30', dormir: '22:30', fimAcordar: '08:00', fimDormir: '22:30' }
    const horas = Object.fromEntries(missoesDoDia(r, SEGUNDA).map((m) => [m.id, m.hora]))
    expect(horas).toMatchObject({ pre: '05:30', treino: '05:45', cafe: '06:40', almoco: '12:30', trajeto: '18:30', jantar: '21:30', ceia: '22:00' })
  })
  it('a ceia nunca passa da hora de dormir', () => {
    const r = { ...ROTINA_PADRAO, chegarEmCasa: '22:10', dormir: '22:30', fimAcordar: '08:00', fimDormir: '22:30' }
    expect(missoesDoDia(r, SEGUNDA).find((m) => m.id === 'ceia')!.hora).toBe('22:15')
  })
  it('acusa horários fora de ordem e manhã curta demais', () => {
    expect(validarRotina(ROTINA_PADRAO)).toEqual({})
    expect(validarRotina({ ...ROTINA_PADRAO, fimTrabalho: '08:00' }).fimTrabalho).toBeTruthy()
    expect(validarRotina({ ...ROTINA_PADRAO, acordar: '07:00' }).sairDeCasa).toMatch(/1h15/)
    expect(validarRotina({ ...ROTINA_PADRAO, dormir: '' }).dormir).toBe('Informe a hora.')
  })
  it('troca rotina gravada inválida pela padrão', () => {
    expect(normalizarRotina({ acordar: '25:00' })).toEqual(ROTINA_PADRAO)
    expect(normalizarRotina(null)).toEqual(ROTINA_PADRAO)
  })
})

describe('resumo do dia', () => {
  it('domingo vence com 6 refeições, sem treino', () => {
    expect(resumo(dia(DOMINGO, REFEICOES.slice(0, 6)))).toMatchObject({ vencido: true, xp: 6 * 40 + 80 })
  })
  it('dia de treino com 8 refeições e sem treino não vence', () => {
    expect(resumo(dia(SEGUNDA, REFEICOES))).toMatchObject({ vencido: false, xp: 320 })
  })
  it('5 refeições e treino não vence', () => {
    expect(resumo(dia(SEGUNDA, [...REFEICOES.slice(0, 5), 'treino']))).toMatchObject({ vencido: false, xp: 5 * 40 + 120 })
  })
  it('desmarcar o treino tira o bônus, sem resíduo', () => {
    const r = vencido(SEGUNDA)
    expect(resumo(r).xp).toBe(6 * 40 + 120 + 80)
    expect(resumo(alternarMissao(r, 'treino')).xp).toBe(6 * 40)
  })
  it('água não passa da meta nem fica negativa', () => {
    let r = registroVazio(SEGUNDA)
    for (let i = 0; i < 15; i++) r = mudarCopos(r, 1)
    expect(r.copos).toBe(12)
    expect(resumo(r).xp).toBe(120)
    expect(mudarCopos(registroVazio(SEGUNDA), -1).copos).toBe(0)
    expect(resumo(dia(SEGUNDA, [], 99)).xp).toBe(120)
  })
  it('marcar duas vezes desfaz, não duplica', () => {
    const r = alternarMissao(alternarMissao(registroVazio(SEGUNDA), 'cafe'), 'cafe')
    expect(r.feitas).toEqual([])
  })
  it('a missão de agora é a primeira pendente; nenhuma quando o dia está completo', () => {
    const m = missoesDoDia(ROTINA_PADRAO, SEGUNDA)
    expect(missaoDeAgora(dia(SEGUNDA, ['pre']), m)!.id).toBe('treino')
    expect(missaoDeAgora(dia(SEGUNDA, [...REFEICOES, 'treino']), m)).toBeNull()
    expect(resumo(dia(SEGUNDA, [...REFEICOES, 'treino'])).completo).toBe(true)
  })
  it('cafeína fecha às 15h', () => {
    expect(cafeinaLiberada(new Date(2026, 10, 12, 14, 59))).toBe(true)
    expect(cafeinaLiberada(new Date(2026, 10, 12, 15, 0))).toBe(false)
  })
})

describe('jornada: XP total, sequência e escudos', () => {
  const INICIO = SEGUNDA
  const mapa = (rs: RegistroDia[]) => new Map(rs.map((r) => [r.data, r]))
  const seguidos = (n: number, de = INICIO) => Array.from({ length: n }, (_, i) => vencido(somarDias(de, i)))
  // domingo não tem treino: usar o mesmo registro funciona porque 'treino' é ignorado onde não existe

  it('dia 1 sem vencer: sequência 0, sem escudo', () => {
    expect(jornada(INICIO, INICIO, ROTINA_PADRAO, mapa([]))).toEqual({ xpTotal: 0, sequencia: 0, escudos: 0, diasVencidos: 0 })
  })
  it('hoje ainda não vencido não quebra a sequência de ontem', () => {
    const j = jornada(INICIO, somarDias(INICIO, 3), ROTINA_PADRAO, mapa(seguidos(3)))
    expect(j.sequencia).toBe(3)
  })
  it('o sétimo dia seguido dá um escudo; desfazer tira', () => {
    const hoje = somarDias(INICIO, 6)
    const sete = seguidos(7)
    expect(jornada(INICIO, hoje, ROTINA_PADRAO, mapa(sete))).toMatchObject({ sequencia: 7, escudos: 1 })
    sete[6] = alternarMissao(sete[6], 'pre')
    expect(jornada(INICIO, hoje, ROTINA_PADRAO, mapa(sete))).toMatchObject({ sequencia: 6, escudos: 0 })
  })
  it('guarda no máximo 2 escudos', () => {
    expect(jornada(INICIO, somarDias(INICIO, 27), ROTINA_PADRAO, mapa(seguidos(28)))).toMatchObject({ sequencia: 28, escudos: 2 })
  })
  it('dia perdido com escudo: gasta o escudo e mantém a sequência, sem aumentar', () => {
    const j = jornada(INICIO, somarDias(INICIO, 8), ROTINA_PADRAO, mapa(seguidos(7)))
    expect(j).toMatchObject({ sequencia: 7, escudos: 0 })
  })
  it('dia perdido sem escudo zera a sequência', () => {
    const j = jornada(INICIO, somarDias(INICIO, 4), ROTINA_PADRAO, mapa(seguidos(3)))
    expect(j.sequencia).toBe(0)
  })
  it('três dias perdidos com 2 escudos: gasta os dois e zera no terceiro', () => {
    const j = jornada(INICIO, somarDias(INICIO, 17), ROTINA_PADRAO, mapa(seguidos(14)))
    expect(j).toMatchObject({ sequencia: 0, escudos: 0 })
  })
  it('soma o XP de todos os dias, inclusive água e bônus', () => {
    const j = jornada(INICIO, somarDias(INICIO, 1), ROTINA_PADRAO, mapa([vencido(INICIO), dia(somarDias(INICIO, 1), ['pre'], 3)]))
    expect(j.xpTotal).toBe(6 * 40 + 120 + 80 + 40 + 30)
  })
  it('ignora registros de antes do dia 1 e de depois de hoje', () => {
    const j = jornada(INICIO, INICIO, ROTINA_PADRAO, mapa([vencido(somarDias(INICIO, -1)), vencido(somarDias(INICIO, 1))]))
    expect(j).toEqual({ xpTotal: 0, sequencia: 0, escudos: 0, diasVencidos: 0 })
  })
})

describe('versão 2: fim de semana e dia que se ajusta', () => {
  const ROTINA = { acordar: '05:30', sairDeCasa: '07:30', inicioTrabalho: '08:30', fimTrabalho: '18:18', chegarEmCasa: '21:30', dormir: '22:30', fimAcordar: '08:00', fimDormir: '23:00' }
  const QUARTA = '2026-11-11', SABADO = '2026-11-14', DOMINGO = '2026-11-15'
  const horas = (rotina: typeof ROTINA, data: string, inicio?: string, feitas: IdMissao[] = []) =>
    Object.fromEntries(missoesDoDia(rotina, data, { inicio, feitas }).map((m) => [m.id, m.hora]))

  it('fim de semana usa os horários de sábado e domingo, sem trabalho', () => {
    const sab = missoesDoDia(ROTINA, SABADO)
    expect(sab.find((m) => m.id === 'pre')!.hora).toBe('08:00')
    expect(sab.find((m) => m.id === 'treino')!.hora).toBe('08:15')
    expect(sab.every((m) => m.local === 'casa')).toBe(true)
    expect(sab.find((m) => m.id === 'ceia')!.hora).toBe('22:45')
    expect(missoesDoDia(ROTINA, DOMINGO).some((m) => m.tipo === 'treino')).toBe(false)
    expect(sab.map((m) => m.hora)).toEqual([...sab.map((m) => m.hora)].sort())
  })

  it('perfil antigo sem fim de semana ganha acordar 2 horas mais tarde', () => {
    const { fimAcordar: _a, fimDormir: _d, ...antiga } = ROTINA
    expect(normalizarRotina(antiga)).toMatchObject({ fimAcordar: '07:30', fimDormir: '22:30' })
  })

  it('fim de semana curto demais é recusado', () => {
    expect(validarRotina({ ...ROTINA, fimAcordar: '15:00' }).fimDormir).toMatch(/9 horas/)
  })

  it('atraso menor que 15 minutos não muda nada', () => {
    expect(horas(ROTINA, QUARTA, '05:40')).toEqual(horas(ROTINA, QUARTA))
  })

  it('30 minutos de atraso empurram pré-treino, treino e café; o trabalho não anda', () => {
    const normal = horas(ROTINA, QUARTA), atrasado = horas(ROTINA, QUARTA, '06:00', ['pre'])
    expect(atrasado).toMatchObject({ pre: '06:00', treino: '06:15', cafe: '07:10' })
    for (const id of ['lancheManha', 'almoco', 'lancheTarde', 'trajeto', 'jantar', 'ceia']) expect(atrasado[id]).toBe(normal[id])
  })

  it('se o treino ainda cabe, o café só encosta na hora de sair (não vai nada para a noite)', () => {
    const h = horas(ROTINA, QUARTA, '06:20', ['pre'])
    expect(h).toMatchObject({ pre: '06:20', treino: '06:35', cafe: '07:20' })
    expect(missoesDoDia(ROTINA, QUARTA, { inicio: '06:20', feitas: ['pre'] }).filter((m) => m.tipo === 'refeicao')).toHaveLength(8)
  })

  it('primeiro toque depois da hora de sair é esquecimento: horários normais', () => {
    expect(horas(ROTINA, QUARTA, '10:00', ['pre'])).toEqual(horas(ROTINA, QUARTA))
    expect(horas(ROTINA, SABADO, '13:00', ['pre'])).toEqual(horas(ROTINA, SABADO))
  })

  it('se o café não cabe antes de sair: vira uma refeição só e o treino vai para a noite', () => {
    const m = missoesDoDia(ROTINA, QUARTA, { inicio: '07:00', feitas: ['cafe'] })
    expect(m.some((x) => x.id === 'pre')).toBe(false)
    expect(m.find((x) => x.id === 'cafe')!.hora).toBe('07:00')
    expect(m.find((x) => x.id === 'treino')!).toMatchObject({ hora: '21:45', detalhe: 'Hoje à noite, antes do jantar' })
    expect(m.find((x) => x.id === 'jantar')!.hora).toBe('22:30')
    expect(m.filter((x) => x.tipo === 'refeicao')).toHaveLength(7)
  })

  it('se o primeiro toque foi o pré-treino, ele vira o café do dia e o café sai', () => {
    const m = missoesDoDia(ROTINA, QUARTA, { inicio: '07:00', feitas: ['pre'] })
    expect(m.some((x) => x.id === 'cafe')).toBe(false)
    expect(m.find((x) => x.id === 'pre')!.nome).toBe('Pré-treino e café')
  })

  it('treino já feito de manhã não é mandado para a noite', () => {
    const m = missoesDoDia(ROTINA, QUARTA, { inicio: '07:00', feitas: ['pre', 'treino'] })
    expect(m.find((x) => x.id === 'treino')!.hora).toBe('07:15')
  })

  it('no fim de semana o dia inteiro é remontado a partir da hora real', () => {
    const normal = horas(ROTINA, SABADO), atrasado = horas(ROTINA, SABADO, '10:00', ['pre'])
    expect(atrasado.pre).toBe('10:00')
    expect(atrasado.almoco > normal.almoco).toBe(true)
    expect(atrasado.ceia).toBe(normal.ceia)
  })

  it('com uma refeição a menos, vencer o dia pede 6 das 7', () => {
    const missoes = missoesDoDia(ROTINA, QUARTA, { inicio: '07:00', feitas: ['cafe'] })
    const seis: IdMissao[] = ['cafe', 'lancheManha', 'almoco', 'lancheTarde', 'trajeto', 'jantar', 'treino']
    expect(resumoDoDia({ data: QUARTA, feitas: seis, copos: 0, inicio: '07:00' }, missoes).vencido).toBe(true)
    expect(resumoDoDia({ data: QUARTA, feitas: seis.slice(1), copos: 0, inicio: '07:00' }, missoes).vencido).toBe(false)
  })

  it('o primeiro toque guarda a hora; desmarcar tudo apaga', () => {
    let r = alternarMissao(registroVazio(QUARTA), 'pre', '06:05')
    expect(r.inicio).toBe('06:05')
    r = alternarMissao(r, 'cafe', '07:30')
    expect(r.inicio).toBe('06:05')
    r = alternarMissao(alternarMissao(r, 'cafe'), 'pre')
    expect(r).toEqual({ data: QUARTA, feitas: [], copos: 0 })
  })
})
