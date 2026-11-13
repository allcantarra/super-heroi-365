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
  hora: string
}

/** Missões que podem virar lembrete, com o horário da rotina. Usa uma segunda-feira, que tem todas (inclusive o treino). */
export function opcoesDeLembrete(rotina: Rotina): OpcaoDeLembrete[] {
  return missoesDoDia(rotina, '2026-11-09').map((m) => ({ id: m.id, nome: m.id === 'pre' ? 'Pré-treino ou lanche ao acordar' : m.nome, hora: m.hora }))
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
  // o primeiro evento cai no primeiro dia válido a partir do início (treino nunca começa num domingo)
  const primeiroDia = (id: IdMissao) => (id === 'treino' && diaDaSemana(inicio) === 0 ? somarDias(inicio, 1) : inicio)
  const linhas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Super-Heroi 365//Lembretes//PT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Super-Herói 365']
  for (const o of opcoes) {
    const hora = o.hora.replace(':', '') + '00'
    const regra = o.id === 'treino' ? `RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA;UNTIL=${compacta(fim)}T235959` : `RRULE:FREQ=DAILY;UNTIL=${compacta(fim)}T235959`
    linhas.push(
      'BEGIN:VEVENT',
      `UID:${o.id}-${compacta(diaUm)}@super-heroi-365`,
      `DTSTAMP:${utc(agora)}`,
      `DTSTART:${compacta(primeiroDia(o.id))}T${hora}`,
      `DURATION:PT${o.id === 'treino' ? 40 : 15}M`,
      regra,
      `SUMMARY:${escapar(o.nome)}`,
      `DESCRIPTION:${escapar('Missão do Super-Herói 365. Abra o app para ver o que fazer e marcar como feita.')}`,
      ...(endereco ? [`URL:${endereco}`] : []),
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escapar(o.nome)}`, 'TRIGGER:PT0M', 'END:VALARM',
      'END:VEVENT',
    )
  }
  linhas.push('END:VCALENDAR')
  return linhas.map(dobrar).join('\r\n') + '\r\n'
}
