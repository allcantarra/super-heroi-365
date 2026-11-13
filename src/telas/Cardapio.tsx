import { ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { alimento, textoQuantidade } from '../conteudo/alimentos'
import { DIAS_DA_SEMANA, FORMATO, METAS, REFEICAO_LIVRE, REFEICOES, type IdRefeicao } from '../conteudo/cardapio'
import type { Categoria, Etiqueta, IdPrato } from '../conteudo/pratos'
import { RECEITAS, type IdReceita, type Receita } from '../conteudo/receitas'
import { ReceitaDoPrato, buscarReceitas, ETIQUETAS, NOME_DA_CATEGORIA } from '../ui/ReceitaDoPrato'
import type { Perfil } from '../dados/banco'
import {
  alternativas, chaveDaTroca, datasDaSemana, fasePara, listaDeCompras, macrosDaData, macrosDoPrato, marmitasDaSemana, prato, pratoDaData,
  pratoOriginal, segundaDe, semanaDe,
} from '../dominio/cardapio'
import { missoesDoDia, type IdMissao } from '../dominio/rotina'
import { FASES, diaDaSemana, numeroDoDia, somarDias, type Fase } from '../dominio/tempo'

interface Props {
  perfil: Perfil
  /** Missões já marcadas hoje, para destacar a próxima refeição. */
  feitasHoje: readonly string[]
  /** Hora do primeiro toque de hoje, para mostrar os horários já ajustados. */
  inicioHoje?: string
  hoje: string
  salvarPerfil: (p: Perfil) => void
}

type Visao = 'dia' | 'semana' | 'receitas' | 'compras'
const VISOES: { id: Visao; nome: string }[] = [{ id: 'dia', nome: 'Dia' }, { id: 'semana', nome: 'Semana' }, { id: 'receitas', nome: 'Receitas' }, { id: 'compras', nome: 'Compras' }]
const inteiro = (n: number) => Math.round(n)
const curta = (data: string) => `${data.slice(8)}/${data.slice(5, 7)}`
const diaCurto = (data: string) => DIAS_DA_SEMANA[diaDaSemana(data)].slice(0, 3).toLowerCase()

export function Cardapio({ perfil, feitasHoje, inicioHoje, hoje, salvarPerfil }: Props) {
  const diaUm = perfil.diaUm!
  const [visao, setVisao] = useState<Visao>('dia')
  const [data, setData] = useState(hoje)
  const [receitaAberta, setReceitaAberta] = useState<IdPrato | null>(null)
  const [semanasAFrente, setSemanasAFrente] = useState(0)

  const abrirReceita = (id: IdPrato) => {
    setReceitaAberta(id)
    setVisao('receitas')
    window.scrollTo(0, 0)
  }
  const trocar = (dataDaTroca: string, refeicao: IdRefeicao, id: IdPrato) => {
    const trocas = { ...perfil.trocas }, chave = chaveDaTroca(diaUm, dataDaTroca, refeicao)
    if (id === pratoOriginal(diaUm, dataDaTroca, refeicao)) delete trocas[chave]
    else trocas[chave] = id
    salvarPerfil({ ...perfil, trocas })
  }

  return (
    <>
      <div className="abas quatro" role="tablist" aria-label="Partes do cardápio">
        {VISOES.map((v) => (
          <button key={v.id} role="tab" aria-selected={visao === v.id} onClick={() => setVisao(v.id)}>{v.nome}</button>
        ))}
      </div>
      {visao === 'dia' && <Dia perfil={perfil} feitasHoje={feitasHoje} inicioHoje={inicioHoje} hoje={hoje} data={data} setData={setData} trocar={trocar} abrirReceita={abrirReceita} />}
      {visao === 'semana' && <Semana perfil={perfil} hoje={hoje} data={data} setData={setData} trocar={trocar} abrirReceita={abrirReceita} verDia={(d) => { setData(d); setVisao('dia'); window.scrollTo(0, 0) }} />}
      {visao === 'receitas' && <Livro fase={fasePara(diaUm, hoje)} aberta={receitaAberta} />}
      {visao === 'compras' && <Compras perfil={perfil} hoje={hoje} semanasAFrente={semanasAFrente} setSemanasAFrente={setSemanasAFrente} salvarPerfil={salvarPerfil} />}
    </>
  )
}

/** Navegação pelo calendário do projeto: dia anterior, data, próximo dia. Não deixa ir para antes do dia 1. */
function SeletorDeData({ diaUm, hoje, data, setData, passo, rotulo }: { diaUm: string; hoje: string; data: string; setData: (d: string) => void; passo: number; rotulo: string }) {
  const ir = (d: string) => setData(d < diaUm ? diaUm : d)
  return (
    <div className="seletor-data">
      <button aria-label={passo === 1 ? 'Dia anterior' : 'Semana anterior'} disabled={data <= diaUm} onClick={() => ir(somarDias(data, -passo))}><ChevronLeft aria-hidden /></button>
      <label>
        <span>{rotulo}</span>
        <input type="date" aria-label="Data" value={data} min={diaUm} onChange={(e) => e.target.value && ir(e.target.value)} />
      </label>
      <button aria-label={passo === 1 ? 'Próximo dia' : 'Próxima semana'} onClick={() => ir(somarDias(data, passo))}><ChevronRight aria-hidden /></button>
      {data !== hoje && <button className="voltar-hoje" onClick={() => setData(hoje)}>Hoje</button>}
    </div>
  )
}

interface PropsDeVisao {
  perfil: Perfil
  hoje: string
  data: string
  setData: (d: string) => void
  trocar: (data: string, refeicao: IdRefeicao, id: IdPrato) => void
  abrirReceita: (id: IdPrato) => void
}

function ListaDeTroca({ rotulo, refeicao, atual, original, aoTrocar }: { rotulo: string; refeicao: IdRefeicao; atual: IdPrato; original: IdPrato; aoTrocar: (id: IdPrato) => void }) {
  return (
    <label className="campo trocar">
      Trocar por
      <select aria-label={rotulo} value={atual} onChange={(e) => aoTrocar(e.target.value as IdPrato)}>
        <option value={atual}>{prato(atual).nome}</option>
        {alternativas(refeicao, atual).map((id) => (
          <option key={id} value={id}>{prato(id).nome}{id === original ? ' (original)' : ''}</option>
        ))}
      </select>
    </label>
  )
}

function Dia({ perfil, feitasHoje, inicioHoje, hoje, data, setData, trocar, abrirReceita }: PropsDeVisao & { feitasHoje: readonly string[]; inicioHoje?: string }) {
  const diaUm = perfil.diaUm!
  const numero = numeroDoDia(diaUm, data), fase = fasePara(diaUm, data), meta = METAS[fase]
  const total = macrosDaData(diaUm, data, perfil.trocas)
  const comoComecou = data === hoje ? { inicio: inicioHoje, feitas: feitasHoje as IdMissao[] } : undefined
  const missoesDaData = missoesDoDia(perfil.rotina, data, comoComecou)
  const horas = Object.fromEntries(missoesDaData.map((m) => [m.id, m]))
  // no dia de hoje, a próxima refeição pendente abre sozinha e ganha destaque
  const refeicaoDeAgora = data === hoje ? REFEICOES.find((r) => !feitasHoje.includes(r)) : undefined

  return (
    <>
      <SeletorDeData diaUm={diaUm} hoje={hoje} data={data} setData={setData} passo={1} rotulo={`Dia ${numero} de 365, ${DIAS_DA_SEMANA[diaDaSemana(data)].toLowerCase()}`} />

      <details className="resumo-fase">
        <summary aria-label="Metas da fase">
          <span><b>{inteiro(total.kcal)} kcal</b> no dia, {inteiro(total.p)} g de proteína<small>Fase {fase}: {FASES[fase].nome}</small></span>
          <ChevronDown aria-hidden />
        </summary>
        <p>{meta.foco}</p>
        <dl className="macros">
          <div><dt>Calorias</dt><dd>{inteiro(total.kcal)}</dd><small>meta {meta.kcal}</small></div>
          <div><dt>Proteína</dt><dd>{inteiro(total.p)} g</dd><small>meta {meta.p} g</small></div>
          <div><dt>Carboidrato</dt><dd>{inteiro(total.c)} g</dd><small>meta {meta.c} g</small></div>
          <div><dt>Gordura</dt><dd>{inteiro(total.g)} g</dd><small>meta {meta.g} g</small></div>
        </dl>
        <ul className="dicas">{meta.dicas.map((d) => <li key={d}>{d}</li>)}</ul>
      </details>

      {REFEICOES.map((refeicao) => {
        const missao = horas[refeicao]
        // num dia ajustado, pré-treino e café podem virar uma refeição só: a que saiu não aparece
        if (!missao) return null
        const id = pratoDaData(diaUm, data, refeicao, perfil.trocas), p = prato(id), m = macrosDoPrato(id, fase)
        const agora = refeicao === refeicaoDeAgora
        return (
          <details key={`${data}-${refeicao}`} className={`refeicao ${agora ? 'agora' : ''}`} open={agora}>
            <summary>
              <span className="hora">{missao.hora}</span>
              <span className="titulo">
                <small>{missao.nome}{agora ? ', agora' : ''}</small>
                {p.nome}
              </span>
              <span className={`formato ${FORMATO[p.categoria] === 'casa' ? '' : 'fora'}`}>{FORMATO[p.categoria]}</span>
              <ChevronDown aria-hidden />
            </summary>
            <ul className="itens">
              {p.itens.map((item) => (
                <li key={item.a}><span>{textoQuantidade(item.a, item.q[fase - 1])}</span>{alimento(item.a).nome}{alimento(item.a).cafeina ? ' (só até 15h)' : ''}</li>
              ))}
            </ul>
            <p className="resumo">{inteiro(m.kcal)} kcal, {inteiro(m.p)} g de proteína, {p.tempo} min. {p.preparo}</p>
            <ReceitaDoPrato id={id} fase={fase} semIngredientes />
            {refeicao === 'almoco' && <p className="resumo">Marmita da semana: trocar aqui troca todos os dias em que ela aparece.</p>}
            <ListaDeTroca rotulo={`Trocar ${missao.nome}`} refeicao={refeicao} atual={id} original={pratoOriginal(diaUm, data, refeicao)} aoTrocar={(novo) => trocar(data, refeicao, novo)} />
            <button className="botao fantasma" onClick={() => abrirReceita(id)}>Ver no livro de receitas</button>
          </details>
        )
      })}

      <section className="painel escuro">
        <span className="aba">{REFEICAO_LIVRE.titulo.toUpperCase()}</span>
        <ul className="dicas">{REFEICAO_LIVRE.regras.map((r) => <li key={r}>{r}</li>)}</ul>
      </section>
      <p className="nota">Calorias e macros são estimativas pela tabela TACO, com margem de cerca de 10%. Nenhum prato leva verdura, legume em pedaço, peixe, fruto do mar ou feijão.</p>
    </>
  )
}

/** Preparo de domingo: as três marmitas da semana, com porções e total a cozinhar. */
function Semana({ perfil, hoje, data, setData, trocar, abrirReceita, verDia }: PropsDeVisao & { verDia: (data: string) => void }) {
  const diaUm = perfil.diaUm!
  const segunda = segundaDe(data), dias = datasDaSemana(segunda)
  const marmitas = marmitasDaSemana(diaUm, segunda, perfil.trocas)

  return (
    <>
      <SeletorDeData diaUm={diaUm} hoje={hoje} data={data} setData={setData} passo={7} rotulo={`Semana ${semanaDe(diaUm, data) + 1}, de ${curta(segunda)} a ${curta(dias[6])}`} />

      <h2 className="secao">MARMITAS DA SEMANA</h2>
      <p className="nota" style={{ marginTop: 0 }}>Três pratos, cozidos de uma vez no domingo. Guarde na geladeira o que for comer até quarta e congele o resto.</p>
      {marmitas.map((m) => {
        const p = prato(m.prato)
        return (
          <article key={m.papel} className="marmita">
            <header>
              <b>{m.datas.length} porções</b>
              <span>{m.datas.map(diaCurto).join(', ')}</span>
            </header>
            <h3>{p.nome}</h3>
            <ul className="itens">
              {p.itens.map((item) => {
                const totalDaSemana = m.datas.reduce((s, d) => s + item.q[fasePara(diaUm, d) - 1], 0)
                return <li key={item.a}><span>{textoQuantidade(item.a, totalDaSemana)}</span>{alimento(item.a).nome}, no total</li>
              })}
            </ul>
            <ListaDeTroca rotulo={`Trocar marmita ${m.papel}`} refeicao="almoco" atual={m.prato} original={pratoOriginal(diaUm, m.datas[0], 'almoco')} aoTrocar={(novo) => trocar(m.datas[0], 'almoco', novo)} />
            <button className="botao fantasma" onClick={() => abrirReceita(m.prato)}>Ver receita</button>
          </article>
        )
      })}

      <h2 className="secao" style={{ marginTop: 30 }}>OS 7 DIAS</h2>
      {dias.map((d) => {
        const antes = d < diaUm
        return (
          <button key={d} className={`linha-dia ${d === hoje ? 'hoje' : ''}`} disabled={antes} onClick={() => verDia(d)} aria-label={`Ver ${DIAS_DA_SEMANA[diaDaSemana(d)]}, ${curta(d)}`}>
            <span className="quando">{diaCurto(d)}<small>{curta(d)}</small></span>
            <span className="pratos">
              {antes ? 'Antes do dia 1' : (
                <>
                  <b>{prato(pratoDaData(diaUm, d, 'almoco', perfil.trocas)).nome}</b>
                  {prato(pratoDaData(diaUm, d, 'jantar', perfil.trocas)).nome}
                </>
              )}
            </span>
          </button>
        )
      })}
      <p className="nota">Toque em um dia para ver as 8 refeições dele.</p>
    </>
  )
}

const REFEICOES_DO_LIVRO = Object.entries(NOME_DA_CATEGORIA) as [Categoria, string][]

/** Livro de receitas: todos os pratos do ano, com busca, filtro por refeição e por etiqueta, e o preparo de domingo. */
function Livro({ fase, aberta }: { fase: Fase; aberta: IdPrato | null }) {
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState<Categoria | ''>(aberta ? prato(aberta).categoria : '')
  const [etiqueta, setEtiqueta] = useState<Etiqueta | ''>('')
  const achados = useMemo(() => buscarReceitas(busca, categoria || undefined, etiqueta || undefined), [busca, categoria, etiqueta])
  const filtrando = busca.trim() !== '' || categoria !== '' || etiqueta !== ''
  const tipos: Receita['tipo'][] = ['Marmita da semana', 'Prato', 'Shake']
  const lista = Object.entries(RECEITAS) as [IdReceita, Receita][]
  return (
    <>
      <div className="livro-filtros">
        <label className="livro-busca">
          <Search aria-hidden />
          <input type="search" aria-label="Buscar receita" placeholder="Buscar: tapioca, frango, pizza..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
        <div className="livro-selects">
          <label className="campo">
            Refeição
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria | '')}>
              <option value="">Todas</option>
              {REFEICOES_DO_LIVRO.map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
            </select>
          </label>
          <label className="campo">
            Tipo
            <select value={etiqueta} onChange={(e) => setEtiqueta(e.target.value as Etiqueta | '')}>
              <option value="">Todos</option>
              {(Object.entries(ETIQUETAS) as [Etiqueta, string][]).map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
            </select>
          </label>
        </div>
      </div>
      <p className="nota livro-conta" role="status">{achados.length === 1 ? '1 receita' : `${achados.length} receitas`}{filtrando ? (achados.length === 1 ? ' encontrada' : ' encontradas') : ' no livro'}. Quantidades da fase {fase}.</p>
      {achados.length === 0 && <p className="treino-vazio">Nenhuma receita com esse filtro. Tente outra palavra.</p>}
      {achados.map((id) => (
        <details key={id} className="receita" open={id === aberta} ref={id === aberta ? (el) => el?.scrollIntoView({ block: 'start' }) : undefined}>
          <summary><span>{prato(id).nome}</span><small>{prato(id).tempo} min</small><ChevronDown aria-hidden /></summary>
          <ReceitaDoPrato id={id} fase={fase} />
        </details>
      ))}

      {!filtrando && tipos.map((tipo) => (
        <section key={tipo}>
          <h2 className="secao">{tipo === 'Marmita da semana' ? 'PREPARO DE DOMINGO' : tipo === 'Prato' ? 'BASES RÁPIDAS' : 'SHAKES DE BASE'}</h2>
          {lista.filter(([, r]) => r.tipo === tipo).map(([id, r]) => (
            <details key={id} className="receita">
              <summary><span>{r.nome}</span><small>{r.tempo}</small><ChevronDown aria-hidden /></summary>
              <p className="resumo">Rende {r.rende}.</p>
              <h4>Ingredientes</h4>
              <ul>{r.ingredientes.map((i) => <li key={i}>{i}</li>)}</ul>
              <h4>Modo de preparo</h4>
              <ol>{r.passos.map((i) => <li key={i}>{i}</li>)}</ol>
            </details>
          ))}
        </section>
      ))}
    </>
  )
}

function Compras({ perfil, hoje, semanasAFrente, setSemanasAFrente, salvarPerfil }: { perfil: Perfil; hoje: string; semanasAFrente: number; setSemanasAFrente: (n: number) => void; salvarPerfil: (p: Perfil) => void }) {
  const diaUm = perfil.diaUm!
  const estaSegunda = segundaDe(hoje)
  // 0 = esta semana, 1 = a próxima, 4 = as próximas quatro
  const segundas = semanasAFrente === 4 ? [1, 2, 3, 4].map((s) => somarDias(estaSegunda, s * 7)) : [somarDias(estaSegunda, semanasAFrente * 7)]
  const datas = segundas.flatMap(datasDaSemana).filter((d) => d >= diaUm)
  const setores = listaDeCompras(diaUm, datas, perfil.trocas)
  const comprados = new Set(perfil.comprados)
  const total = setores.reduce((s, x) => s + x.itens.length, 0)
  const marcados = setores.reduce((s, x) => s + x.itens.filter((i) => comprados.has(i.id)).length, 0)
  const alternar = (id: string) => salvarPerfil({ ...perfil, comprados: comprados.has(id) ? perfil.comprados.filter((x) => x !== id) : [...perfil.comprados, id] })

  return (
    <>
      <div className="campos" style={{ marginBottom: 18 }}>
        <label className="campo largo">
          Comprar para
          <select aria-label="Comprar para" value={semanasAFrente} onChange={(e) => setSemanasAFrente(Number(e.target.value))}>
            <option value={0}>Esta semana ({curta(estaSegunda)} a {curta(somarDias(estaSegunda, 6))})</option>
            <option value={1}>Próxima semana ({curta(somarDias(estaSegunda, 7))} a {curta(somarDias(estaSegunda, 13))})</option>
            <option value={4}>Próximas 4 semanas</option>
          </select>
        </label>
      </div>
      <p className="contador" role="status"><b>{marcados} de {total}</b> itens no carrinho</p>
      <p className="nota" style={{ marginTop: 0 }}>Lista do cardápio dessas datas, com as suas trocas. Carnes, arroz e macarrão já estão em peso cru.</p>
      {setores.map(({ setor, itens }) => (
        <section key={setor} className="setor">
          <h2 className="secao">{setor.toUpperCase()}</h2>
          {/* o que já está no carrinho desce para o fim do setor */}
          {[...itens.filter((i) => !comprados.has(i.id)), ...itens.filter((i) => comprados.has(i.id))].map((i) => (
            <label key={i.id} className={`compra ${comprados.has(i.id) ? 'feita' : ''}`}>
              <input type="checkbox" checked={comprados.has(i.id)} onChange={() => alternar(i.id)} />
              <span>{i.nome}</span>
              <b>{i.texto}</b>
            </label>
          ))}
        </section>
      ))}
      <div className="rodape-tela">
        <button className="botao fantasma" disabled={marcados === 0} onClick={() => salvarPerfil({ ...perfil, comprados: [] })}>Limpar marcações</button>
      </div>
    </>
  )
}
