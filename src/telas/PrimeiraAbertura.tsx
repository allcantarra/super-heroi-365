import { TriangleAlert } from 'lucide-react'
import { useRef, useState } from 'react'
import { LIMITES, type Perfil, type Pessoa } from '../dados/banco'
import { ROTULOS_ROTINA, missoesDoDia, validarRotina, type Rotina } from '../dominio/rotina'
import { dataValida } from '../dominio/tempo'
import { Avatar } from '../heroi/Avatar'
import { CABELOS, CORTES, PELES, UNIFORMES, type Aparencia } from '../heroi/aparencia'

interface Props {
  perfil: Perfil
  hoje: string
  /** Modo edição: o usuário já passou pela primeira abertura e pode cancelar. */
  editando: boolean
  aoSalvar: (perfil: Perfil) => void
  aoCancelar: () => void
}

type CampoPessoa = keyof Pessoa
const CAMPOS_PESSOA: { campo: CampoPessoa; rotulo: string; limite: readonly [number, number]; unidade: string }[] = [
  { campo: 'pesoInicial', rotulo: 'Peso de hoje (kg)', limite: LIMITES.peso, unidade: 'kg' },
  { campo: 'metaPeso', rotulo: 'Meta de peso (kg)', limite: LIMITES.peso, unidade: 'kg' },
  { campo: 'altura', rotulo: 'Altura (cm)', limite: LIMITES.altura, unidade: 'cm' },
  { campo: 'idade', rotulo: 'Idade', limite: LIMITES.idade, unidade: 'anos' },
]

const numero = (texto: string): number => Number(texto.trim().replace(',', '.'))

function validarPessoa(textos: Record<CampoPessoa, string>): { erros: Partial<Record<CampoPessoa, string>>; pessoa: Pessoa | null } {
  const erros: Partial<Record<CampoPessoa, string>> = {}
  const valores = {} as Pessoa
  for (const { campo, limite, unidade } of CAMPOS_PESSOA) {
    const v = numero(textos[campo])
    if (textos[campo].trim() === '' || !Number.isFinite(v)) erros[campo] = 'Informe um número.'
    else if (v < limite[0] || v > limite[1]) erros[campo] = `Entre ${limite[0]} e ${limite[1]} ${unidade}.`
    else valores[campo] = v
  }
  return { erros, pessoa: Object.keys(erros).length ? null : valores }
}

const ROTINA_CAMPOS = Object.keys(ROTULOS_ROTINA) as (keyof Rotina)[]

