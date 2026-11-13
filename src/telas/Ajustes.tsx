import { ArrowLeft, CalendarPlus, Download, Save, Upload, UserCog } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ErroDeBackup, TAMANHO_MAXIMO, lerArquivoDeBackup, montarBackup, nomeDoArquivo, restaurar, resumoDoAparelho, type ConteudoRestauravel } from '../dados/backup'
import type { Perfil } from '../dados/banco'
import { gerarIcs, opcoesDeLembrete } from '../dominio/lembretes'
import type { IdMissao } from '../dominio/rotina'
import { dataCurta, dataLocal, diasEntre } from '../dominio/tempo'
import { entregarArquivo, lerTexto } from '../ui/arquivo'
import { registrarBackup, ultimoBackup } from '../ui/registros'

interface Props {
  perfil: Perfil
  hoje: string
  voltar: () => void
  editarPerfil: () => void
}

type Resumo = Awaited<ReturnType<typeof resumoDoAparelho>>
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`
const descrever = (r: Pick<Resumo, 'dias' | 'treinos' | 'pesagens' | 'medidas' | 'fotos'>) =>
  [plural(r.dias, 'dia', 'dias'), plural(r.treinos, 'treino', 'treinos'), plural(r.pesagens, 'pesagem', 'pesagens'), plural(r.medidas, 'medida', 'medidas'), plural(r.fotos, 'foto', 'fotos')].join(', ')

export function Ajustes({ perfil, hoje, voltar, editarPerfil }: Props) {
  return (
    <>
      <button className="voltar" onClick={voltar}><ArrowLeft aria-hidden />Voltar para o dia</button>
      <h1 className="titulo-tela">Ajustes</h1>

      <section className="painel escuro ajuste">
        <span className="aba">ROTINA, PERFIL E HERÓI</span>
        <p>Horários do dia, peso e meta, aparência do herói, dia 1 e som.</p>
        <button className="botao largo" onClick={editarPerfil}><UserCog aria-hidden />Editar rotina e perfil</button>
      </section>

      <Lembretes perfil={perfil} hoje={hoje} />
      <Backup hoje={hoje} />
    </>
  )
}

function Lembretes({ perfil, hoje }: { perfil: Perfil; hoje: string }) {
  const opcoes = opcoesDeLembrete(perfil.rotina)
  const [escolhidas, setEscolhidas] = useState<IdMissao[]>(() => opcoes.map((o) => o.id))
  const [estado, setEstado] = useState<string | null>(null)
  const alternar = (id: IdMissao) => setEscolhidas(escolhidas.includes(id) ? escolhidas.filter((x) => x !== id) : [...escolhidas, id])

  const gerar = async () => {
    const ics = gerarIcs(perfil.rotina, escolhidas, hoje, perfil.diaUm!, new Date(), location.href.split('#')[0])
    const r = await entregarArquivo('super-heroi-365-lembretes.ics', 'text/calendar', ics)
    setEstado(r === 'cancelado' ? null : 'Arquivo gerado. Abra no Calendário e toque em "Adicionar tudo".')
  }

  return (
    <section className="painel escuro ajuste">
      <span className="aba">LEMBRETES NO CALENDÁRIO</span>
      <p>O app gera um arquivo com um alarme na hora de cada missão, nos dias úteis e no fim de semana, até o fim do projeto. Você importa uma vez no Calendário do iPhone. Os alarmes não acompanham o ajuste automático do dia.</p>
      <fieldset className="escolhas">
        <legend className="so-leitor">Missões com lembrete</legend>
        {opcoes.map((o) => (
          <label key={o.id} className="campo marcar">
            <input type="checkbox" checked={escolhidas.includes(o.id)} onChange={() => alternar(o.id)} />
            <span className="hora-lembrete">{o.hora}<small>{o.horaFim} no fds</small></span>{o.nome}
          </label>
        ))}
      </fieldset>
      <button className="botao largo" disabled={escolhidas.length === 0} onClick={() => void gerar()}><CalendarPlus aria-hidden />Gerar lembretes</button>
      {estado && <p className="nota" role="status">{estado}</p>}
      <p className="nota">Mudou a rotina? Apague o calendário "Super-Herói 365" antigo no app Calendário e gere de novo, senão os alarmes repetem.</p>
    </section>
  )
}

type Restauracao = { fase: 'nada' } | { fase: 'erro'; mensagem: string } | { fase: 'confirmar'; conteudo: ConteudoRestauravel } | { fase: 'restaurando' } | { fase: 'feito'; resumo: string }

function Backup({ hoje }: { hoje: string }) {
  // o diálogo de restaurar compara o aparelho com o arquivo
  const [aparelho, setAparelho] = useState<Resumo | null>(null)
  const [ultimo, setUltimo] = useState(ultimoBackup)
  const [exportando, setExportando] = useState(false)
  /** Arquivo pronto, esperando o segundo toque: o iPhone só abre a folha de compartilhar direto de um toque. */
  const [pronto, setPronto] = useState<{ nome: string; texto: string; data: string } | null>(null)
  const [salvo, setSalvo] = useState(false)
  const [erroExportar, setErroExportar] = useState<string | null>(null)
  const [restauracao, setRestauracao] = useState<Restauracao>({ fase: 'nada' })
  const entrada = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let ativo = true
    void resumoDoAparelho().then((r) => ativo && setAparelho(r))
    return () => {
      ativo = false
    }
  }, [restauracao.fase])

  const montar = async () => {
    setExportando(true)
    setErroExportar(null)
    setSalvo(false)
    try {
      const agora = new Date()
      setPronto({ nome: nomeDoArquivo(agora), texto: JSON.stringify(await montarBackup(agora)), data: dataLocal(agora) })
    } catch {
      setErroExportar('Não consegui montar o backup. Tente de novo.')
    } finally {
      setExportando(false)
    }
  }
  const salvar = async () => {
    if (!pronto) return
    const r = await entregarArquivo(pronto.nome, 'application/json', pronto.texto)
    if (r === 'cancelado') return
    // só conta como feito quando o arquivo saiu do app
    registrarBackup(pronto.data)
    setUltimo(pronto.data)
    setPronto(null)
    setSalvo(true)
  }

  const escolher = async (arquivo: File | undefined) => {
    if (entrada.current) entrada.current.value = ''
    if (!arquivo) return
    if (arquivo.size > TAMANHO_MAXIMO * 1.4) {
      setRestauracao({ fase: 'erro', mensagem: 'Arquivo grande demais para ser um backup deste app.' })
      return
    }
    try {
      setRestauracao({ fase: 'confirmar', conteudo: lerArquivoDeBackup(await lerTexto(arquivo)) })
    } catch (e) {
      setRestauracao({ fase: 'erro', mensagem: e instanceof ErroDeBackup ? e.message : 'Não consegui ler esse arquivo.' })
    }
  }

  const confirmar = async (conteudo: ConteudoRestauravel) => {
    setRestauracao({ fase: 'restaurando' })
    try {
      await restaurar(conteudo)
      setRestauracao({ fase: 'feito', resumo: descrever({ dias: conteudo.dias.length, treinos: conteudo.sessoes.length, pesagens: conteudo.pesagens.length, medidas: conteudo.medidas.length, fotos: conteudo.fotos.length }) })
    } catch {
      setRestauracao({ fase: 'erro', mensagem: 'A restauração falhou e nada foi alterado. Libere espaço no aparelho e tente de novo.' })
    }
  }

  return (
    <section className="painel escuro ajuste">
      <span className="aba">BACKUP</span>
      <p>Tudo fica só neste aparelho. O backup junta dias, treinos, pesos, medidas e fotos num arquivo para guardar no iCloud Drive ou no computador.</p>
      {aparelho && <p className="nota" style={{ marginTop: 0 }}>Neste aparelho: {descrever(aparelho)}.</p>}
      <p className={!ultimo || diasEntre(ultimo, hoje) > 7 ? 'aviso' : 'estado-backup'} role="status">{ultimo ? `Último backup: ${dataCurta(ultimo)}${ultimo === hoje ? ' (hoje)' : ''}.` : 'Nenhum backup feito neste aparelho.'}</p>
      {salvo && <p className="aviso ok" role="status">Backup salvo. Confira em Arquivos se ele está lá antes de confiar nele.</p>}
      {pronto ? (
        <>
          <p className="aviso ok" role="status">Backup pronto ({(pronto.texto.length / 1024 / 1024).toFixed(1).replace('.', ',')} MB). Toque para guardar em Arquivos ou no iCloud Drive. Ele tem suas fotos: não mande por aplicativo de mensagem.</p>
          <button className="botao largo" onClick={() => void salvar()}><Save aria-hidden />Salvar o arquivo</button>
        </>
      ) : (
        <button className="botao largo" disabled={exportando} onClick={() => void montar()}><Download aria-hidden />{exportando ? 'Montando o backup...' : 'Fazer backup agora'}</button>
      )}
      {erroExportar && <p className="aviso" role="alert">{erroExportar}</p>}

      <input ref={entrada} id="arquivo-backup" type="file" accept="application/json,.json" className="so-leitor" onChange={(e) => void escolher(e.target.files?.[0])} />
      <label htmlFor="arquivo-backup" className="botao largo fantasma" style={{ marginTop: 12 }}><Upload aria-hidden />Restaurar de um arquivo</label>

      {restauracao.fase === 'erro' && <p className="aviso" role="alert">{restauracao.mensagem}</p>}
      {restauracao.fase === 'confirmar' && (
        <div className="confirmar" role="alertdialog" aria-labelledby="titulo-restaurar" aria-describedby="texto-restaurar">
          <h2 id="titulo-restaurar">Substituir tudo neste aparelho?</h2>
          {aparelho && <p className="comparacao"><b>Neste aparelho:</b> {descrever(aparelho)}.</p>}
          <p id="texto-restaurar">
            <b>No arquivo:</b> {descrever({ dias: restauracao.conteudo.dias.length, treinos: restauracao.conteudo.sessoes.length, pesagens: restauracao.conteudo.pesagens.length, medidas: restauracao.conteudo.medidas.length, fotos: restauracao.conteudo.fotos.length })}.
            Tudo o que está no aparelho agora será apagado e trocado pelo arquivo. Não dá para desfazer. Na dúvida, cancele e faça um backup do aparelho antes.
            {restauracao.conteudo.descartados > 0 && ` ${plural(restauracao.conteudo.descartados, 'registro estava danificado e vai ficar', 'registros estavam danificados e vão ficar')} de fora.`}
          </p>
          <div className="acoes">
            <button className="botao fantasma" onClick={() => setRestauracao({ fase: 'nada' })}>Cancelar</button>
            <button className="botao perigo principal" onClick={() => void confirmar(restauracao.conteudo)}>Substituir tudo</button>
          </div>
        </div>
      )}
      {restauracao.fase === 'restaurando' && <p className="nota" role="status">Restaurando...</p>}
      {restauracao.fase === 'feito' && <p className="aviso ok" role="status">Backup restaurado: {restauracao.resumo}.</p>}
    </section>
  )
}
