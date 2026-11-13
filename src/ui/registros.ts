import type { Dados } from '../dados/useDados'
import type { Registros } from '../dominio/campanha'
import { jornada } from '../dominio/dia'
import { xpDaEvolucao } from '../dominio/evolucao'
import { diasComTreino } from '../dominio/treino'

/** Junta o que o jogo precisa: dias com o treino derivado das sessões e o XP total do projeto. */
export function montarRegistros(dados: Dados, hoje: string): Registros {
  const { perfil } = dados
  const diaUm = perfil.diaUm!
  const dias = diasComTreino(dados.dias, dados.sessoes, hoje)
  const xpTotal = jornada(diaUm, hoje, perfil.rotina, dias).xpTotal + xpDaEvolucao(diaUm, hoje, dados.pesagens.keys(), dados.mesesComFoto)
  return {
    diaUm, hoje, rotina: perfil.rotina, pesoInicial: perfil.pessoa!.pesoInicial,
    dias, sessoes: dados.sessoes, pesagens: dados.pesagens, mesesComFoto: dados.mesesComFoto, xpTotal,
  }
}

const CHAVE_BACKUP = 'ultimo-backup'

/** Data (AAAA-MM-DD) do último backup feito neste aparelho, ou null. Guardado fora do banco: é só um lembrete. */
export function ultimoBackup(): string | null {
  try {
    const v = localStorage.getItem(CHAVE_BACKUP)
    return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null
  } catch {
    return null
  }
}

export function registrarBackup(data: string): void {
  try {
    localStorage.setItem(CHAVE_BACKUP, data)
  } catch {
    // sem localStorage o lembrete de backup só aparece de novo; nada se perde
  }
}
