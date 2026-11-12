import { diaDaSemana, horaDeMinutos, horaValida, minutos } from './tempo'

export interface Rotina {
  acordar: string
  sairDeCasa: string
  inicioTrabalho: string
  fimTrabalho: string
  chegarEmCasa: string
  dormir: string
}

export const ROTINA_PADRAO: Rotina = {
  acordar: '06:00',
  sairDeCasa: '07:30',
  inicioTrabalho: '08:30',
  fimTrabalho: '18:00',
  chegarEmCasa: '19:30',
  dormir: '22:30',
}

export const ROTULOS_ROTINA: Record<keyof Rotina, string> = {
  acordar: 'Acordo às',
  sairDeCasa: 'Saio de casa às',
  inicioTrabalho: 'Começo a trabalhar às',
  fimTrabalho: 'Termino o trabalho às',
  chegarEmCasa: 'Chego em casa às',
  dormir: 'Vou dormir às',
}

const ORDEM: (keyof Rotina)[] = ['acordar', 'sairDeCasa', 'inicioTrabalho', 'fimTrabalho', 'chegarEmCasa', 'dormir']

/** Erros por campo. Vazio quando a rotina é coerente. */
export function validarRotina(r: Rotina): Partial<Record<keyof Rotina, string>> {
  const erros: Partial<Record<keyof Rotina, string>> = {}
  for (const campo of ORDEM) if (!horaValida(r[campo])) erros[campo] = 'Informe a hora.'
  if (Object.keys(erros).length) return erros
  for (let i = 1; i < ORDEM.length; i++) {
    if (minutos(r[ORDEM[i]]) <= minutos(r[ORDEM[i - 1]])) erros[ORDEM[i]] = 'Precisa ser depois do horário anterior.'
  }
  if (!erros.sairDeCasa && minutos(r.sairDeCasa) - minutos(r.acordar) < 75) {
    erros.sairDeCasa = 'Deixe pelo menos 1h15 entre acordar e sair: é o tempo do treino e do café.'
  }
  return erros
}

export function normalizarRotina(dado: unknown): Rotina {
  const d = (dado ?? {}) as Partial<Record<keyof Rotina, unknown>>
  const r = { ...ROTINA_PADRAO }
  for (const campo of ORDEM) if (horaValida(d[campo])) r[campo] = d[campo] as string
  return Object.keys(validarRotina(r)).length ? { ...ROTINA_PADRAO } : r
}

export type Local = 'casa' | 'trabalho' | 'trajeto'
export type IdMissao = 'pre' | 'treino' | 'cafe' | 'lancheManha' | 'almoco' | 'lancheTarde' | 'trajeto' | 'jantar' | 'ceia'

export interface Missao {
  id: IdMissao
  tipo: 'refeicao' | 'treino'
  nome: string
  detalhe: string
  hora: string
  local: Local
  xp: number
}

export const XP_REFEICAO = 40
export const XP_TREINO = 120

/** Domingo é descanso. */
export function ehDiaDeTreino(data: string): boolean {
  return diaDaSemana(data) !== 0
}

/** Missões do dia, em ordem de horário, montadas a partir da rotina do usuário. */
export function missoesDoDia(rotina: Rotina, data: string): Missao[] {
  const treina = ehDiaDeTreino(data)
  const acordar = minutos(rotina.acordar), inicio = minutos(rotina.inicioTrabalho), fim = minutos(rotina.fimTrabalho)
  const jornada = fim - inicio
  const chegada = minutos(rotina.chegarEmCasa), dormir = minutos(rotina.dormir)
  const refeicao = (id: IdMissao, nome: string, detalhe: string, min: number, local: Local): Missao =>
    ({ id, tipo: 'refeicao', nome, detalhe, hora: horaDeMinutos(min), local, xp: XP_REFEICAO })
  const lista: Missao[] = [
    refeicao('pre', treina ? 'Pré-treino' : 'Lanche ao acordar', treina ? 'Algo rápido antes de treinar' : 'Algo rápido para abrir o apetite', acordar, 'casa'),
    refeicao('cafe', 'Café reforçado', treina ? 'Com whey e creatina, logo depois do treino' : 'Com whey e creatina', acordar + 70, 'casa'),
    refeicao('lancheManha', 'Lanche da manhã', 'Portátil, no trabalho', inicio + jornada * 0.16, 'trabalho'),
    refeicao('almoco', 'Almoço', 'Marmita, no trabalho', inicio + jornada * 0.41, 'trabalho'),
    refeicao('lancheTarde', 'Lanche da tarde', 'Portátil, no trabalho', inicio + jornada * 0.72, 'trabalho'),
    refeicao('trajeto', 'Lanche de trajeto', 'Portátil, na volta para casa', fim + 12, 'trajeto'),
    refeicao('jantar', 'Jantar', 'Em casa', chegada, 'casa'),
    refeicao('ceia', 'Ceia líquida', 'Vitamina antes de dormir', Math.min(chegada + 30, dormir - 15), 'casa'),
  ]
  if (treina) {
    lista.push({ id: 'treino', tipo: 'treino', nome: 'Treino', detalhe: '30 a 40 minutos, em casa', hora: horaDeMinutos(acordar + 15), local: 'casa', xp: XP_TREINO })
  }
  return lista.map((m) => ({ ...m, hora: arredondar5(m.hora) })).sort((a, b) => minutos(a.hora) - minutos(b.hora))
}

function arredondar5(hora: string): string {
  return horaDeMinutos(Math.round(minutos(hora) / 5) * 5)
}
