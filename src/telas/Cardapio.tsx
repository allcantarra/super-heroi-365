import { useState } from 'react'
import { alimento, textoQuantidade } from '../conteudo/alimentos'
import { DIAS_DA_SEMANA, FORMATO, METAS, MODELOS, REFEICAO_LIVRE, REFEICOES, type IdRefeicao } from '../conteudo/cardapio'
import { RECEITAS, type IdReceita, type Receita } from '../conteudo/receitas'
import type { Perfil } from '../dados/banco'
import { alternativas, chaveDaTroca, listaDeCompras, macrosDoDia, macrosDoPrato, prato, pratoDoDia } from '../dominio/cardapio'
import { missoesDoDia } from '../dominio/rotina'
import { FASES, diaDaSemana, faseDoDia, numeroDoDia, somarDias, type Fase } from '../dominio/tempo'
import type { IdPrato } from '../conteudo/pratos'

interface Props {
  perfil: Perfil
  hoje: string
  salvarPerfil: (p: Perfil) => void
}

type Visao = 'dia' | 'receitas' | 'compras'
const VISOES: { id: Visao; nome: string }[] = [{ id: 'dia', nome: 'Dia' }, { id: 'receitas', nome: 'Receitas' }, { id: 'compras', nome: 'Compras' }]
const NUMEROS_DE_FASE: Fase[] = [1, 2, 3, 4]
const inteiro = (n: number) => Math.round(n)

export function Cardapio({ perfil, hoje, salvarPerfil }: Props) {
  const faseAtual = faseDoDia(numeroDoDia(perfil.diaUm!, hoje))
  const [visao, setVisao] = useState<Visao>('dia')
  const [fase, setFase] = useState<Fase>(faseAtual)
  const [dia, setDia] = useState(diaDaSemana(hoje))
  const [receitaAberta, setReceitaAberta] = useState<IdReceita | null>(null)
  const [semanas, setSemanas] = useState(1)

  const abrirReceita = (id: IdReceita) => {
    setReceitaAberta(id)
    setVisao('receitas')
    window.scrollTo(0, 0)
  }

  return (
    <>
      <div className="abas" role="tablist" aria-label="Partes do cardápio">
        {VISOES.map((v) => (
          <button key={v.id} role="tab" aria-selected={visao === v.id} onClick={() => setVisao(v.id)}>{v.nome}</button>
        ))}
      </div>
      {visao === 'dia' && <Dia perfil={perfil} hoje={hoje} fase={fase} faseAtual={faseAtual} dia={dia} setFase={setFase} setDia={setDia} salvarPerfil={salvarPerfil} abrirReceita={abrirReceita} />}
      {visao === 'receitas' && <Receitas aberta={receitaAberta} />}
      {visao === 'compras' && <Compras perfil={perfil} fase={faseAtual} semanas={semanas} setSemanas={setSemanas} salvarPerfil={salvarPerfil} />}
    </>
  )
}

