import { describe, expect, it } from 'vitest'
import { precisaInstalar } from './instalacao'

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 Version/18.5 Mobile/15E148 Safari/604.1'
const WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36'

describe('aviso de instalação', () => {
  it('aparece no iPhone aberto pelo Safari', () => expect(precisaInstalar(IPHONE, false)).toBe(true))
  it('some quando o app já está na Tela de Início', () => expect(precisaInstalar(IPHONE, true)).toBe(false))
  it('não aparece no computador', () => expect(precisaInstalar(WINDOWS, false)).toBe(false))
})
