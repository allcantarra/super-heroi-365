import { useLiveQuery } from 'dexie-react-hooks'
import { Camera, ChevronDown, Lock, Trash2, Trophy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { lerFotos } from '../dados/banco'
import type { Dados } from '../dados/useDados'
import { semanaDe } from '../dominio/cardapio'
import { diasComTreino } from '../dominio/treino'
import {
  NOMES_DAS_PARTES, PARTES, XP_FOTO, XP_PESAGEM, atributos, medidaValida, mesDoProjeto, pesoValido, ritmo, serieDePeso, tendencia,
  variacaoDasMedidas, type Foto, type Medida, type Parte, type Pesagem,
} from '../dominio/evolucao'
import { TITULOS, estagioDoNivel, progressoDe } from '../dominio/jogo'
import { jornada } from '../dominio/dia'
import { xpDaEvolucao } from '../dominio/evolucao'
import { FASES, dataCurta } from '../dominio/tempo'
import { Avatar } from '../heroi/Avatar'
import { ErroDeFoto, comprimirImagem } from '../ui/comprimirImagem'
import { GraficoPeso } from '../ui/GraficoPeso'
import { montarRegistros } from '../ui/registros'
import { conquistas, gibi } from '../dominio/campanha'

export interface AcoesDaEvolucao {
  salvarPesagem: (p: Pesagem) => Promise<boolean>
  apagarPesagem: (data: string) => Promise<boolean>
  salvarMedida: (m: Medida) => Promise<boolean>
  apagarMedida: (data: string) => Promise<boolean>
  salvarFoto: (f: Foto) => Promise<boolean>
  apagarFoto: (mes: number) => Promise<boolean>
}

interface Props {
  dados: Dados
  hoje: string
  erroAoSalvar: boolean
  acoes: AcoesDaEvolucao
}

type Visao = 'peso' | 'medidas' | 'fotos' | 'heroi'
const VISOES: { id: Visao; nome: string }[] = [{ id: 'peso', nome: 'Peso' }, { id: 'medidas', nome: 'Medidas' }, { id: 'fotos', nome: 'Fotos' }, { id: 'heroi', nome: 'Herói' }]
const kg = (n: number) => n.toFixed(1).replace('.', ',')
const sinal = (n: number, casas = 1) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(casas).replace('.', ',')}`
const UNIDADES = { forca: 'séries', folego: 'minutos', energia: 'refeições', foco: 'dias' } as const
const texto = (n: number | undefined) => (n === undefined ? '' : String(n).replace('.', ','))

export function Evolucao({ dados, hoje, erroAoSalvar, acoes }: Props) {
  const [visao, setVisao] = useState<Visao>('peso')
  return (
    <>
      <h1 className="titulo-tela">Evolução</h1>
      <div className="abas quatro" role="tablist" aria-label="Partes da evolução">
        {VISOES.map((v) => (
          <button key={v.id} role="tab" aria-selected={visao === v.id} onClick={() => setVisao(v.id)}>{v.nome}</button>
        ))}
      </div>
      {erroAoSalvar && <p className="aviso" role="alert" style={{ marginBottom: 18 }}>Não deu para salvar neste aparelho. Tente de novo; se continuar, feche e abra o app.</p>}
      {visao === 'peso' && <Peso dados={dados} hoje={hoje} acoes={acoes} />}
      {visao === 'medidas' && <Medidas dados={dados} hoje={hoje} acoes={acoes} />}
      {visao === 'fotos' && <Fotos dados={dados} hoje={hoje} acoes={acoes} />}
      {visao === 'heroi' && <Heroi dados={dados} hoje={hoje} />}
    </>
  )
}

type PropsDaVisao = { dados: Dados; hoje: string; acoes: AcoesDaEvolucao }

function CampoData({ diaUm, hoje, valor, aoMudar }: { diaUm: string; hoje: string; valor: string; aoMudar: (d: string) => void }) {
  return (
    <label className="campo">
      Data
      <input type="date" value={valor} min={diaUm} max={hoje} onChange={(e) => e.target.value && aoMudar(e.target.value)} />
    </label>
  )
}

function Peso({ dados, hoje, acoes }: PropsDaVisao) {
  const { perfil, pesagens } = dados
  const diaUm = perfil.diaUm!, pessoa = perfil.pessoa!
  const [data, setData] = useState(hoje)
  const existente = pesagens.get(data)
  const [valor, setValor] = useState(texto(existente?.kg))
  const [tentou, setTentou] = useState(false)
  const [salvo, setSalvo] = useState<string | null>(null)
  // virou o dia com a tela aberta: o formulário passa para o dia novo, se estava no dia de hoje
  const [hojeVisto, setHojeVisto] = useState(hoje)
  if (hojeVisto !== hoje) {
    setHojeVisto(hoje)
    if (data === hojeVisto) {
      setData(hoje)
      setValor(texto(pesagens.get(hoje)?.kg))
    }
  }
  const pontos = tendencia(serieDePeso(diaUm, pessoa.pesoInicial, pesagens.values()))
  const ultimo = pontos[pontos.length - 1]
  const r = ritmo(diaUm, pontos)
  const peso = pesoValido(valor)
  const semanaJaContou = [...pesagens.keys()].some((d) => d !== data && semanaDe(diaUm, d) === semanaDe(diaUm, hoje))

  const mudarData = (d: string) => {
    setData(d)
    setValor(texto(pesagens.get(d)?.kg))
    setTentou(false)
    setSalvo(null)
  }
  const salvar = async () => {
    setTentou(true)
    if (peso === null) return
    if (await acoes.salvarPesagem({ data, kg: peso })) {
      setSalvo(`Peso de ${dataCurta(data)} salvo.`)
      setTentou(false)
    }
  }
  const apagar = async (d: string) => {
    if (!window.confirm(`Apagar a pesagem de ${dataCurta(d)}? Não dá para desfazer.`)) return
    await acoes.apagarPesagem(d)
    if (d === data) setValor('')
  }

  const falta = pessoa.metaPeso - ultimo.tendencia
  return (
    <>
      <dl className="placar">
        <div><dt>Tendência</dt><dd>{kg(ultimo.tendencia)}</dd><small>kg</small></div>
        <div><dt>Desde o início</dt><dd>{sinal(ultimo.tendencia - pessoa.pesoInicial)}</dd><small>kg</small></div>
        <div><dt>Meta</dt><dd>{kg(pessoa.metaPeso)}</dd><small>{Math.abs(falta) < 0.5 ? 'chegou' : `${falta > 0 ? 'faltam' : 'passou'} ${kg(Math.abs(falta))} kg`}</small></div>
      </dl>

      <form className="painel escuro formulario" noValidate onSubmit={(e) => { e.preventDefault(); void salvar() }}>
        <span className="aba">REGISTRAR PESO</span>
        <div className="campos">
          <CampoData diaUm={diaUm} hoje={hoje} valor={data} aoMudar={mudarData} />
          <label className="campo">
            Peso (kg)
            <input inputMode="decimal" autoComplete="off" value={valor} aria-invalid={tentou && peso === null} onChange={(e) => { setValor(e.target.value); setSalvo(null) }} />
            {tentou && peso === null && <span className="erro" role="alert">Entre 30 e 200 kg.</span>}
          </label>
        </div>
        <button type="submit" className="botao largo" style={{ marginTop: 14 }}>{existente ? 'Atualizar peso' : 'Salvar peso'}</button>
        <p className="nota" role="status">{salvo ?? (semanaJaContou ? 'A pesagem desta semana já rendeu XP.' : `A primeira pesagem da semana rende +${XP_PESAGEM} XP.`)}</p>
      </form>

      <GraficoPeso pontos={pontos} meta={pessoa.metaPeso} />

      <p className={r && r.avaliacao !== 'dentro' ? 'aviso ritmo' : 'nota ritmo'}>
        {r
          ? `Ritmo: ${sinal(r.kgPorSemana, 2)} kg por semana. ${r.avaliacao === 'dentro' ? 'Dentro do esperado' : r.avaliacao === 'abaixo' ? 'Abaixo do esperado' : 'Acima do esperado'} para a fase ${r.fase} (${FASES[r.fase].nome}).${r.fase !== 4 && r.avaliacao === 'acima' ? ' Ganho rápido demais costuma ser gordura: tire uma ceia por semana.' : ''}${r.fase !== 4 && r.avaliacao === 'abaixo' ? ' Some uma porção de arroz ou um pão no almoço.' : ''}`
          : 'Pese-se uma vez por semana, em jejum, sempre no mesmo dia. Com 10 dias de pesagens o app mostra o seu ritmo.'}
      </p>


      <h2 className="secao">REGISTROS</h2>
      <table className="tabela">
        <thead><tr><th>Data</th><th>Peso</th><th>Tendência</th><th><span className="so-leitor">Apagar</span></th></tr></thead>
        <tbody>
          {[...pontos].reverse().map((p) => (
            <tr key={p.data}>
              <td>{dataCurta(p.data)}</td>
              <td>{kg(p.kg)}</td>
              <td>{kg(p.tendencia)}</td>
              <td>{pesagens.has(p.data) ? <button className="apagar" aria-label={`Apagar pesagem de ${dataCurta(p.data)}`} onClick={() => void apagar(p.data)}><Trash2 aria-hidden /></button> : <small>inicial</small>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

function Medidas({ dados, hoje, acoes }: PropsDaVisao) {
  const { perfil, medidas } = dados
  const diaUm = perfil.diaUm!
  const [data, setData] = useState(hoje)
  const vazio = () => Object.fromEntries(PARTES.map((p) => [p, ''])) as Record<Parte, string>
  const doRegistro = (d: string) => Object.fromEntries(PARTES.map((p) => [p, texto(medidas.get(d)?.[p])])) as Record<Parte, string>
  const [valores, setValores] = useState<Record<Parte, string>>(() => doRegistro(hoje))
  const [tentou, setTentou] = useState(false)
  const [salvo, setSalvo] = useState<string | null>(null)
  const [hojeVisto, setHojeVisto] = useState(hoje)
  if (hojeVisto !== hoje) {
    setHojeVisto(hoje)
    if (data === hojeVisto) {
      setData(hoje)
      setValores(medidas.has(hoje) ? doRegistro(hoje) : vazio())
    }
  }
  const existente = medidas.get(data)
  const invalidas = PARTES.filter((p) => valores[p].trim() !== '' && medidaValida(valores[p]) === null)
  const preenchidas = PARTES.filter((p) => valores[p].trim() !== '')
  const variacao = variacaoDasMedidas([...medidas.values()])
  const lista = [...medidas.values()].sort((a, b) => b.data.localeCompare(a.data))

  const mudarData = (d: string) => {
    setData(d)
    setValores(medidas.has(d) ? doRegistro(d) : vazio())
    setTentou(false)
    setSalvo(null)
  }
  const salvar = async () => {
    setTentou(true)
    if (invalidas.length || preenchidas.length === 0) return
    const m: Medida = { data }
    for (const p of preenchidas) m[p] = medidaValida(valores[p])!
    if (await acoes.salvarMedida(m)) {
      setSalvo(`Medidas de ${dataCurta(data)} salvas.`)
      setTentou(false)
    }
  }
  const apagar = async (d: string) => {
    if (!window.confirm(`Apagar as medidas de ${dataCurta(d)}? Não dá para desfazer.`)) return
    if (await acoes.apagarMedida(d) && d === data) setValores(vazio())
  }

  return (
    <>
      {Object.keys(variacao).length > 0 && (
        <dl className="placar quatro">
          {PARTES.map((p) => {
            const v = variacao[p]
            return v ? (
              <div key={p} className={p === 'cintura' ? 'neutro' : undefined}><dt>{NOMES_DAS_PARTES[p]}</dt><dd>{sinal(v.para - v.de)}</dd><small>cm, de {texto(v.de)} para {texto(v.para)}</small></div>
            ) : (
              <div key={p} className="neutro"><dt>{NOMES_DAS_PARTES[p]}</dt><dd>-</dd><small>meça duas vezes para comparar</small></div>
            )
          })}
        </dl>
      )}

      <form className="painel escuro formulario" noValidate onSubmit={(e) => { e.preventDefault(); void salvar() }}>
        <span className="aba">{existente ? 'EDITAR MEDIDAS' : 'REGISTRAR MEDIDAS'}</span>
        <p className="nota" style={{ marginTop: 0 }}>Com fita métrica, de manhã, relaxado. Preencha só o que mediu.</p>
        <div className="campos">
          <CampoData diaUm={diaUm} hoje={hoje} valor={data} aoMudar={mudarData} />
          {PARTES.map((p) => {
            const erro = tentou && invalidas.includes(p)
            return (
              <label className="campo" key={p}>
                {NOMES_DAS_PARTES[p]} (cm)
                <input inputMode="decimal" autoComplete="off" value={valores[p]} aria-invalid={erro} onChange={(e) => { setValores({ ...valores, [p]: e.target.value }); setSalvo(null) }} />
                {erro && <span className="erro" role="alert">Entre 15 e 200 cm.</span>}
              </label>
            )
          })}
        </div>
        {tentou && preenchidas.length === 0 && <p className="aviso" role="alert">Preencha pelo menos uma medida.</p>}
        <button type="submit" className="botao largo" style={{ marginTop: 14 }}>{existente ? 'Atualizar medidas' : 'Salvar medidas'}</button>
        {salvo && <p className="nota" role="status">{salvo}</p>}
      </form>

      <h2 className="secao">REGISTROS</h2>
      {lista.length === 0 ? (
        <p className="nota">Nenhuma medida ainda. Meça a cada duas semanas: o braço e o peito crescendo enquanto a cintura fica parada é o sinal de que o ganho é músculo.</p>
      ) : (
        <table className="tabela">
          <thead><tr><th>Data</th>{PARTES.map((p) => <th key={p}>{NOMES_DAS_PARTES[p]}</th>)}<th><span className="so-leitor">Apagar</span></th></tr></thead>
          <tbody>
            {lista.map((m) => (
              <tr key={m.data}>
                <td><button className="link" onClick={() => mudarData(m.data)} aria-label={`Editar medidas de ${dataCurta(m.data)}`}>{dataCurta(m.data)}</button></td>
                {PARTES.map((p) => <td key={p}>{m[p] === undefined ? '-' : texto(m[p])}</td>)}
                <td><button className="apagar" aria-label={`Apagar medidas de ${dataCurta(m.data)}`} onClick={() => void apagar(m.data)}><Trash2 aria-hidden /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

/** URLs temporárias para mostrar as fotos; são liberadas quando a lista muda ou a tela fecha. */
function useUrls(fotos: Foto[] | undefined): Map<number, string> {
  const [urls, setUrls] = useState<Map<number, string>>(() => new Map())
  useEffect(() => {
    const novas = new Map((fotos ?? []).map((f) => [f.mes, URL.createObjectURL(f.imagem)]))
    // aqui o efeito sincroniza com um recurso de fora do React (URLs de objeto), que é o uso previsto de efeito
    // oxlint-disable-next-line react/set-state-in-effect
    setUrls(novas)
    return () => novas.forEach((u) => URL.revokeObjectURL(u))
  }, [fotos])
  return urls
}

function Fotos({ dados, hoje, acoes }: PropsDaVisao) {
  const diaUm = dados.perfil.diaUm!
  const fotos = useLiveQuery(lerFotos, [dados.mesesComFoto.join(',')])
  const urls = useUrls(fotos)
  const mesAtual = mesDoProjeto(diaUm, hoje)
  const [quadrinho, setQuadrinho] = useState(true)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [antes, setAntes] = useState<number | null>(null)
  const [depois, setDepois] = useState<number | null>(null)
  const entrada = useRef<HTMLInputElement>(null)
  const temDoMes = dados.mesesComFoto.includes(mesAtual)
  const meses = (fotos ?? []).map((f) => f.mes)
  const mesAntes = antes ?? meses[0], mesDepois = depois ?? meses[meses.length - 1]

  const escolher = async (arquivo: File | undefined) => {
    if (!arquivo) return
    if (temDoMes && !window.confirm(`Trocar a foto do mês ${mesAtual}? A foto atual será substituída e não fica guardada em nenhum outro lugar.`)) {
      if (entrada.current) entrada.current.value = ''
      return
    }
    setErro(null)
    setProcessando(true)
    try {
      const imagem = await comprimirImagem(arquivo)
      if (!(await acoes.salvarFoto({ mes: mesAtual, data: hoje, imagem }))) setErro('Não coube no aparelho ou o armazenamento falhou. Libere espaço e tente de novo.')
    } catch (e) {
      setErro(e instanceof ErroDeFoto ? e.message : 'Não consegui usar essa foto. Tente outra.')
    } finally {
      setProcessando(false)
      if (entrada.current) entrada.current.value = ''
    }
  }
  const apagar = async (mes: number) => {
    if (!window.confirm(`Apagar a foto do mês ${mes}? Ela não está guardada em nenhum outro lugar.`)) return
    await acoes.apagarFoto(mes)
  }

  return (
    <>
      <section className="painel azul">
        <span className="aba">FOTO DO MÊS {mesAtual}</span>
        <p>{temDoMes ? 'A foto deste mês já está guardada. Pode trocar se quiser uma melhor.' : `Mesma luz, mesma pose, de frente e sem camisa. A foto do mês rende +${XP_FOTO} XP.`}</p>
        <input ref={entrada} type="file" accept="image/*" className="so-leitor" id="foto-do-mes" onChange={(e) => void escolher(e.target.files?.[0])} disabled={processando} />
        <label htmlFor="foto-do-mes" className={`botao largo ${processando ? 'ocupado' : ''}`} style={{ marginTop: 12 }} aria-disabled={processando}>
          <Camera aria-hidden />{processando ? 'Preparando a foto...' : temDoMes ? 'Trocar a foto do mês' : 'Tirar ou escolher a foto'}
        </label>
        {erro && <p className="aviso" role="alert">{erro}</p>}
      </section>
      <p className="nota" style={{ marginTop: 0 }}>As fotos ficam só neste aparelho, reduzidas e sem a localização. Apagar o app apaga as fotos junto.</p>

      {fotos && fotos.length === 1 && <p className="nota">O antes e depois aparece quando houver fotos de dois meses.</p>}

      {fotos && fotos.length > 0 && (
        <label className="campo marcar" style={{ marginBottom: 18 }}>
          <input type="checkbox" checked={quadrinho} onChange={(e) => setQuadrinho(e.target.checked)} />
          Efeito de quadrinho
        </label>
      )}

      {fotos && fotos.length >= 2 && mesAntes !== undefined && mesDepois !== undefined && (
        <section style={{ marginBottom: 26 }}>
          <h2 className="secao">ANTES E DEPOIS</h2>
          <div className="campos" style={{ marginBottom: 12 }}>
            {(['Antes', 'Depois'] as const).map((rotulo) => (
              <label className="campo" key={rotulo}>
                {rotulo}
                <select value={rotulo === 'Antes' ? mesAntes : mesDepois} onChange={(e) => (rotulo === 'Antes' ? setAntes : setDepois)(Number(e.target.value))}>
                  {meses.map((m) => <option key={m} value={m}>Mês {m}</option>)}
                </select>
              </label>
            ))}
          </div>
          <div className="comparar">
            {[mesAntes, mesDepois].map((m, i) => (
              <figure key={i} className={`quadro-foto ${quadrinho ? 'gibi' : ''}`}>
                <img src={urls.get(m)} alt={`Foto do mês ${m}`} />
                <figcaption>Mês {m}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <h2 className="secao">TODAS AS FOTOS</h2>
      {!fotos ? (
        <p role="status">Abrindo as fotos...</p>
      ) : fotos.length === 0 ? (
        <p className="nota">Nenhuma foto ainda. A do mês 1 é a mais importante: é ela que mostra de onde você saiu.</p>
      ) : (
        <div className="galeria-fotos">
          {fotos.map((f) => (
            <figure key={f.mes} className={`quadro-foto ${quadrinho ? 'gibi' : ''}`}>
              <img src={urls.get(f.mes)} alt={`Foto do mês ${f.mes}, ${dataCurta(f.data)}`} loading="lazy" />
              <figcaption>
                Mês {f.mes}<small>{dataCurta(f.data)}</small>
                <button className="apagar" aria-label={`Apagar foto do mês ${f.mes}`} onClick={() => void apagar(f.mes)}><Trash2 aria-hidden /></button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  )
}

function Heroi({ dados, hoje }: { dados: Dados; hoje: string }) {
  const { perfil } = dados
  const diaUm = perfil.diaUm!
  const dias = diasComTreino(dados.dias, dados.sessoes, hoje)
  const lista = atributos(diaUm, hoje, perfil.rotina, dias, dados.sessoes)
  const registros = montarRegistros(dados, hoje)
  const listaDeConquistas = conquistas(registros)
  const conquistasFeitas = listaDeConquistas.filter((c) => c.feita)
  const capitulos = gibi(registros)
  const xp = jornada(diaUm, hoje, perfil.rotina, dias).xpTotal + xpDaEvolucao(diaUm, hoje, dados.pesagens.keys(), dados.mesesComFoto)
  const progresso = progressoDe(xp)
  const estagio = estagioDoNivel(progresso.nivel)
  return (
    <>
      <section className="heroi" aria-label="Seu herói">
        <div className={`quadro e${estagio}`}><Avatar estagio={estagio} aparencia={perfil.aparencia} /></div>
        <div>
          <div className="nivel">NÍVEL {progresso.nivel}</div>
          <div className="titulo-heroi">{TITULOS[estagio]}</div>
          <div className="xp" role="progressbar" aria-label="Experiência" aria-valuemin={0} aria-valuemax={progresso.xpDoNivel} aria-valuenow={progresso.xpNoNivel}>
            <i style={{ width: `${progresso.xpDoNivel ? (progresso.xpNoNivel / progresso.xpDoNivel) * 100 : 100}%` }} />
          </div>
          <div className="xp-texto"><span>{progresso.xpNoNivel} XP</span><span>{progresso.xpDoNivel || 'máximo'}</span></div>
          <p className="nota" style={{ margin: '6px 0 0' }}>O nível vem do XP. Os atributos abaixo têm níveis próprios.</p>
        </div>
      </section>
      {lista.map((a) => (
        <article key={a.id} className="atributo">
          <header>
            <h3>{a.nome}</h3>
            <span className="nivel-atributo">NÍVEL {a.nivel}</span>
          </header>
          <p className="conta">{a.noNivel} de {a.doNivel} {UNIDADES[a.id]} para o nível {a.nivel + 1}</p>
          <div className="xp" role="progressbar" aria-label={`${a.nome}: progresso no nível`} aria-valuemin={0} aria-valuemax={a.doNivel} aria-valuenow={a.noNivel}>
            <i style={{ width: `${(a.noNivel / a.doNivel) * 100}%` }} />
          </div>
          <p className="nota" style={{ margin: '6px 0 0' }}>
            {a.pontos} {a.fonte} no total. {a.semana > 0 ? `+${a.semana} nos últimos 7 dias.` : 'Nada nos últimos 7 dias.'}
          </p>
        </article>
      ))}

      <h2 className="secao" style={{ marginTop: 30 }}>CONQUISTAS</h2>
      <p className="nota" style={{ marginTop: 0 }}>{conquistasFeitas.length} de {listaDeConquistas.length} desbloqueadas.</p>
      <ul className="conquistas">
        {listaDeConquistas.map((c) => (
          <li key={c.id} className={c.feita ? 'feita' : undefined}>
            {c.feita ? <Trophy aria-hidden /> : <Lock aria-hidden />}
            <span><b>{c.nome}</b><small>{c.descricao}</small></span>
            <span className="so-leitor">{c.feita ? 'Desbloqueada' : 'Bloqueada'}</span>
          </li>
        ))}
      </ul>

      <h2 className="secao" style={{ marginTop: 30 }}>SEU GIBI</h2>
      <p className="nota" style={{ marginTop: 0 }}>Cada dia vencido vira um quadro. Cada fase é um capítulo.</p>
      {capitulos.map((c) => (
        <details key={c.fase} className="capitulo-gibi" open={c.fase === capitulos.length}>
          <summary>
            <span className="capa">
              <small>CAPÍTULO {c.fase}</small>
              <b>{c.titulo.toUpperCase()}</b>
              <small>{c.quadros.length} de {c.diasDaFase} dias vencidos. {c.chefao.derrotado ? `${c.chefao.vilao.nome} derrotado.` : c.chefao.terminou ? `${c.chefao.vilao.nome} escapou.` : `Contra ${c.chefao.vilao.nome}.`}</small>
            </span>
            <ChevronDown aria-hidden />
          </summary>
          {c.quadros.length === 0 ? (
            <p className="nota">Nenhum dia vencido ainda neste capítulo. Vença o primeiro e ele aparece aqui.</p>
          ) : (
            <ol className="quadros">
              {c.quadros.map((q) => (
                <li key={q.numero} className={q.treino ? 'com-treino' : undefined}>
                  <b>DIA {q.numero}</b>
                  <small>{dataCurta(q.data)}</small>
                  <span>{q.treino ? 'POW! treino' : 'Folga'} e {q.refeicoes} refeições</span>
                </li>
              ))}
            </ol>
          )}
        </details>
      ))}
    </>
  )
}
