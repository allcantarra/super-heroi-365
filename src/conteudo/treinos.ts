/**
 * Fichas de treino: calistenia e corrida em casa, sem aparelho de academia.
 * Objetos de casa que aparecem: sofá, cadeira firme, mesa resistente, toalha, mochila com livros e garrafas de água.
 * Objetivo: corpo atlético e definido (ombros, costas em V, abdômen, fôlego), partindo do zero.
 */

export type Unidade = 'reps' | 'seg' | 'min'
export type Grupo = 'empurrar' | 'puxar' | 'pernas' | 'core' | 'folego'

export interface Exercicio {
  nome: string
  unidade: Unidade
  grupo: Grupo
  /** Série feita de um lado e depois do outro; o número registrado é o de cada lado. */
  porLado?: true
  /** Como executar, em uma ou duas frases. */
  execucao: string
}

const E = {
  // ---------- empurrar: peito, ombros e tríceps ----------
  flexaoInclinada: { nome: 'Flexão com as mãos no sofá', unidade: 'reps', grupo: 'empurrar', execucao: 'Mãos no assento do sofá, corpo reto da cabeça ao calcanhar. Desça o peito em 3 segundos até quase tocar e empurre de volta.' },
  flexaoJoelhos: { nome: 'Flexão de joelhos', unidade: 'reps', grupo: 'empurrar', execucao: 'Joelhos no chão, mãos um pouco mais abertas que os ombros. Desça em 3 segundos com os cotovelos a 45 graus do tronco e suba sem arquear a lombar.' },
  flexao: { nome: 'Flexão tradicional', unidade: 'reps', grupo: 'empurrar', execucao: 'Corpo reto, abdômen firme. Desça em 3 segundos até o peito quase tocar o chão e suba em 1. Se travar, termine a série de joelhos.' },
  flexaoPausa: { nome: 'Flexão com pausa embaixo', unidade: 'reps', grupo: 'empurrar', execucao: 'Flexão tradicional, parando 2 segundos com o peito a um palmo do chão. A pausa tira o impulso e obriga o peito a trabalhar.' },
  flexaoDeclinada: { nome: 'Flexão com os pés no sofá', unidade: 'reps', grupo: 'empurrar', execucao: 'Pés no sofá, mãos no chão. Desça controlando e suba sem deixar o quadril cair. Pega a parte de cima do peito e os ombros.' },
  flexaoDiamante: { nome: 'Flexão diamante', unidade: 'reps', grupo: 'empurrar', execucao: 'Mãos juntas embaixo do peito, formando um triângulo. Cotovelos rentes ao corpo na descida. De joelhos, se precisar.' },
  flexaoArqueiro: { nome: 'Flexão arqueiro', unidade: 'reps', grupo: 'empurrar', porLado: true, execucao: 'Mãos bem abertas. Desça levando o peito para uma das mãos enquanto o outro braço estica. Suba e repita para o mesmo lado até fechar a série.' },
  flexaoExplosiva: { nome: 'Flexão explosiva', unidade: 'reps', grupo: 'empurrar', execucao: 'Desça controlando e empurre o chão com força, até as palmas descolarem. Aterrisse com os cotovelos soltos e emende a próxima.' },
  pike: { nome: 'Flexão pike', unidade: 'reps', grupo: 'empurrar', execucao: 'Quadril alto, corpo em V invertido. Dobre os cotovelos levando o topo da cabeça em direção ao chão, à frente das mãos, e empurre de volta. É o exercício dos ombros.' },
  pikeElevado: { nome: 'Flexão pike com os pés na cadeira', unidade: 'reps', grupo: 'empurrar', execucao: 'Pés na cadeira, quadril alto, tronco quase na vertical. Desça a cabeça entre as mãos e empurre. Cadeira encostada na parede para não escorregar.' },
  mergulho: { nome: 'Mergulho na cadeira', unidade: 'reps', grupo: 'empurrar', execucao: 'Mãos na borda de uma cadeira firme encostada na parede, pernas dobradas. Desça em 3 segundos até o cotovelo fazer 90 graus e suba.' },
  mergulhoElevado: { nome: 'Mergulho com os pés elevados', unidade: 'reps', grupo: 'empurrar', execucao: 'Mãos em uma cadeira e calcanhares em outra, pernas esticadas. Desça até 90 graus sem deixar os ombros subirem para as orelhas.' },
  elevacaoLateral: { nome: 'Elevação lateral com garrafas', unidade: 'reps', grupo: 'empurrar', execucao: 'Uma garrafa de água cheia em cada mão. Suba os braços pelos lados até a altura dos ombros, cotovelos levemente dobrados, e desça em 3 segundos. Alarga os ombros.' },
  toqueOmbro: { nome: 'Prancha com toque no ombro', unidade: 'reps', grupo: 'empurrar', execucao: 'Posição alta de flexão, pés afastados. Toque uma mão no ombro oposto e troque, sem deixar o quadril balançar. Cada toque conta um.' },

  // ---------- puxar: costas, bíceps e postura ----------
  remadaToalha: { nome: 'Remada com toalha na porta', unidade: 'reps', grupo: 'puxar', execucao: 'Toalha presa nas duas maçanetas de uma porta aberta e firme. Pés perto da porta, incline o corpo para trás com os braços esticados e puxe o peito até as mãos, juntando as escápulas.' },
  remadaMesa: { nome: 'Remada invertida na mesa', unidade: 'reps', grupo: 'puxar', execucao: 'Deite embaixo de uma mesa pesada e firme, segure a borda e puxe o peito até ela com o corpo reto. Teste a mesa antes. Joelhos dobrados deixam mais leve.' },
  remadaMesaElevada: { nome: 'Remada invertida com os pés na cadeira', unidade: 'reps', grupo: 'puxar', execucao: 'Como a remada na mesa, com os calcanhares em uma cadeira e o corpo na horizontal. Puxe o peito até a borda e desça em 3 segundos.' },
  remadaSupinada: { nome: 'Remada invertida com as palmas para você', unidade: 'reps', grupo: 'puxar', execucao: 'Remada na mesa segurando a borda por baixo, palmas viradas para o rosto. Cotovelos rentes ao corpo. O bíceps entra junto com as costas.' },
  remadaMochila: { nome: 'Remada com mochila', unidade: 'reps', grupo: 'puxar', porLado: true, execucao: 'Mochila com livros em uma mão, a outra apoiada no sofá, tronco inclinado e costas retas. Puxe a mochila até a cintura, cotovelo rente ao corpo.' },
  remadaIsometrica: { nome: 'Remada segurando no topo', unidade: 'seg', grupo: 'puxar', execucao: 'Suba na remada invertida na mesa e segure com o peito encostado na borda, escápulas juntas. Conte o tempo parado lá em cima.' },
  superman: { nome: 'Super-homem com pausa', unidade: 'reps', grupo: 'puxar', execucao: 'De bruços, braços à frente. Tire peito, braços e pernas do chão, segure 2 segundos e desça. Olhe para o chão para não forçar o pescoço.' },
  anjoInvertido: { nome: 'Anjo invertido no chão', unidade: 'reps', grupo: 'puxar', execucao: 'De bruços, peito pouco acima do chão. Leve os braços esticados da frente da cabeça até o quadril, em arco, sem encostar no chão, e volte. Abre a postura.' },
  ytw: { nome: 'Y, T e W no chão', unidade: 'reps', grupo: 'puxar', execucao: 'De bruços, levante os braços formando um Y, depois um T, depois um W, apertando as escápulas em cada letra. As três letras contam uma repetição.' },
  roscaMochila: { nome: 'Rosca com mochila', unidade: 'reps', grupo: 'puxar', execucao: 'Segure a alça da mochila com as duas mãos, palmas para cima. Cotovelos colados ao corpo, suba até o peito e desça em 3 segundos.' },

  // ---------- pernas e glúteos ----------
  agachamento: { nome: 'Agachamento livre', unidade: 'reps', grupo: 'pernas', execucao: 'Pés na largura dos ombros. Sente para trás em 3 segundos até a coxa ficar paralela ao chão, joelhos na direção dos pés, e suba empurrando o chão.' },
  afundo: { nome: 'Afundo', unidade: 'reps', grupo: 'pernas', porLado: true, execucao: 'Passo longo à frente, tronco reto. Desça até o joelho de trás quase tocar o chão e volte. Faça todas de uma perna, depois a outra.' },
  bulgaro: { nome: 'Agachamento búlgaro', unidade: 'reps', grupo: 'pernas', porLado: true, execucao: 'Peito do pé de trás apoiado no sofá. Desça na perna da frente até a coxa ficar paralela ao chão e suba sem empurrar com a de trás.' },
  pistolSofa: { nome: 'Agachamento em uma perna até o sofá', unidade: 'reps', grupo: 'pernas', porLado: true, execucao: 'De costas para o sofá, uma perna esticada à frente. Sente devagar na outra perna até encostar no assento e levante sem tomar impulso.' },
  agachamentoSalto: { nome: 'Agachamento com salto', unidade: 'reps', grupo: 'pernas', execucao: 'Agache até a coxa ficar paralela ao chão e salte. Aterrisse macio, na ponta dos pés, já descendo para a próxima.' },
  ponteGluteo: { nome: 'Ponte de glúteo', unidade: 'reps', grupo: 'pernas', execucao: 'Deitado, joelhos dobrados, pés no chão. Suba o quadril até alinhar joelho, quadril e ombro, aperte o glúteo 1 segundo e desça.' },
  ponteUnilateral: { nome: 'Ponte de glúteo em uma perna', unidade: 'reps', grupo: 'pernas', porLado: true, execucao: 'Como a ponte, com uma perna esticada no ar. Suba o quadril sem deixar um lado cair e segure 1 segundo no topo.' },
  stiffUnilateral: { nome: 'Stiff em uma perna com mochila', unidade: 'reps', grupo: 'pernas', porLado: true, execucao: 'Mochila nas mãos, apoiado em uma perna com o joelho pouco dobrado. Incline o tronco reto à frente enquanto a outra perna sobe atrás, e volte. Trabalha a parte de trás da coxa.' },
  panturrilha: { nome: 'Elevação de panturrilha', unidade: 'reps', grupo: 'pernas', execucao: 'Em pé, de preferência na beira de um degrau. Suba na ponta dos pés, segure 1 segundo e desça devagar.' },
  panturrilhaUnilateral: { nome: 'Panturrilha em uma perna', unidade: 'reps', grupo: 'pernas', porLado: true, execucao: 'Na beira de um degrau, apoiado em um pé só e segurando na parede. Suba tudo, segure 1 segundo e desça abaixo da linha do degrau.' },
  cadeiraParede: { nome: 'Cadeira na parede', unidade: 'seg', grupo: 'pernas', execucao: 'Costas na parede, coxas paralelas ao chão, joelhos a 90 graus. Segure parado, sem apoiar as mãos nas pernas.' },

  // ---------- core ----------
  prancha: { nome: 'Prancha', unidade: 'seg', grupo: 'core', execucao: 'Antebraços no chão, cotovelos embaixo dos ombros, corpo reto. Aperte glúteo e abdômen. Pare quando o quadril começar a cair.' },
  pranchaLateral: { nome: 'Prancha lateral', unidade: 'seg', grupo: 'core', porLado: true, execucao: 'De lado, apoiado em um antebraço, pés empilhados. Suba o quadril até o corpo ficar reto e segure. Joelho de baixo no chão, se precisar.' },
  pranchaAlcance: { nome: 'Prancha com alcance', unidade: 'seg', grupo: 'core', execucao: 'Na prancha, estique um braço à frente, segure 2 segundos e troque, sem girar o quadril.' },
  deadBug: { nome: 'Inseto morto', unidade: 'reps', grupo: 'core', porLado: true, execucao: 'Deitado de costas, braços para o teto, joelhos a 90 graus. Desça um braço e a perna oposta até quase tocar o chão, com a lombar colada no piso, e volte.' },
  elevacaoPernas: { nome: 'Elevação de pernas deitado', unidade: 'reps', grupo: 'core', execucao: 'Deitado, mãos embaixo do quadril. Suba as pernas esticadas até 90 graus e desça em 3 segundos sem encostar no chão. A lombar não descola.' },
  elevacaoQuadril: { nome: 'Elevação de pernas tirando o quadril', unidade: 'reps', grupo: 'core', execucao: 'Suba as pernas até 90 graus e continue, empurrando os pés para o teto até o quadril sair do chão. Desça em 4 segundos.' },
  hollow: { nome: 'Canoa', unidade: 'seg', grupo: 'core', execucao: 'Deitado de costas, tire ombros e pernas do chão com os braços esticados atrás da cabeça. A lombar fica colada no piso. Segure parado.' },
  giroRusso: { nome: 'Giro russo com mochila', unidade: 'reps', grupo: 'core', execucao: 'Sentado, tronco inclinado para trás, pés fora do chão. Leve a mochila de um lado ao outro do quadril. Cada toque no chão conta um.' },
  escalador: { nome: 'Escalador', unidade: 'seg', grupo: 'core', execucao: 'Posição alta de flexão. Traga um joelho ao peito e troque, rápido, como se corresse no lugar, com o quadril baixo.' },
  burpee: { nome: 'Burpee', unidade: 'reps', grupo: 'core', execucao: 'Agache, apoie as mãos, jogue os pés para trás, encoste o peito no chão, volte e salte batendo as mãos acima da cabeça. Ritmo constante.' },
  vacuum: { nome: 'Vácuo abdominal', unidade: 'seg', grupo: 'core', execucao: 'Em pé ou de quatro apoios, solte todo o ar e puxe o umbigo para dentro, na direção da coluna. Segure sem prender a garganta. Afina a cintura.' },

  // ---------- fôlego ----------
  caminhadaTrote: { nome: 'Caminhada e trote', unidade: 'min', grupo: 'folego', execucao: 'Comece com 3 minutos de caminhada rápida. Depois alterne 1 minuto de trote leve com 2 de caminhada. Ritmo em que dá para conversar.' },
  corridaLeve: { nome: 'Corrida leve contínua', unidade: 'min', grupo: 'folego', execucao: 'Corra em ritmo de conversa, sem parar. Se faltar ar, caminhe 1 minuto e volte a correr. Os 3 primeiros minutos são de aquecimento.' },
  corridaTiros: { nome: 'Corrida com tiros', unidade: 'min', grupo: 'folego', execucao: 'Aqueça 5 minutos trotando. Depois alterne 1 minuto forte com 2 minutos de trote até fechar o tempo. O tiro é forte, não desesperado.' },
} satisfies Record<string, Exercicio>