export function PrimeiraAbertura({ perfil, hoje, editando, aoSalvar, aoCancelar }: Props) {
  const [passo, setPasso] = useState(1)
  const [textos, setTextos] = useState<Record<CampoPessoa, string>>(() => ({
    pesoInicial: perfil.pessoa ? String(perfil.pessoa.pesoInicial).replace('.', ',') : '',
    metaPeso: perfil.pessoa ? String(perfil.pessoa.metaPeso).replace('.', ',') : '',
    altura: perfil.pessoa ? String(perfil.pessoa.altura) : '',
    idade: perfil.pessoa ? String(perfil.pessoa.idade) : '',
  }))
  const [rotina, setRotina] = useState<Rotina>(perfil.rotina)
  const [aparencia, setAparencia] = useState<Aparencia>(perfil.aparencia)
  const [diaUm, setDiaUm] = useState(perfil.diaUm ?? hoje)
  const [som, setSom] = useState(perfil.som)
  const [tentou, setTentou] = useState(false)
  const formulario = useRef<HTMLFormElement>(null)

  const pessoa = validarPessoa(textos)
  const errosRotina = validarRotina(rotina)
  const erroDia = !dataValida(diaUm) ? 'Informe a data.' : diaUm > hoje ? 'O dia 1 não pode ser no futuro.' : undefined
  const invalido = passo === 1 ? !pessoa.pessoa : passo === 2 ? Object.keys(errosRotina).length > 0 : !!erroDia

  const avancar = () => {
    if (invalido) {
      setTentou(true)
      requestAnimationFrame(() => formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    setTentou(false)
    if (passo < 3) {
      setPasso(passo + 1)
      window.scrollTo(0, 0)
    } else {
      aoSalvar({ ...perfil, pessoa: pessoa.pessoa, rotina, aparencia, diaUm, som })
    }
  }
  const voltar = () => {
    setTentou(false)
    if (passo > 1) setPasso(passo - 1)
    else aoCancelar()
  }
  const lista = <K extends keyof Aparencia>(rotulo: string, campo: K, opcoes: readonly Aparencia[K][]) => (
    <label className="campo">
      {rotulo}
      <select value={aparencia[campo]} onChange={(e) => setAparencia({ ...aparencia, [campo]: e.target.value as Aparencia[K] })}>
        {opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )

  return (
    <form
      ref={formulario}
      className="abertura"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        avancar()
      }}
    >
      <div className="capitulo">{editando ? 'AJUSTES' : 'PRIMEIRA ABERTURA'}, PASSO {passo} DE 3</div>

      {passo === 1 && (
        <>
          <h1>Quem está por trás da máscara</h1>
          <p>Esses dados ficam só neste aparelho. Eles servem para calcular suas metas e medir sua evolução.</p>
          <div className="campos" style={{ marginBottom: 26 }}>
            {CAMPOS_PESSOA.map(({ campo, rotulo }) => {
              const erro = tentou ? pessoa.erros[campo] : undefined
              return (
                <label className="campo" key={campo}>
                  {rotulo}
                  <input
                    inputMode="decimal"
                    autoComplete="off"
                    value={textos[campo]}
                    aria-invalid={!!erro}
                    onChange={(e) => setTextos({ ...textos, [campo]: e.target.value })}
                  />
                  {erro && <span className="erro" role="alert"><TriangleAlert aria-hidden />{erro}</span>}
                </label>
              )
            })}
          </div>
          <div className="painel escuro">
            <span className="aba">ANTES DE COMEÇAR</span>
            <p>Sem apetite ou sem disposição? Faça um exame de sangue e fale com um médico antes de treinar ou de usar creatina e guaraná.</p>
          </div>
        </>
      )}

      {passo === 2 && (
        <>
          <h1>Sua rotina</h1>
          <p>O app monta os horários das missões a partir do seu dia. Dá para mudar depois.</p>
          <div className="campos" style={{ marginBottom: 30 }}>
            {ROTINA_CAMPOS.map((campo) => {
              const erro = tentou ? errosRotina[campo] : undefined
              return (
                <label className="campo" key={campo}>
                  {ROTULOS_ROTINA[campo]}
                  <input type="time" value={rotina[campo]} aria-invalid={!!erro} onChange={(e) => setRotina({ ...rotina, [campo]: e.target.value })} />
                  {erro && <span className="erro" role="alert"><TriangleAlert aria-hidden />{erro}</span>}
                </label>
              )
            })}
          </div>
          {Object.keys(errosRotina).length === 0 && (
            <div className="painel azul">
              <span className="aba">SEU DIA VAI FICAR ASSIM</span>
              <ul className="previa">
                {missoesDoDia(rotina, '2026-11-09').map((m) => (
                  <li key={m.id}><span>{m.hora}</span><span>{m.nome}</span></li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {passo === 3 && (
        <>
          <h1>Seu herói</h1>
          <p>Ele começa como civil e evolui conforme você cumpre as missões.</p>
          <div className="quadro e2 central"><Avatar estagio={2} aparencia={aparencia} /></div>
          <div className="campos" style={{ marginBottom: 26 }}>
            {lista('Pele', 'pele', Object.keys(PELES) as Aparencia['pele'][])}
            {lista('Cabelo', 'cabelo', Object.keys(CABELOS) as Aparencia['cabelo'][])}
            {lista('Corte', 'corte', CORTES)}
            {lista('Uniforme', 'uniforme', Object.keys(UNIFORMES) as Aparencia['uniforme'][])}
            <label className="campo largo">
              Dia 1 do projeto
              <input type="date" value={diaUm} max={hoje} aria-invalid={tentou && !!erroDia} onChange={(e) => setDiaUm(e.target.value)} />
              {tentou && erroDia && <span className="erro" role="alert"><TriangleAlert aria-hidden />{erroDia}</span>}
            </label>
            <label className="campo marcar largo">
              <input type="checkbox" checked={som} onChange={(e) => setSom(e.target.checked)} />
              Som ao cumprir missão
            </label>
          </div>
        </>
      )}

      <div className="acoes">
        {(passo > 1 || editando) && <button type="button" className="botao fantasma" onClick={voltar}>{passo > 1 ? 'Voltar' : 'Cancelar'}</button>}
        <button type="submit" className="botao principal">{passo < 3 ? 'Continuar' : editando ? 'Salvar ajustes' : 'Começar'}</button>
      </div>
    </form>
  )
}
