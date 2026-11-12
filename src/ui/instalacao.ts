/** No iPhone, o app só fica instalado se for adicionado à Tela de Início pelo Safari. */
export function precisaInstalar(agente: string, emModoApp: boolean): boolean {
  return /iPhone|iPad|iPod/.test(agente) && !emModoApp
}