export type IdExercicio = keyof typeof E
export const EXERCICIOS: Record<IdExercicio, Exercicio> = E

/** Séries, mínimo e máximo do alvo (na unidade do exercício). */
export type Nivel = readonly [series: number, minimo: number, maximo: number]

export interface ItemFicha {
  exercicio: IdExercicio
  /** Descanso depois de cada série, em segundos. */
  descanso: number
  /** Um nível por semana da ficha; a última entrada vale para as semanas seguintes. */
  niveis: readonly Nivel[]
}

export type Letra = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export interface TreinoFicha {
  letra: Letra
  nome: string
  foco: string
  itens: ItemFicha[]
}

export type IdFicha = 'choque' | 't1' | 't2' | 't3' | 't4'

export interface Ficha {
  id: IdFicha
  nome: string
  /** Último dia do projeto em que a ficha vale. */
  ultimoDia: number
  nota: string
  /** Seis treinos, de segunda a sábado. Domingo é descanso. */
  treinos: TreinoFicha[]
}

const i = (exercicio: IdExercicio, descanso: number, ...niveis: Nivel[]): ItemFicha => ({ exercicio, descanso, niveis })

export const AQUECIMENTO = 'Antes de começar: 2 minutos girando ombros, quadril e tornozelos, e 20 polichinelos.'

