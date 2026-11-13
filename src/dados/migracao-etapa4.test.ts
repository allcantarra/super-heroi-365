import { expect, it } from 'vitest'

/** Cria o banco como a etapa 4 publicou (versão 3 do Dexie = versão 30 do IndexedDB), com um treino gravado. */
function bancoDaEtapa4(): Promise<void> {
  return new Promise((resolver, falhar) => {
    const pedido = indexedDB.open('super-heroi-365', 30)
    pedido.onupgradeneeded = () => {
      for (const [nome, chave] of [['perfil', 'id'], ['dias', 'data'], ['sessoes', 'data']]) pedido.result.createObjectStore(nome, { keyPath: chave })
    }
    pedido.onerror = () => falhar(pedido.error)
    pedido.onsuccess = () => {
      const tx = pedido.result.transaction(['perfil', 'dias', 'sessoes'], 'readwrite')
      tx.objectStore('perfil').put({ id: 'eu', pessoa: { pesoInicial: 55, metaPeso: 66, altura: 169, idade: 32 }, diaUm: '2026-11-09' })
      tx.objectStore('dias').put({ data: '2026-11-09', feitas: ['pre', 'cafe'], copos: 4 })
      tx.objectStore('sessoes').put({ data: '2026-11-09', treino: 'choque-A', inicio: 1, fim: 2, series: [{ exercicio: 'flexao', valor: 8 }] })
      tx.oncomplete = () => {
        pedido.result.close()
        resolver()
      }
    }
  })
}

it('quem já usava o app na etapa 4 abre a etapa 5 com treino e dias intactos e a evolução vazia', async () => {
  await bancoDaEtapa4()
  const { lerDias, lerMedidas, lerMesesComFoto, lerPerfil, lerPesagens, lerSessoes, salvarPesagem } = await import('./banco')
  expect((await lerPerfil()).pessoa?.pesoInicial).toBe(55)
  expect((await lerDias()).get('2026-11-09')?.copos).toBe(4)
  expect((await lerSessoes()).get('2026-11-09')?.series).toEqual([{ exercicio: 'flexao', valor: 8 }])
  expect((await lerPesagens()).size + (await lerMedidas()).size + (await lerMesesComFoto()).length).toBe(0)
  await salvarPesagem({ data: '2026-11-16', kg: 55.8 })
  expect((await lerPesagens()).get('2026-11-16')?.kg).toBe(55.8)
})
