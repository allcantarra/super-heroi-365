/**
 * Camada de jogo sobre os registros: chefão de cada fase, vilão da semana, conquistas e o gibi.
 * Tudo é calculado na hora a partir do que foi registrado; nada daqui é gravado.
 */
import { datasDaSemana, segundaDe } from './cardapio'
import { resumoDoDia, META_COPOS, registroVazio, type RegistroDia } from './dia'
import { serieDePeso, tendencia, type Pesagem } from './evolucao'
import { estagioDoNivel, NIVEL_DO_ESTAGIO, progressoDe } from './jogo'
import { missoesDoDia, type IdMissao, type Rotina } from './rotina'
import { FASES, faseDoDia, numeroDoDia, somarDias, type Fase } from './tempo'
import { treinoFeito, type Sessao } from './treino'

/** Tudo de que a campanha precisa. `dias` já vem com a missão de treino derivada das sessões. */
export interface Registros {
  diaUm: string
  hoje: string
  rotina: Rotina
  pesoInicial: number
  dias: Map<string, RegistroDia>
  sessoes: Map<string, Sessao>
  pesagens: Map<string, Pesagem>
  mesesComFoto: readonly number[]
  xpTotal: number
}

const FASES_EM_ORDEM: Fase[] = [1, 2, 3, 4]
const primeiroDiaDaFase = (f: Fase) => (f === 1 ? 1 : FASES[(f - 1) as Fase].ultimoDia + 1)
const dataDoDia = (diaUm: string, numero: number) => somarDias(diaUm, numero - 1)

// ---------------- chefões ----------------

export interface Vilao {
  nome: string
  frase: string
  /** Cor do vilão no desenho. */
  cor: string
}

export const CHEFOES: Record<Fase, Vilao> = {
  1: { nome: 'A Preguiça', frase: 'Ela quer você na cama e sem café da manhã.', cor: '#7b2cbf' },
  2: { nome: 'Barão da Desculpa', frase: 'Sempre tem um motivo para pular o treino de amanhã.', cor: '#2a9d8f' },
  3: { nome: 'General Platô', frase: 'Ele trava a balança e o espelho. Só cai com constância.', cor: '#e76f51' },
  4: { nome: 'Doutor Gordura', frase: 'O último guardião do abdômen. Cede um grama por vez.', cor: '#c1121f' },
}

/** Parte das missões da fase que derrota o chefão. */
export const PARTE_PARA_DERROTAR = 0.8

export interface EstadoDoChefao {
  fase: Fase
  vilao: Vilao
  cumpridas: number
  /** Missões que o derrotam: 80% das missões da fase inteira. */
  meta: number
  /** 1 com vida cheia, 0 derrotado. */
  vida: number
  derrotado: boolean
  /** A fase já começou (o dia de hoje está nela ou depois dela). */
  comecou: boolean
  terminou: boolean
}

export function chefao(r: Registros, fase: Fase): EstadoDoChefao {
  const inicio = primeiroDiaDaFase(fase), fim = FASES[fase].ultimoDia
  const numeroHoje = numeroDoDia(r.diaUm, r.hoje)
  let total = 0, cumpridas = 0
  for (let n = inicio; n <= fim; n++) {
    const data = dataDoDia(r.diaUm, n), missoes = missoesDoDia(r.rotina, data, r.dias.get(data))
    total += missoes.length
    if (n <= numeroHoje) {
      const feitas = new Set(r.dias.get(data)?.feitas ?? [])
      cumpridas += missoes.filter((m) => feitas.has(m.id)).length
    }
  }
  const meta = Math.ceil(total * PARTE_PARA_DERROTAR)
  return {
    fase,
    vilao: CHEFOES[fase],
    cumpridas,
    meta,
    vida: Math.max(0, 1 - cumpridas / meta),
    derrotado: cumpridas >= meta,
    comecou: numeroHoje >= inicio,
    terminou: numeroHoje > fim,
  }
}

export function chefaoAtual(r: Registros): EstadoDoChefao {
  return chefao(r, faseDoDia(Math.max(1, numeroDoDia(r.diaUm, r.hoje))))
}

// ---------------- vilão da semana ----------------

export interface DesafioDaSemana {
  vilao: string
  meta: string
  alvo: number
  feito: number
  vencido: boolean
  /** Dias da semana dentro do projeto, até hoje. */
  diasPassados: number
}

