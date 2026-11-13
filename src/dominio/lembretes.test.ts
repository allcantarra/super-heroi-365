import { describe, expect, it } from 'vitest'
import { gerarIcs, opcoesDeLembrete } from './lembretes'
import { ROTINA_PADRAO } from './rotina'

const AGORA = new Date(Date.UTC(2026, 10, 13, 12, 0, 0))
const ROTINA = { acordar: '05:30', sairDeCasa: '07:30', inicioTrabalho: '08:30', fimTrabalho: '18:18', chegarEmCasa: '21:30', dormir: '22:30', fimAcordar: '08:00', fimDormir: '22:30' }

describe('lembretes do Calendário', () => {
  it('oferece as 9 missões com o horário da semana e do fim de semana', () => {
    const o = opcoesDeLembrete(ROTINA)
    expect(o).toHaveLength(9)
    expect(o.map((x) => x.hora)).toEqual([...o.map((x) => x.hora)].sort())
    expect(o.find((x) => x.id === 'treino')!.hora).toBe('05:45')
    expect(o.find((x) => x.id === 'jantar')!.hora).toBe('21:30')
    expect(o.find((x) => x.id === 'pre')!.horaFim).toBe('08:00')
    expect(o.find((x) => x.id === 'trajeto')!.nomeFim).toBe('Lanche reforçado')
  })

  it('gera um evento por missão escolhida, com alarme na hora e fim no último dia do projeto', () => {
    const ics = gerarIcs(ROTINA, ['cafe', 'treino'], '2026-11-13', '2026-11-09', AGORA)
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    // café e treino, cada um com evento de dias úteis e de fim de semana
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(4)
    expect(ics.match(/TRIGGER:PT0M/g)).toHaveLength(4)
    expect(ics).toContain('DTSTART:20261113T064000')
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=20271108T235959')
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=SA,SU;UNTIL=20271108T235959')
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=SA;UNTIL=20271108T235959')
    // fim de semana no horário de sábado: acorda 08:00, café 09:10, primeiro sábado 14/11
    expect(ics).toContain('DTSTART:20261114T091000')
    expect(ics).toContain('DTSTART:20261114T081500')
    expect(ics).toContain('DTSTAMP:20261113T120000Z')
    expect(ics).not.toMatch(/[^\r]\n/)
  })

  it('treino que começaria num domingo começa na segunda (dias úteis) e no sábado seguinte (fim de semana)', () => {
    const ics = gerarIcs(ROTINA_PADRAO, ['treino'], '2026-11-15', '2026-11-09', AGORA)
    expect(ics).toContain('DTSTART:20261116T061500')
    expect(ics).toContain('DTSTART:20261121T081500')
  })

  it('quebra linhas longas sem passar de 75 bytes', () => {
    const ics = gerarIcs(ROTINA, ['pre'], '2026-11-13', '2026-11-09', AGORA, 'https://exemplo.test/app/')
    expect(ics).toContain('SUMMARY:Pré-treino ou lanche ao acordar')
    expect(ics).toContain('Abra o app para ver o que fazer e marcar como feita.'.slice(0, 10))
    for (const linha of ics.split('\r\n')) expect(new TextEncoder().encode(linha).length).toBeLessThanOrEqual(75)
    // a descrição passa de 75 bytes e é dobrada numa linha que começa com espaço
    expect(ics).toMatch(/\r\n [^\r]/)
  })

  it('sem missão escolhida, o calendário sai vazio', () => {
    expect(gerarIcs(ROTINA, [], '2026-11-13', '2026-11-09', AGORA)).not.toContain('BEGIN:VEVENT')
  })
})