export const FICHAS: Ficha[] = [
  {
    id: 'choque',
    nome: 'Protocolo de Choque',
    ultimoDia: 28,
    nota: 'Quatro semanas para o corpo aprender os movimentos. A cada semana a ficha sobe um degrau. Pare cada série com 2 repetições de folga.',
    treinos: [
      { letra: 'A', nome: 'Empurrar', foco: 'Peito, ombros e tríceps', itens: [
        i('flexaoInclinada', 60, [2, 6, 8], [3, 6, 8], [3, 8, 10], [3, 10, 12]),
        i('pike', 60, [2, 4, 6], [3, 4, 6], [3, 5, 8], [3, 6, 8]),
        i('mergulho', 60, [2, 6, 8], [3, 6, 8], [3, 8, 10], [3, 8, 12]),
        i('toqueOmbro', 45, [2, 8, 12], [2, 10, 14], [3, 10, 14], [3, 12, 16]),
        i('prancha', 45, [2, 15, 20], [3, 15, 20], [3, 20, 30], [3, 25, 35]),
      ] },
      { letra: 'B', nome: 'Fôlego e abdômen', foco: 'Caminhada, trote e core', itens: [
        i('caminhadaTrote', 60, [1, 12, 15], [1, 15, 18], [1, 18, 20], [1, 20, 22]),
        i('deadBug', 45, [2, 6, 8], [2, 8, 10], [3, 8, 10], [3, 10, 12]),
        i('elevacaoPernas', 45, [2, 6, 8], [2, 8, 10], [3, 8, 10], [3, 10, 12]),
        i('vacuum', 30, [2, 10, 15], [3, 10, 15], [3, 15, 20], [3, 15, 20]),
      ] },
      { letra: 'C', nome: 'Puxar', foco: 'Costas e postura', itens: [
        i('remadaToalha', 60, [2, 6, 8], [3, 6, 8], [3, 8, 10], [3, 10, 12]),
        i('remadaMesa', 60, [2, 3, 5], [2, 4, 6], [3, 4, 6], [3, 5, 8]),
        i('superman', 45, [2, 8, 10], [3, 8, 10], [3, 10, 12], [3, 10, 12]),
        i('ytw', 45, [2, 5, 6], [2, 6, 8], [3, 6, 8], [3, 6, 8]),
        i('pranchaLateral', 30, [2, 10, 15], [2, 15, 20], [3, 15, 20], [3, 20, 25]),
      ] },
      { letra: 'D', nome: 'Pernas', foco: 'Coxas, glúteos e panturrilhas', itens: [
        i('agachamento', 60, [2, 8, 10], [3, 8, 12], [3, 10, 15], [3, 12, 15]),
        i('afundo', 60, [2, 5, 6], [2, 6, 8], [3, 6, 8], [3, 8, 10]),
        i('ponteGluteo', 45, [2, 10, 12], [3, 10, 12], [3, 12, 15], [3, 12, 15]),
        i('panturrilha', 30, [2, 12, 15], [3, 12, 15], [3, 15, 20], [3, 15, 20]),
        i('cadeiraParede', 45, [2, 15, 20], [2, 20, 30], [3, 20, 30], [3, 30, 40]),
      ] },
      { letra: 'E', nome: 'Corpo todo', foco: 'Os movimentos da semana, juntos', itens: [
        i('flexaoJoelhos', 60, [2, 5, 8], [3, 5, 8], [3, 6, 10], [3, 8, 12]),
        i('remadaToalha', 60, [2, 6, 8], [3, 6, 8], [3, 8, 10], [3, 10, 12]),
        i('agachamento', 60, [2, 8, 10], [3, 8, 12], [3, 10, 15], [3, 12, 15]),
        i('pike', 60, [2, 4, 6], [2, 4, 6], [3, 5, 8], [3, 6, 8]),
        i('escalador', 30, [2, 15, 20], [3, 15, 20], [3, 20, 25], [3, 20, 30]),
      ] },
      { letra: 'F', nome: 'Fôlego', foco: 'Caminhada e trote mais longos', itens: [
        i('caminhadaTrote', 60, [1, 15, 18], [1, 18, 20], [1, 20, 25], [1, 25, 28]),
        i('prancha', 45, [2, 15, 20], [2, 20, 25], [3, 20, 30], [3, 25, 35]),
      ] },
    ],
  },
  {
    id: 't1',
    nome: 'Trimestre 1: Base Atlética',
    ultimoDia: 91,
    nota: 'Desça em 3 segundos em toda repetição. Chegou ao topo do alvo em todas as séries? Na próxima vez, desça mais devagar ou pause embaixo.',
    treinos: [
      { letra: 'A', nome: 'Empurrar', foco: 'Peito, ombros e tríceps', itens: [
        i('flexao', 60, [4, 6, 12]),
        i('pike', 60, [3, 6, 10]),
        i('mergulho', 60, [3, 8, 12]),
        i('flexaoDiamante', 60, [2, 6, 10]),
        i('elevacaoLateral', 45, [3, 12, 15]),
        i('toqueOmbro', 45, [3, 16, 20]),
      ] },
      { letra: 'B', nome: 'Fôlego e abdômen', foco: 'Trote e core', itens: [
        i('caminhadaTrote', 60, [1, 18, 22]),
        i('elevacaoPernas', 45, [3, 10, 12]),
        i('prancha', 45, [3, 30, 45]),
        i('vacuum', 30, [2, 15, 20]),
      ] },
      { letra: 'C', nome: 'Puxar', foco: 'Costas, bíceps e postura', itens: [
        i('remadaMesa', 60, [4, 6, 10]),
        i('remadaToalha', 60, [3, 10, 12]),
        i('superman', 45, [3, 10, 12]),
        i('anjoInvertido', 45, [3, 8, 12]),
        i('roscaMochila', 45, [3, 10, 12]),
        i('pranchaLateral', 30, [2, 20, 30]),
      ] },
      { letra: 'D', nome: 'Pernas', foco: 'Coxas, glúteos e panturrilhas', itens: [
        i('agachamento', 60, [4, 12, 15]),
        i('afundo', 60, [3, 8, 10]),
        i('ponteGluteo', 45, [3, 12, 15]),
        i('panturrilha', 30, [3, 15, 20]),
        i('cadeiraParede', 45, [3, 30, 40]),
        i('deadBug', 45, [2, 10, 12]),
      ] },
      { letra: 'E', nome: 'Corpo todo', foco: 'Ombros e costas em destaque', itens: [
        i('flexao', 60, [3, 6, 12]),
        i('remadaMesa', 60, [3, 6, 10]),
        i('pike', 60, [3, 6, 10]),
        i('agachamento', 60, [3, 12, 15]),
        i('mergulho', 60, [3, 8, 12]),
        i('escalador', 30, [3, 20, 30]),
      ] },
      { letra: 'F', nome: 'Fôlego', foco: 'Trote mais longo', itens: [
        i('caminhadaTrote', 60, [1, 25, 30]),
        i('vacuum', 30, [3, 15, 20]),
      ] },
    ],
  },
  {
    id: 't2',
    nome: 'Trimestre 2: Ombros e Costas em V',
    ultimoDia: 182,
    nota: 'Versões mais difíceis dos mesmos movimentos. Ficou fácil? Desça em 4 segundos e pause embaixo antes de aumentar as repetições.',
    treinos: [
      { letra: 'A', nome: 'Empurrar', foco: 'Ombros largos e peito', itens: [
        i('flexaoDeclinada', 75, [4, 8, 12]),
        i('pikeElevado', 75, [4, 6, 8]),
        i('flexaoArqueiro', 75, [3, 4, 6]),
        i('mergulhoElevado', 60, [3, 10, 12]),
        i('elevacaoLateral', 45, [3, 12, 15]),
      ] },
      { letra: 'B', nome: 'Tiros e abdômen', foco: 'Corrida com tiros e core', itens: [
        i('corridaTiros', 60, [1, 20, 22]),
        i('hollow', 45, [3, 20, 30]),
        i('elevacaoPernas', 45, [3, 12, 15]),
        i('pranchaLateral', 30, [2, 25, 30]),
      ] },
      { letra: 'C', nome: 'Puxar', foco: 'Costas em V e bíceps', itens: [
        i('remadaMesaElevada', 75, [4, 8, 12]),
        i('remadaMochila', 60, [3, 8, 10]),
        i('remadaSupinada', 60, [3, 8, 10]),
        i('anjoInvertido', 45, [3, 10, 12]),
        i('roscaMochila', 45, [3, 10, 12]),
        i('remadaIsometrica', 45, [2, 15, 20]),
      ] },
      { letra: 'D', nome: 'Pernas', foco: 'Uma perna de cada vez', itens: [
        i('bulgaro', 75, [4, 8, 10]),
        i('agachamentoSalto', 60, [3, 10, 12]),
        i('ponteUnilateral', 45, [3, 10, 12]),
        i('stiffUnilateral', 45, [3, 8, 10]),
        i('panturrilhaUnilateral', 30, [3, 12, 15]),
      ] },
      { letra: 'E', nome: 'Corpo todo', foco: 'Força com fôlego', itens: [
        i('flexaoPausa', 60, [3, 6, 8]),
        i('remadaSupinada', 75, [4, 8, 10]),
        i('pikeElevado', 75, [3, 6, 8]),
        i('bulgaro', 60, [3, 8, 10]),
        i('pranchaAlcance', 45, [3, 30, 40]),
        i('burpee', 45, [3, 8, 10]),
      ] },
      { letra: 'F', nome: 'Fôlego', foco: 'Corrida contínua', itens: [
        i('corridaLeve', 60, [1, 25, 30]),
        i('vacuum', 30, [3, 15, 20]),
      ] },
    ],
  },
  {
    id: 't3',
    nome: 'Trimestre 3: Força e Controle',
    ultimoDia: 273,
    nota: 'Mais repetições nas versões difíceis e pausas mais longas. A última repetição de cada série tem de sair tão limpa quanto a primeira.',
    treinos: [
      { letra: 'A', nome: 'Empurrar', foco: 'Ombros, peito e tríceps', itens: [
        i('flexaoDeclinada', 75, [4, 10, 15]),
        i('flexaoArqueiro', 75, [3, 6, 8]),
        i('pikeElevado', 75, [4, 8, 10]),
        i('mergulhoElevado', 60, [3, 12, 15]),
        i('flexaoDiamante', 60, [3, 10, 15]),
      ] },
      { letra: 'B', nome: 'Tiros e abdômen', foco: 'Corrida com tiros e core', itens: [
        i('corridaTiros', 60, [1, 22, 25]),
        i('hollow', 45, [3, 30, 40]),
        i('elevacaoQuadril', 45, [3, 10, 15]),
        i('giroRusso', 45, [3, 20, 24]),
      ] },
      { letra: 'C', nome: 'Puxar', foco: 'Costas em V e bíceps', itens: [
        i('remadaMesaElevada', 75, [4, 10, 15]),
        i('remadaMochila', 60, [3, 10, 12]),
        i('remadaSupinada', 60, [3, 10, 12]),
        i('remadaIsometrica', 45, [3, 20, 30]),
        i('anjoInvertido', 45, [3, 12, 15]),
        i('roscaMochila', 45, [3, 12, 15]),
      ] },
      { letra: 'D', nome: 'Pernas', foco: 'Força em uma perna', itens: [
        i('bulgaro', 75, [4, 10, 12]),
        i('pistolSofa', 75, [3, 4, 6]),
        i('agachamentoSalto', 60, [3, 12, 15]),
        i('stiffUnilateral', 45, [3, 10, 12]),
        i('panturrilhaUnilateral', 30, [3, 15, 20]),
      ] },
      { letra: 'E', nome: 'Corpo todo', foco: 'Potência e fôlego', itens: [
        i('flexaoExplosiva', 75, [4, 5, 8]),
        i('remadaMesaElevada', 75, [3, 10, 12]),
        i('pikeElevado', 75, [3, 8, 10]),
        i('agachamentoSalto', 60, [3, 12, 15]),
        i('pranchaAlcance', 45, [3, 40, 45]),
        i('burpee', 45, [3, 10, 12]),
      ] },
      { letra: 'F', nome: 'Fôlego', foco: 'Corrida contínua', itens: [
        i('corridaLeve', 60, [1, 30, 35]),
        i('vacuum', 30, [2, 15, 20]),
      ] },
    ],
  },
  {
    id: 't4',
    nome: 'Trimestre 4: Definição',
    ultimoDia: 365,
    nota: 'Mesma força, menos descanso. O músculo fica, a gordura sai. Mantenha as repetições do trimestre anterior com o relógio mais curto.',
    treinos: [
      { letra: 'A', nome: 'Empurrar', foco: 'Ombros e peito, descanso curto', itens: [
        i('flexaoDeclinada', 45, [4, 12, 15]),
        i('flexaoArqueiro', 45, [3, 8, 10]),
        i('pikeElevado', 45, [4, 8, 12]),
        i('mergulhoElevado', 45, [3, 12, 15]),
        i('flexaoDiamante', 45, [3, 10, 15]),
        i('burpee', 30, [3, 10, 12]),
      ] },
      { letra: 'B', nome: 'Tiros e abdômen', foco: 'Corrida com tiros e core', itens: [
        i('corridaTiros', 60, [1, 20, 22]),
        i('hollow', 30, [3, 30, 45]),
        i('elevacaoQuadril', 30, [3, 12, 15]),
        i('escalador', 30, [3, 30, 40]),
        i('vacuum', 30, [2, 15, 20]),
      ] },
      { letra: 'C', nome: 'Puxar', foco: 'Costas em V, descanso curto', itens: [
        i('remadaMesaElevada', 45, [4, 12, 15]),
        i('remadaMochila', 45, [3, 10, 12]),
        i('remadaSupinada', 45, [4, 10, 12]),
        i('anjoInvertido', 30, [3, 12, 15]),
        i('roscaMochila', 30, [3, 12, 15]),
        i('remadaIsometrica', 30, [3, 20, 30]),
      ] },
      { letra: 'D', nome: 'Pernas', foco: 'Pernas e fôlego', itens: [
        i('bulgaro', 45, [4, 10, 12]),
        i('pistolSofa', 60, [3, 5, 8]),
        i('agachamentoSalto', 45, [4, 12, 15]),
        i('ponteUnilateral', 30, [3, 12, 15]),
        i('cadeiraParede', 30, [2, 45, 60]),
      ] },
      { letra: 'E', nome: 'Circuito', foco: 'Corpo todo em ritmo alto', itens: [
        i('flexaoExplosiva', 45, [3, 6, 8]),
        i('remadaSupinada', 45, [3, 10, 12]),
        i('pikeElevado', 45, [3, 8, 10]),
        i('agachamentoSalto', 45, [3, 12, 15]),
        i('burpee', 30, [4, 10, 12]),
        i('escalador', 30, [3, 30, 40]),
      ] },
      { letra: 'F', nome: 'Fôlego', foco: 'Corrida contínua', itens: [
        i('corridaLeve', 60, [1, 30, 35]),
        i('pranchaLateral', 30, [2, 30, 40]),
      ] },
    ],
  },
]