type ContarDia = (registro: RegistroDia, data: string, r: Registros) => boolean

interface ModeloDeDesafio {
  vilao: string
  /** Texto com {n} no lugar do alvo. */
  meta: string
  alvo: number
  conta: ContarDia | 'pesagem'
}

const fez = (id: IdMissao): ContarDia => (registro) => registro.feitas.includes(id)

export const DESAFIOS: readonly ModeloDeDesafio[] = [
  { vilao: 'O Desidratado', meta: 'Bater a meta de água em {n} dias', alvo: 5, conta: (registro) => registro.copos >= META_COPOS },
  { vilao: 'O Sedentário', meta: 'Concluir {n} treinos', alvo: 5, conta: fez('treino') },
  { vilao: 'O Pula-Café', meta: 'Tomar o café reforçado em {n} dias', alvo: 6, conta: fez('cafe') },
  { vilao: 'O Esquece-Marmita', meta: 'Comer a marmita do almoço em {n} dias', alvo: 6, conta: fez('almoco') },
  { vilao: 'O Fujão da Balança', meta: 'Pesar-se {n} vez na semana', alvo: 1, conta: 'pesagem' },
  { vilao: 'O Insone', meta: 'Tomar a ceia em {n} dias', alvo: 6, conta: fez('ceia') },
  { vilao: 'O Desistente', meta: 'Vencer {n} dias', alvo: 5, conta: (registro, data, r) => resumoDoDia(registro, missoesDoDia(r.rotina, data, registro)).vencido },
  { vilao: 'O Beliscador', meta: 'Comer o lanche de trajeto em {n} dias', alvo: 5, conta: fez('trajeto') },
]

/** Desafio da semana de hoje. Na primeira semana, se o dia 1 cair no meio dela, o alvo encolhe na mesma proporção. */
export function desafioDaSemana(r: Registros): DesafioDaSemana {
  const segunda = segundaDe(r.hoje)
  const indice = Math.floor(numeroDoDia(segundaDe(r.diaUm), segunda) / 7)
  const modelo = DESAFIOS[((indice % DESAFIOS.length) + DESAFIOS.length) % DESAFIOS.length]
  const datas = datasDaSemana(segunda).filter((d) => d >= r.diaUm)
  const passados = datas.filter((d) => d <= r.hoje)
  const alvo = modelo.conta === 'pesagem' ? modelo.alvo : Math.max(1, Math.round((modelo.alvo * datas.length) / 7))
  const feito =
    modelo.conta === 'pesagem'
      ? passados.filter((d) => r.pesagens.has(d)).length
      : passados.filter((d) => (modelo.conta as ContarDia)(r.dias.get(d) ?? registroVazio(d), d, r)).length
  return { vilao: modelo.vilao, meta: modelo.meta.replace('{n}', String(alvo)), alvo, feito: Math.min(feito, alvo), vencido: feito >= alvo, diasPassados: passados.length }
}

// ---------------- conquistas ----------------

export interface Conquista {
  id: string
  nome: string
  descricao: string
  feita: boolean
}

/** Maior sequência de dias vencidos seguidos, sem contar escudos: é o recorde real de constância. */
export function maiorSequencia(r: Registros): number {
  let atual = 0, maior = 0
  for (let data = r.diaUm; data <= r.hoje; data = somarDias(data, 1)) {
    const registro = r.dias.get(data) ?? registroVazio(data)
    const vencido = resumoDoDia(registro, missoesDoDia(r.rotina, data, registro)).vencido
    atual = vencido ? atual + 1 : 0
    maior = Math.max(maior, atual)
  }
  return maior
}

