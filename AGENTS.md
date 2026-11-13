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
- `src/conteudo/`: alimentos, pratos, receitas e fichas de treino, em dados tipados e validados por teste.
- `src/telas/`: uma tela por seção do app. `src/ui/`: componentes compartilhados.
- `src/estilos/app.css`: identidade visual (tokens e classes).
- `prototipo/` e `legado/`: referência descartável. Não importar daqui.

## Convenções
- Nomes de código, comentários e textos em português. Zero emoji. Ícones: Lucide.
- XP, nível, sequência e atributos são sempre derivados dos registros; nunca gravados.
- Dado lido do banco passa por função de normalização antes de usar.
- Nenhum dado pessoal no repositório (ele é público): perfil fica só no aparelho. Scripts de captura e testes usam valores fictícios (60,5 kg, meta 70 kg, 175 cm, 30 anos), nunca os do Leonardo.
- Evolução: regras em `src/dominio/evolucao.ts`. Fotos ficam no IndexedDB como Blob reduzido (`src/ui/comprimirImagem.ts`); a tela lê as imagens sob demanda, o resto do app só lê os meses (`lerMesesComFoto`).
- Jogo: chefões, vilão da semana, conquistas e gibi em `src/dominio/campanha.ts`, sempre derivados (`montarRegistros` em `src/ui/registros.ts`).
- Backup (`src/dados/backup.ts`): o arquivo de restauração é entrada não confiável; tudo passa pelas normalizações, foto tem limite de tamanho e assinatura conferida, e a gravação é uma transação só. Mudou o formato? Suba `VERSAO_DO_BACKUP` e mantenha a leitura das versões antigas.
- Testes com relógio falso: depois de `clock.fastForward` e `reload`, chame `clock.runFor(1000)`, senão o app fica em "Abrindo seu gibi..." (o relógio falso para).
- Conteúdo alimentar (desde a versão 2): entram alface e tomate no lanche, cenoura ralada ou batida escondida e a salada caesar; continuam proibidos verdura cozida, legume em pedaço, outra salada, peixe, fruto do mar e feijão (`PROIBIDOS` em `src/conteudo/alimentos.ts`, com teste). Alimento novo leva a fonte (TACO ou rótulo) no comentário.
- Nova coleção no banco: nova `version()` em `src/dados/banco.ts`; nunca editar versão publicada.
- Seleção de opção conhecida: lista suspensa. Alvo de toque de 44 px ou mais.
- Tela nova só é pronta depois de aberta em 375 px, tocada e capturada em `docs/capturas/`.
- Cardápio: todo tipo de refeição tem pelo menos 30 pratos fora as besteiras. A receita de cada prato (tempo, passos, etiquetas, como levar, airfryer, ligação com o preparo de domingo) e os pratos novos ficam em `scripts/receitas/<categoria>.ts`; os 180 pratos antigos seguem na BASE de `scripts/gerar-pratos.ts`. Depois de mudar, rode `node scripts/gerar-pratos.ts` (grava `src/conteudo/pratos.ts`; nenhum prato pode passar de 10% do orçamento) e `npx vite-node scripts/relatorio-macros.ts`. Há teste que confere se os passos citam os ingredientes do próprio prato.
- Besteira (etiqueta `besteira`, só lanche e jantar) fica fora do rodízio comum e entra só nas vagas de `VAGAS_DE_BESTEIRA` em `src/dominio/cardapio.ts`: terça no lanche da tarde, quinta e domingo no jantar; na fase 4, só quinta. A troca do usuário pode escolher besteira em qualquer refeição.
- Treino: exercício novo entra no arquivo do grupo em `src/conteudo/exercicios/` (empurrar, puxar, pernas, core, folego, mobilidade), com dificuldade de 1 a 5 e passo a passo completo; fichas, aquecimento e alongamento ficam em `src/conteudo/treinos.ts`. O teste em `src/dominio/treino.test.ts` barra treino acima de 40 minutos (aquecimento e alongamento ficam fora da conta), passo a passo incompleto, semana sem algum grupo e exercício de ficha sem troca possível. Regras em `src/dominio/treino.ts`.
- Troca na hora: mesmo grupo, unidade e jeito de contar (por lado ou não), dificuldade a no máximo 1, só antes da primeira série. Fica em `Sessao.trocas` (ficha para feito); as séries gravam o exercício feito. A tela usa `aplicarTrocas` sobre a ficha do dia.
- A missão `treino` de um dia é derivada da sessão concluída (`diasComTreino`); nunca marcar `treino` em `feitas` por código novo. Marca antiga, feita à mão, continua valendo.
- Tempo de descanso e de cronômetro é sempre a diferença entre instantes (`Date.now()`), nunca contagem de tiques: o iPhone congela temporizador em segundo plano.
- `npm run e2e` reaproveita um servidor já aberto na porta 4365 (`reuseExistingServer`): com uma prévia antiga de pé, os roteiros rodam contra o build velho. Feche a prévia antes de rodar os roteiros.
- O servidor de desenvolvimento já serviu arquivo antigo depois de edição por script. Se a tela não bater com o código, reinicie o `npm run dev` antes de investigar. Os roteiros `e2e` rodam contra o build e não sofrem disso.

## Etapas
1. Fundação, 2. Primeira abertura e tela Hoje, 3. Cardápio dos 365 dias, receitas e compras, 4. Treino, 5. Evolução,
6. Jogo completo, lembretes e backup: feitas. A versão 1 da spec está completa.
