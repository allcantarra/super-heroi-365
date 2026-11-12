import Dexie, { type Table } from 'dexie'
import { normalizarAparencia, type Aparencia } from '../heroi/aparencia'

/** Registro único com as preferências do usuário. Fica só no aparelho. */
export interface Perfil {
  id: 'eu'
  aparencia: Aparencia
}

class Banco extends Dexie {
  perfil!: Table<Perfil, 'eu'>

  constructor() {
    super('super-heroi-365')
    // Cada etapa do app acrescenta coleções com uma nova versão; nunca edite uma versão já publicada.
    this.version(1).stores({ perfil: 'id' })
  }
}

export const banco = new Banco()

export async function lerAparencia(): Promise<Aparencia> {
  const perfil = await banco.perfil.get('eu')
  return normalizarAparencia(perfil?.aparencia)
}

export async function salvarAparencia(aparencia: Aparencia): Promise<void> {
  await banco.perfil.put({ id: 'eu', aparencia: normalizarAparencia(aparencia) })
}

/** Pede ao navegador para não apagar os dados sob pressão de espaço. Devolve false se não for concedido. */
export async function pedirArmazenamentoPersistente(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false
    return (await navigator.storage.persisted()) || (await navigator.storage.persist())
  } catch {
    return false
  }
}