export function conquistas(r: Registros): Conquista[] {
  const sessoes = [...r.sessoes.values()].filter((s) => s.data >= r.diaUm && s.data <= r.hoje)
  const treinos = sessoes.filter((s) => treinoFeito(s, r.hoje)).length
  const serie = (exercicio: string, minimo = 1) => sessoes.some((s) => s.series.some((x) => x.exercicio === exercicio && x.valor >= minimo))
  const pontos = tendencia(serieDePeso(r.diaUm, r.pesoInicial, r.pesagens.values()))
  const ganho = pontos.length ? pontos[pontos.length - 1].tendencia - r.pesoInicial : 0
  const sequencia = maiorSequencia(r)
  const nivel = progressoDe(r.xpTotal).nivel
  const algumaMissao = [...r.dias.values()].some((d) => d.data >= r.diaUm && d.data <= r.hoje && d.feitas.length > 0)
  const diasNaMetaDeAgua = [...r.dias.values()].filter((d) => d.data >= r.diaUm && d.data <= r.hoje && d.copos >= META_COPOS).length
  const derrotados = FASES_EM_ORDEM.filter((f) => chefao(r, f).derrotado)
  const lista: [string, string, string, boolean][] = [
    ['primeira-missao', 'Primeiro passo', 'Cumprir a primeira missão.', algumaMissao],
    ['primeiro-dia', 'Dia vencido', 'Vencer um dia inteiro.', sequencia >= 1],
    ['primeira-semana', 'Semana de herói', 'Vencer 7 dias seguidos.', sequencia >= 7],
    ['um-mes', 'Um mês sem falhar', 'Vencer 30 dias seguidos.', sequencia >= 30],
    ['primeiro-treino', 'Primeiro treino', 'Concluir um treino.', treinos >= 1],
    ['dez-treinos', 'Dez treinos', 'Concluir 10 treinos.', treinos >= 10],
    ['cinquenta-treinos', 'Cinquenta treinos', 'Concluir 50 treinos.', treinos >= 50],
    ['dez-flexoes', 'Dez flexões', 'Fazer 10 flexões tradicionais numa série.', serie('flexao', 10)],
    ['arqueiro', 'Flexão arqueiro', 'Registrar a primeira série de flexão arqueiro.', serie('flexaoArqueiro')],
    ['hidratado', 'Bem hidratado', 'Bater a meta de água em 30 dias.', diasNaMetaDeAgua >= 30],
    ['primeiro-quilo', 'Primeiro quilo', 'Ganhar 1 kg na tendência do peso.', ganho >= 1],
    ['cinco-quilos', 'Cinco quilos', 'Ganhar 5 kg na tendência do peso.', ganho >= 5],
    ['primeira-foto', 'Primeiro retrato', 'Guardar a foto do mês.', r.mesesComFoto.length >= 1],
    ['antes-depois', 'Antes e depois', 'Ter fotos de dois meses para comparar.', r.mesesComFoto.length >= 2],
    ['recruta', 'Uniforme novo', `Chegar ao nível ${NIVEL_DO_ESTAGIO[2]} e virar Recruta.`, estagioDoNivel(nivel) >= 2],
    ['vigilante', 'Máscara', `Chegar ao nível ${NIVEL_DO_ESTAGIO[3]} e virar Vigilante.`, estagioDoNivel(nivel) >= 3],
    ['lenda', 'Lenda', `Chegar ao nível ${NIVEL_DO_ESTAGIO[4]}.`, estagioDoNivel(nivel) >= 4],
    ...FASES_EM_ORDEM.map((f): [string, string, string, boolean] => [`chefao-${f}`, `Derrotar ${CHEFOES[f].nome}`, `Cumprir 80% das missões da fase ${f}.`, derrotados.includes(f)]),
  ]
  return lista.map(([id, nome, descricao, feita]) => ({ id, nome, descricao, feita }))
}

// ---------------- gibi ----------------

export interface Quadro {
  numero: number
  data: string
  treino: boolean
  refeicoes: number
}

export interface Capitulo {
  fase: Fase
  titulo: string
  chefao: EstadoDoChefao
  /** Um quadro por dia vencido da fase. */
  quadros: Quadro[]
  diasDaFase: number
}

export function gibi(r: Registros): Capitulo[] {
  const numeroHoje = numeroDoDia(r.diaUm, r.hoje)
  return FASES_EM_ORDEM.filter((f) => primeiroDiaDaFase(f) <= Math.max(1, numeroHoje)).map((f) => {
    const quadros: Quadro[] = []
    for (let n = primeiroDiaDaFase(f); n <= Math.min(FASES[f].ultimoDia, numeroHoje); n++) {
      const data = dataDoDia(r.diaUm, n), registro = r.dias.get(data) ?? registroVazio(data)
      const resumo = resumoDoDia(registro, missoesDoDia(r.rotina, data, registro))
      if (resumo.vencido) quadros.push({ numero: n, data, treino: resumo.treinoFeito, refeicoes: resumo.refeicoesFeitas })
    }
    return { fase: f, titulo: FASES[f].nome, chefao: chefao(r, f), quadros, diasDaFase: FASES[f].ultimoDia - primeiroDiaDaFase(f) + 1 }
  })
}
