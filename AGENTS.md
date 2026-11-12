# Super-Herói 365

App pessoal (PWA para iPhone) que transforma um ano de treino e alimentação em um jogo de quadrinhos.
Spec aprovada: `docs/specs/2026-11-12-super-heroi-365.md`. Ela manda no escopo; leia a seção da etapa antes de mexer.

## Stack
React 19, TypeScript 7, Vite 8, vite-plugin-pwa, Dexie (IndexedDB), lucide-react, fontes via @fontsource.
Testes: Vitest (jsdom, fake-indexeddb) e Playwright (375 px). Lint: oxlint.

## Como rodar
- `npm run dev`: desenvolvimento.
- `npm run verificar`: typecheck, lint e testes unitários. Rodar antes de todo commit.
- `npm run e2e`: roteiro de ponta a ponta contra o build de produção, em 375 px.
- `npm run icones`: regenera os PNGs a partir de `public/favicon.svg`.

## Estrutura
- `src/dominio/`: regras puras (jogo, fases, macros). Sem React, sem acesso a dados. Toda regra tem teste.
- `src/dados/`: banco local (Dexie) e hooks de leitura e escrita.
- `src/heroi/`: avatar vetorial, geometria e aparência.
- `src/telas/`: uma tela por seção do app. `src/ui/`: componentes compartilhados.
- `src/estilos/app.css`: identidade visual (tokens e classes).
- `prototipo/` e `legado/`: referência descartável. Não importar daqui.

## Convenções
- Nomes de código, comentários e textos em português. Zero emoji. Ícones: Lucide.
- XP, nível, sequência e atributos são sempre derivados dos registros; nunca gravados.
- Dado lido do banco passa por função de normalização antes de usar.
- Nenhum dado pessoal no repositório (ele é público): perfil fica só no aparelho.
- Conteúdo alimentar: proibido verdura, legume em pedaço, salada, peixe, fruto do mar e feijão. Há teste que barra.
- Nova coleção no banco: nova `version()` em `src/dados/banco.ts`; nunca editar versão publicada.
- Seleção de opção conhecida: lista suspensa. Alvo de toque de 44 px ou mais.
- Tela nova só é pronta depois de aberta em 375 px, tocada e capturada em `docs/capturas/`.

## Etapas
1. Fundação (feita): projeto, identidade, avatar, PWA, publicação automática.
2. Primeira abertura e tela Hoje. 3. Cardápio, receitas e compras. 4. Treino. 5. Evolução. 6. Jogo completo, lembretes e backup.