function Dia({ perfil, hoje, fase, faseAtual, dia, setFase, setDia, salvarPerfil, abrirReceita }: {
  perfil: Perfil
  hoje: string
  fase: Fase
  faseAtual: Fase
  dia: number
  setFase: (f: Fase) => void
  setDia: (d: number) => void
  salvarPerfil: (p: Perfil) => void
  abrirReceita: (id: IdReceita) => void
}) {
  const meta = METAS[fase]
  const total = macrosDoDia(dia, fase, perfil.trocas)
  // uma data com o mesmo dia da semana, só para montar os horários (domingo não tem treino)
  const dataDoDia = somarDias(hoje, (dia - diaDaSemana(hoje) + 7) % 7)
  const horas = Object.fromEntries(missoesDoDia(perfil.rotina, dataDoDia).map((m) => [m.id, m]))

  const trocar = (refeicao: IdRefeicao, id: IdPrato) => {
    const trocas = { ...perfil.trocas }
    if (id === MODELOS[dia][refeicao]) delete trocas[chaveDaTroca(dia, refeicao)]
    else trocas[chaveDaTroca(dia, refeicao)] = id
    salvarPerfil({ ...perfil, trocas })
  }

  return (
    <>
      <div className="campos" style={{ marginBottom: 22 }}>
        <label className="campo">
          Fase
          <select aria-label="Fase" value={fase} onChange={(e) => setFase(Number(e.target.value) as Fase)}>
            {NUMEROS_DE_FASE.map((f) => <option key={f} value={f}>{f}. {FASES[f].nome}{f === faseAtual ? ' (atual)' : ''}</option>)}
          </select>
        </label>
        <label className="campo">
          Dia
          <select aria-label="Dia da semana" value={dia} onChange={(e) => setDia(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => <option key={d} value={d}>{DIAS_DA_SEMANA[d]}{d === diaDaSemana(hoje) ? ' (hoje)' : ''}</option>)}
          </select>
        </label>
      </div>

      <section className="painel azul" aria-label="Metas da fase">
        <span className="aba">FASE {fase}: {FASES[fase].nome.toUpperCase()}</span>
        <p>{meta.foco}</p>
        <dl className="macros">
          <div><dt>Calorias</dt><dd>{inteiro(total.kcal)}</dd><small>meta {meta.kcal}</small></div>
          <div><dt>Proteína</dt><dd>{inteiro(total.p)} g</dd><small>meta {meta.p} g</small></div>
          <div><dt>Carboidrato</dt><dd>{inteiro(total.c)} g</dd><small>meta {meta.c} g</small></div>
          <div><dt>Gordura</dt><dd>{inteiro(total.g)} g</dd><small>meta {meta.g} g</small></div>
        </dl>
        <ul className="dicas">{meta.dicas.map((d) => <li key={d}>{d}</li>)}</ul>
      </section>

      {REFEICOES.map((refeicao) => {
        const id = pratoDoDia(dia, refeicao, perfil.trocas), p = prato(id), m = macrosDoPrato(id, fase), missao = horas[refeicao]
        const trocado = id !== MODELOS[dia][refeicao]
        return (
          <article key={refeicao} className="refeicao">
            <header>
              <span className="hora">{missao.hora}</span>
              <span className="qual">{missao.nome}</span>
              <span className={`formato ${FORMATO[p.categoria] === 'casa' ? '' : 'fora'}`}>{FORMATO[p.categoria]}</span>
            </header>
            <h3>{p.nome}</h3>
            <ul className="itens">
              {p.itens.map((item) => (
                <li key={item.a}><span>{textoQuantidade(item.a, item.q[fase - 1])}</span>{alimento(item.a).nome}{alimento(item.a).cafeina ? ' (só até 15h)' : ''}</li>
              ))}
            </ul>
            <p className="resumo">{inteiro(m.kcal)} kcal, {inteiro(m.p)} g de proteína. {p.preparo}</p>
            <div className="acoes-refeicao">
              <label className="campo">
                Trocar por
                <select aria-label={`Trocar ${missao.nome}`} value={id} onChange={(e) => trocar(refeicao, e.target.value as IdPrato)}>
                  <option value={id}>{p.nome}{trocado ? '' : ' (do cardápio)'}</option>
                  {alternativas(refeicao, id, fase).map((alt) => (
                    <option key={alt.id} value={alt.id}>{prato(alt.id).nome}{alt.id === MODELOS[dia][refeicao] ? ' (do cardápio)' : ''}</option>
                  ))}
                </select>
              </label>
              {'receita' in p && p.receita && <button className="botao fantasma" onClick={() => abrirReceita(p.receita as IdReceita)}>Ver receita</button>}
            </div>
          </article>
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

function Receitas({ aberta }: { aberta: IdReceita | null }) {
  const tipos: Receita['tipo'][] = ['Marmita da semana', 'Prato', 'Shake']
  const titulos: Record<Receita['tipo'], string> = { 'Marmita da semana': 'MARMITAS DA SEMANA', Prato: 'PRATOS RÁPIDOS', Shake: 'SHAKES E VITAMINAS' }
  const lista = Object.entries(RECEITAS) as [IdReceita, Receita][]
  return (
    <>
      {tipos.map((tipo) => (
        <section key={tipo}>
          <h2 className="secao">{titulos[tipo]}</h2>
          {lista.filter(([, r]) => r.tipo === tipo).map(([id, r]) => (
            <details key={id} className="receita" open={id === aberta}>
              <summary><span>{r.nome}</span><small>{r.tempo}</small></summary>
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

function Compras({ perfil, fase, semanas, setSemanas, salvarPerfil }: { perfil: Perfil; fase: Fase; semanas: number; setSemanas: (n: number) => void; salvarPerfil: (p: Perfil) => void }) {
  const setores = listaDeCompras(fase, perfil.trocas, semanas)
  const comprados = new Set(perfil.comprados)
  const total = setores.reduce((s, x) => s + x.itens.length, 0)
  const marcados = setores.reduce((s, x) => s + x.itens.filter((i) => comprados.has(i.id)).length, 0)
  const alternar = (id: string) => salvarPerfil({ ...perfil, comprados: comprados.has(id) ? perfil.comprados.filter((x) => x !== id) : [...perfil.comprados, id] })

  return (
    <>
      <div className="campos" style={{ marginBottom: 18 }}>
        <label className="campo largo">
          Comprar para
          <select aria-label="Comprar para" value={semanas} onChange={(e) => setSemanas(Number(e.target.value))}>
            <option value={1}>1 semana</option>
            <option value={4}>1 mês (4 semanas)</option>
          </select>
        </label>
      </div>
      <p className="nota" style={{ marginTop: 0 }}>Fase {fase}, com as suas trocas de prato. Carnes, arroz e macarrão já estão em peso cru. {marcados} de {total} itens no carrinho.</p>
      {setores.map(({ setor, itens }) => (
        <section key={setor} className="setor">
          <h2 className="secao">{setor.toUpperCase()}</h2>
          {itens.map((i) => (
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
