import { diaDaSemana, horaDeMinutos, horaValida, minutos } from './tempo'

export interface Rotina {
  acordar: string
  sairDeCasa: string
  inicioTrabalho: string
  fimTrabalho: string
  chegarEmCasa: string
  dormir: string
  /** Sábado e domingo, sem trabalho. */
  fimAcordar: string
  fimDormir: string
}

export const ROTINA_PADRAO: Rotina = {
  acordar: '06:00',
  sairDeCasa: '07:30',
  inicioTrabalho: '08:30',
  fimTrabalho: '18:00',
  chegarEmCasa: '19:30',
  dormir: '22:30',
  fimAcordar: '08:00',
  fimDormir: '22:30',
}

export const ROTULOS_ROTINA: Record<keyof Rotina, string> = {
  acordar: 'Acordo às',
  sairDeCasa: 'Saio de casa às',
  inicioTrabalho: 'Começo a trabalhar às',
  fimTrabalho: 'Termino o trabalho às',
  chegarEmCasa: 'Chego em casa às',
  dormir: 'Vou dormir às',
  fimAcordar: 'No fim de semana, acordo às',
  fimDormir: 'No fim de semana, durmo às',
}

const ORDEM: (keyof Rotina)[] = ['acordar', 'sairDeCasa', 'inicioTrabalho', 'fimTrabalho', 'chegarEmCasa', 'dormir']
const TODOS: (keyof Rotina)[] = [...ORDEM, 'fimAcordar', 'fimDormir']

/** Horas acordado no fim de semana para caberem as 8 refeições com folga. */
export const HORAS_MINIMAS_FIM_DE_SEMANA = 9

/** Erros por campo. Vazio quando a rotina é coerente. */
export function validarRotina(r: Rotina): Partial<Record<keyof Rotina, string>> {
  const erros: Partial<Record<keyof Rotina, string>> = {}
  for (const campo of TODOS) if (!horaValida(r[campo])) erros[campo] = 'Informe a hora.'
  if (Object.keys(erros).length) return erros
  for (let i = 1; i < ORDEM.length; i++) {
    if (minutos(r[ORDEM[i]]) <= minutos(r[ORDEM[i - 1]])) erros[ORDEM[i]] = 'Precisa ser depois do horário anterior.'
  }
  if (!erros.sairDeCasa && minutos(r.sairDeCasa) - minutos(r.acordar) < 75) {
    erros.sairDeCasa = 'Deixe pelo menos 1h15 entre acordar e sair: é o tempo do treino e do café.'
  }
  if (minutos(r.fimDormir) - minutos(r.fimAcordar) < HORAS_MINIMAS_FIM_DE_SEMANA * 60) {
    erros.fimDormir = `Deixe pelo menos ${HORAS_MINIMAS_FIM_DE_SEMANA} horas entre acordar e dormir para caberem as refeições.`
  }
  return erros
}

