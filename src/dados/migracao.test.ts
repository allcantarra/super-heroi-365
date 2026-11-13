import { expect, it } from 'vitest'

/** Cria o banco como a etapa 3 publicou (versão 2 do Dexie = versão 20 do IndexedDB), com dados. */
function bancoDaEtapa3(): Promise<void> {
  return new Promise((resolver, falhar) => {
    const pedido = indexedDB.open('super-heroi-365', 20)
    pedido.onupgradeneeded = () => {
      pedido.result.createObjectStore('perfil', { keyPath: 'id' })
      pedido.result.createObjectStore('dias', { keyPath: 'data' })
    }
    pedido.onerror = () => falhar(pedido.error)
    pedido.onsuccess = () => {
      const tx = pedido.result.transaction(['perfil', 'dias'], 'readwrite')
      tx.objectStore('perfil').put({ id: 'eu', pessoa: { pesoInicial: 60, metaPeso: 70, altura: 175, idade: 30 }, diaUm: '2026-11-09', comprados: ['arroz'] })
      tx.objectStore('dias').put({ data: '2026-11-09', feitas: ['pre', 'treino'], copos: 3 })
      tx.oncomplete = () => {
        pedido.result.close()
        resolver()
      }
    }
  })
}

it('quem já usava o app na etapa 3 abre a etapa 4 sem perder nada, e a marca manual de treino continua', async () => {
  await bancoDaEtapa3()
  const { lerDias, lerPerfil, lerSessoes } = await import('./banco')
  expect((await lerPerfil()).diaUm).toBe('2026-11-09')
  expect((await lerPerfil()).comprados).toEqual(['arroz'])
  expect((await lerDias()).get('2026-11-09')).toEqual({ data: '2026-11-09', feitas: ['pre', 'treino'], copos: 3 })
  expect((await lerSessoes()).size).toBe(0)
})
