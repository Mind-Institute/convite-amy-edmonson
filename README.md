# Convites — Almoços fechados do Mind Summit 2026

Duas peças de convite digital para os almoços fechados com **Amy Edmondson** (16/09) e
**Christina Maslach** (17/09), reservados a um grupo restrito de CHROs, durante o Mind Summit 2026.

| Rota | O que é |
|---|---|
| `/` | Home: seleção entre os dois convites |
| `/amy-edmondson` | Convite da Amy — pôster 1080 × 1920 (9:16) numa tela |
| `/christina-maslach` | Convite da Christina — três telas de scroll (convite, line-up, "não é só palestra") |

Publicado em `https://convite.mindsummit.company`.

## Como rodar

Site estático, sem build. `public/` é a raiz do site:

```bash
npm start            # ou: npx serve public
```

## Estrutura

`public/` é o que vai para o ar. Tudo fora dele é fonte, ferramenta ou referência.

| Arquivo | O que é |
|---|---|
| `public/index.html` + `assets/css/home.css` | Home |
| `public/amy-edmondson/index.html` | Convite da Amy |
| `public/christina-maslach/index.html` + `assets/css/maslach.css` | Convite da Christina |
| `public/styles.css` | Design system (tokens) + canvas do pôster + modal e formulário, compartilhados |
| `public/script.js` | Modal, máscaras, validação e envio do RSVP — compartilhado pelas duas páginas |
| `public/assets/` | Imagens |
| `tools/og-edmondson.html`, `tools/og-maslach.html` | Fontes das thumbnails de link (1200 × 630) |
| `tools/og-image.mjs` | Rasteriza as duas em `public/assets/og-image*.png` |
| `wrangler.jsonc` | Deploy (Cloudflare Workers Static Assets) |
| `docs/handoff/` | Handoff de design do convite da Amy |

## Confirmações de presença (RSVP)

Vão para a tabela `rsvps` do Supabase (projeto `qokdydgdovswjalpummr`), com as colunas
`nome`, `sobrenome`, `empresa`, `cargo`, `email`, `whatsapp`, `cpf` e `convite` —
`convite` é preenchido pela própria página (`data-convite` no `<body>`), então dá para separar
quem confirmou em qual almoço.

**A chave no `script.js` é a publicável (anon), e ela é feita para ficar exposta no navegador.**
A proteção não é a chave: é o RLS. `anon` tem só o privilégio de `INSERT` — nem `SELECT`, nem
`UPDATE`, nem `DELETE`, e a única policy da tabela é de inserção. Com a chave que está no site
**não se lê a lista de convidados**. Para ler, use o painel do Supabase ou a `service_role`.

Outras defesas na própria tabela: `convite` só aceita os dois nomes válidos, o e-mail passa por
regex, o CPF precisa ter 11 dígitos e todo campo tem limite de tamanho (a escrita é pública).

O CPF é guardado **só com dígitos**, sem pontuação — a página mostra mascarado e envia limpo. O
formulário confere os dígitos verificadores, o que pega erro de digitação, mas ninguém consulta a
Receita: trate como declarado pelo convidado.

Duplicatas são possíveis (o mesmo convidado pode enviar duas vezes) — deduplique por
`(lower(email), convite)` na leitura.

> Como são dados pessoais (CPF inclusive), vale alinhar com quem cuida de LGPD aí por quanto tempo
> a lista fica guardada e quem tem acesso ao projeto.

## Deploy

Cloudflare Workers, servindo `public/` como static assets — sem Worker script e sem build step.
Dois pontos de atenção na configuração da Cloudflare:

- **`name` precisa bater com o nome do Worker** já ligado a este repositório no painel. Está como
  `convite-amy-edmonson`; se lá for outro, troque no `wrangler.jsonc`.
- **`npx wrangler versions upload` só sobe uma versão, não coloca no ar.** Para a branch de
  produção o comando precisa ser `npx wrangler deploy` (ou promover a versão pelo painel).

## Decisões de implementação

**Stack.** HTML + CSS + JS sem build — as peças são páginas estáticas distribuídas por link, e
assim publicam em qualquer lugar sem dependência para manter.

**Escala.** Todas as medidas dos handoffs são escritas como `calc(var(--u) * N)`, onde `--u` é o
tamanho de 1px do canvas de 1080 no viewport atual. O que muda entre as peças é como `--u` é
calculado:

- **Amy** é um pôster de uma tela só, então `--u` é limitado pela altura *e* pela largura — a peça
  inteira cabe na tela, cheia num celular 9:16 e centralizada no desktop.
- **Christina e a home** rolam, então `--u` é guiado só pela largura.

**Layout desktop.** Em landscape ≥ 900px o pôster da Amy vira um grid de duas colunas; a página da
Christina centraliza o conteúdo e o line-up passa de 2×2 para 4 colunas.

**Além dos protótipos.** Foco preso no modal, `Esc`, `inert` no fundo, retorno de foco ao CTA,
máscaras de WhatsApp e CPF, estados de enviando/sucesso/erro e `prefers-reduced-motion`.

## Thumbnails de link (WhatsApp)

Cada convite tem a sua, em 1200 × 630 — o formato que o WhatsApp usa no card grande de link:

| Página | Thumbnail | Fonte |
|---|---|---|
| `/amy-edmondson` | `public/assets/og-image.png` | `tools/og-edmondson.html` |
| `/christina-maslach` | `public/assets/og-image-maslach.png` | `tools/og-maslach.html` |

São composições landscape próprias, não recortes dos pôsteres: em 9:16 o crawler cortaria a peça
e sobraria o meio dela.

```bash
npm install      # Playwright, só para este script
npm run og       # gera as duas
```

O script avisa e sai com código 1 se a Satoshi não tiver carregado, para não gerar PNG com a
tipografia errada sem ninguém perceber.

## Pendências

**Assets da página da Christina.** O material inicial foi um PDF achatado (três JPEGs de
1080 × 1920, com o texto queimado por cima das imagens), não um handoff com os arquivos soltos. A
foto dela e o lockup horizontal já vieram nos originais; os tiles do line-up, as arenas e os
avatares seguem recortados do PDF — ficam corretos em 1×, mas sem folga para telas retina. Ganham
qualidade se vierem os arquivos soltos.

`public/assets/christina-maslach-selo.webp` (o selo em fundo creme com o anel "mind summit") veio
junto mas não corresponde a nenhum bloco do PDF, então está guardado sem uso — dizer se tem lugar.

**Fonte Satoshi.** Carregada da Fontshare. Trocar pelos `.woff2` licenciados que o Mind self-hosta
(também remove a dependência de CDN de terceiros).

**Thumbnails de link.** As duas foram geradas sem a Satoshi (a Fontshare estava bloqueada no
ambiente em que rodaram), então saíram com a fonte de fallback. Rodar `npm run og` numa máquina
com acesso à Fontshare e commitar os PNGs.

**URLs a confirmar.** "Ver programação completa" e "Por que levar meu time?" apontam para
`https://mindsummit.company/` como palpite; confirmar os destinos certos.

A copy em pt-BR foi aprovada pelo cliente palavra por palavra — **não reescrever**.
