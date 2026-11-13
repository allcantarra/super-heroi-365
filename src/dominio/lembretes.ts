/**
 * Lembretes para o Calendário do iPhone: um arquivo .ics com um evento repetido por missão, no horário da rotina,
 * com alarme na hora. Horário "flutuante" (sem fuso): o Calendário usa o fuso do próprio aparelho.
 */
import { missoesDoDia, type IdMissao, type Rotina } from './rotina'
import { diaDaSemana, somarDias } from './tempo'

export const DIAS_DO_PROJETO = 365

export interface OpcaoDeLembrete {
  id: IdMissao
  nome: string
  /** Horário de segunda a sexta. */
  hora: string
  /** Horário no fim de semana (o treino só tem no sábado). */
  horaFim: string
  nomeFim: string
}

const SEGUNDA = '2026-11-09', SABADO = '2026-11-14'

/** Missões que podem virar lembrete, com os horários da semana e do fim de semana. */
export function opcoesDeLembrete(rotina: Rotina): OpcaoDeLembrete[] {
  const fim = new Map(missoesDoDia(rotina, SABADO).map((m) => [m.id, m]))
  const nome = (id: IdMissao, n: string) => (id === 'pre' ? 'Pré-treino ou lanche ao acordar' : n)
  return missoesDoDia(rotina, SEGUNDA).map((m) => ({ id: m.id, nome: nome(m.id, m.nome), hora: m.hora, horaFim: fim.get(m.id)!.hora, nomeFim: nome(m.id, fim.get(m.id)!.nome) }))
}

const escapar = (t: string) => t.replace(/\r\n?/g, '\n').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
const compacta = (data: string) => data.replace(/-/g, '')

/** Quebra linhas acima de 75 bytes, como o formato pede (linha seguinte começa com espaço). */
function dobrar(linha: string): string {
  const bytes = new TextEncoder().encode(linha)
  if (bytes.length <= 75) return linha
  const partes: string[] = []
  let atual = ''
  for (const c of linha) {
    if (new TextEncoder().encode(atual + c).length > (partes.length ? 74 : 75)) {
      partes.push(atual)
      atual = ''
    }
    atual += c
  }
  partes.push(atual)
  return partes.join('\r\n ')
}

function utc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * Gera o .ics das missões escolhidas, de `inicio` até o fim do projeto (dia 1 + 364).
 * O treino não tem domingo; as outras missões repetem todo dia.
 */
export function gerarIcs(rotina: Rotina, escolhidas: readonly IdMissao[], inicio: string, diaUm: string, agora: Date, endereco?: string): string {
  const fim = somarDias(diaUm, DIAS_DO_PROJETO - 1)
  const opcoes = opcoesDeLembrete(rotina).filter((o) => escolhidas.includes(o.id))
  // primeiro dia a partir do início que cai num dos dias da semana pedidos (0 = domingo)
  const primeiroDia = (dias: readonly number[]) => {
    let d = inicio
    while (!dias.includes(diaDaSemana(d))) d = somarDias(d, 1)
    return d
  }
  const SEMANA = [1, 2, 3, 4, 5], FIM = [6, 0]
  const SIGLAS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
  const linhas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Super-Heroi 365//Lembretes//PT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Super-Herói 365']
  // um evento para os dias úteis e outro para o fim de semana, cada um no seu horário; treino só tem sábado no fim de semana
  const eventos = opcoes.flatMap((o) => [
    { o, parte: 'semana', dias: SEMANA, hora: o.hora, nome: o.nome },
    { o, parte: 'fim', dias: o.id === 'treino' ? [6] : FIM, hora: o.horaFim, nome: o.nomeFim },
  ])
  for (const { o, parte, dias, hora: horaDoEvento, nome } of eventos) {
    const hora = horaDoEvento.replace(':', '') + '00'
    const regra = `RRULE:FREQ=WEEKLY;BYDAY=${dias.map((d) => SIGLAS[d]).join(',')};UNTIL=${compacta(fim)}T235959`
    linhas.push(
      'BEGIN:VEVENT',
      `UID:${o.id}-${parte}-${compacta(diaUm)}@super-heroi-365`,
      `DTSTAMP:${utc(agora)}`,
      `DTSTART:${compacta(primeiroDia(dias))}T${hora}`,
      `DURATION:PT${o.id === 'treino' ? 40 : 15}M`,
      regra,
      `SUMMARY:${escapar(nome)}`,
      `DESCRIPTION:${escapar('Missão do Super-Herói 365. Abra o app para ver o que fazer e marcar como feita.')}`,
      ...(endereco ? [`URL:${endereco}`] : []),
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escapar(nome)}`, 'TRIGGER:PT0M', 'END:VALARM',
      'END:VEVENT',
    )
  }
  linhas.push('END:VCALENDAR')
  return linhas.map(dobrar).join('\r\n') + '\r\n'
}