export function normalizarRotina(dado: unknown): Rotina {
  const d = (dado ?? {}) as Partial<Record<keyof Rotina, unknown>>
  const r = { ...ROTINA_PADRAO }
  for (const campo of ORDEM) if (horaValida(d[campo])) r[campo] = d[campo] as string
  // perfil da versão 1 não tem fim de semana: acordar 2 horas mais tarde e dormir no mesmo horário
  r.fimAcordar = horaValida(d.fimAcordar) ? d.fimAcordar : horaDeMinutos(minutos(r.acordar) + 120)
  r.fimDormir = horaValida(d.fimDormir) ? d.fimDormir : r.dormir
  if (Object.keys(validarRotina(r)).length === 0) return r
  // fim de semana inválido não derruba a semana
  const soSemana = { ...r, fimAcordar: horaDeMinutos(minutos(r.acordar) + 120), fimDormir: r.dormir }
  return Object.keys(validarRotina(soSemana)).length ? { ...ROTINA_PADRAO } : soSemana
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

export function ehFimDeSemana(data: string): boolean {
  const d = diaDaSemana(data)
  return d === 0 || d === 6
}

/** Atraso mínimo, em minutos, para o dia ser reajustado pela hora do primeiro toque. */
export const ATRASO_MINIMO = 15

/** O que o ajuste do dia precisa saber do registro: a hora do primeiro toque e o que já foi feito. */
export interface ComoComecou {
  inicio?: string
  feitas?: readonly IdMissao[]
}

/** Hora de acordar prevista para a data: a da semana ou a do fim de semana. */
export function acordarPrevisto(rotina: Rotina, data: string): string {
  return ehFimDeSemana(data) ? rotina.fimAcordar : rotina.acordar
}

/** Atraso máximo considerado no fim de semana; acima disso o primeiro toque foi esquecimento, não sono. */
export const ATRASO_MAXIMO_FIM_DE_SEMANA = 240

/**
 * Minutos de atraso do dia em relação à rotina; 0 sem primeiro toque ou abaixo do mínimo.
 * Primeiro toque depois da hora de sair de casa (dia útil), ou mais de 4 horas depois de acordar (fim de semana),
 * é tratado como missão marcada tarde por esquecimento: os horários continuam os normais.
 */
export function atrasoDoDia(rotina: Rotina, data: string, inicio?: string): number {
  if (!inicio || !horaValida(inicio)) return 0
  const atraso = minutos(inicio) - minutos(acordarPrevisto(rotina, data))
  if (atraso < ATRASO_MINIMO) return 0
  if (ehFimDeSemana(data)) return atraso <= ATRASO_MAXIMO_FIM_DE_SEMANA ? atraso : 0
  return minutos(inicio) < minutos(rotina.sairDeCasa) ? atraso : 0
}

const refeicao = (id: IdMissao, nome: string, detalhe: string, min: number, local: Local): Missao =>
  ({ id, tipo: 'refeicao', nome, detalhe, hora: horaDeMinutos(min), local, xp: XP_REFEICAO })
const missaoTreino = (min: number, detalhe = '30 a 40 minutos, em casa'): Missao =>
  ({ id: 'treino', tipo: 'treino', nome: 'Treino', detalhe, hora: horaDeMinutos(min), local: 'casa', xp: XP_TREINO })

function diaDeSemana(rotina: Rotina, treina: boolean, acordar: number): Missao[] {
  const inicio = minutos(rotina.inicioTrabalho), fim = minutos(rotina.fimTrabalho)
  const jornada = fim - inicio
  const chegada = minutos(rotina.chegarEmCasa), dormir = minutos(rotina.dormir)
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
  if (treina) lista.push(missaoTreino(acordar + 15))
  return lista
}

/** Sábado e domingo: sem trabalho, as refeições do meio do dia se espalham entre o café e a ceia. */
function diaDeFolga(rotina: Rotina, treina: boolean, acordar: number): Missao[] {
  const dormir = minutos(rotina.fimDormir)
  const cafe = acordar + 70, ceia = Math.max(cafe + 60 * 6, dormir - 15)
  const em = (fracao: number) => cafe + (ceia - cafe) * fracao
  const lista: Missao[] = [
    refeicao('pre', treina ? 'Pré-treino' : 'Lanche ao acordar', treina ? 'Algo rápido antes de treinar' : 'Algo rápido para abrir o apetite', acordar, 'casa'),
    refeicao('cafe', 'Café reforçado', treina ? 'Com whey e creatina, logo depois do treino' : 'Com whey e creatina', cafe, 'casa'),
    refeicao('lancheManha', 'Lanche da manhã', 'Em casa', em(0.18), 'casa'),
    refeicao('almoco', 'Almoço', 'Em casa ou a marmita da semana', em(0.36), 'casa'),
    refeicao('lancheTarde', 'Lanche da tarde', 'Em casa', em(0.54), 'casa'),
    refeicao('trajeto', 'Lanche reforçado', 'Em casa, no fim da tarde', em(0.7), 'casa'),
    refeicao('jantar', 'Jantar', 'Em casa', em(0.86), 'casa'),
    refeicao('ceia', 'Ceia líquida', 'Vitamina antes de dormir', ceia, 'casa'),
  ]
  if (treina) lista.push(missaoTreino(acordar + 15))
  return lista
}

/**
 * Missões do dia, em ordem de horário, montadas a partir da rotina do usuário.
 * Com `comoComecou`, o dia se ajusta à hora do primeiro toque (spec v2, 3.1):
 * - fim de semana: o dia inteiro é remontado a partir da hora real;
 * - dia de trabalho: pré-treino, treino e café andam o atraso; o que é do trabalho fica preso ao expediente;
 *   se o café passar da hora de sair, pré-treino e café viram uma refeição só e o treino vai para a noite.
 */
export function missoesDoDia(rotina: Rotina, data: string, comoComecou?: ComoComecou): Missao[] {
  const treina = ehDiaDeTreino(data)
  const atraso = atrasoDoDia(rotina, data, comoComecou?.inicio)
  const acordar = minutos(acordarPrevisto(rotina, data)) + atraso
  let lista = ehFimDeSemana(data) ? diaDeFolga(rotina, treina, acordar) : diaDeSemana(rotina, treina, minutos(rotina.acordar))

  if (atraso > 0 && !ehFimDeSemana(data)) {
    const mover = (id: IdMissao, delta: number) => (m: Missao) => (m.id === id ? { ...m, hora: horaDeMinutos(minutos(m.hora) + delta) } : m)
    lista = lista.map(mover('pre', atraso)).map(mover('treino', atraso)).map(mover('cafe', atraso))
    const limite = minutos(rotina.sairDeCasa) - 10
    const inicioDoDia = minutos(acordarPrevisto(rotina, data)) + atraso
    // o treino ainda cabe antes de sair (15 min depois do pré, 40 de treino)? então só o café encosta na hora de sair
    const treinoCabe = !treina || inicioDoDia + 15 + 40 <= limite
    const cafe = lista.find((m) => m.id === 'cafe')!
    if (treinoCabe && minutos(cafe.hora) > limite) {
      lista = lista.map((m) => (m.id === 'cafe' ? { ...m, hora: horaDeMinutos(limite), detalhe: 'Hoje logo antes de sair de casa' } : m))
    } else if (!treinoCabe) {
      const feitas = comoComecou?.feitas ?? []
      const inicioReal = minutos(acordarPrevisto(rotina, data)) + atraso
      if (feitas.includes('pre') && !feitas.includes('cafe')) {
        lista = lista.filter((m) => m.id !== 'cafe').map((m) => (m.id === 'pre' ? { ...m, nome: 'Pré-treino e café', detalhe: 'Hoje é uma refeição só: junte o whey e a creatina do café' } : m))
      } else {
        lista = lista.filter((m) => m.id !== 'pre').map((m) => (m.id === 'cafe' ? { ...m, hora: horaDeMinutos(inicioReal), detalhe: 'Hoje junto com o pré-treino: coma antes de sair' } : m))
      }
      if (treina && !feitas.includes('treino')) {
        const chegada = minutos(rotina.chegarEmCasa), dormir = minutos(rotina.dormir)
        const treinoNoite = chegada + 15, jantar = treinoNoite + 45
        lista = lista.map((m) =>
          m.id === 'treino' ? missaoTreino(treinoNoite, 'Hoje à noite, antes do jantar')
          : m.id === 'jantar' ? { ...m, hora: horaDeMinutos(jantar), detalhe: 'Em casa, depois do treino' }
          : m.id === 'ceia' ? { ...m, hora: horaDeMinutos(Math.min(Math.max(jantar + 20, chegada + 30), dormir - 5)) }
          : m,
        )
      }
    }
  }
  return lista.map((m) => ({ ...m, hora: arredondar5(m.hora) })).sort((a, b) => minutos(a.hora) - minutos(b.hora))
}

function arredondar5(hora: string): string {
  return horaDeMinutos(Math.round(minutos(hora) / 5) * 5)
}
