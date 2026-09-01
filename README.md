# Convite — Almoço CHROs com Amy Edmondson

Peça de convite digital para o almoço fechado com **Amy Edmondson** em **16 de setembro, 13h30**,
durante o **Mind Summit 2026**, oferecido em parceria com a Wellz by Wellhub.

O convite tem dois layouts — pôster **1080 × 1920** (9:16) em telas verticais e um layout de duas
colunas em desktop — e um modal de confirmação de presença com seis campos obrigatórios.

## Como rodar

Site estático, sem build. Basta servir a pasta:

```bash
npx serve .          # ou: python3 -m http.server 8000
```

Depois abra `http://localhost:3000`. Publicação: qualquer host estático (GitHub Pages, Vercel,
Netlify, S3) — é só subir a raiz do repositório.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | Marcação do convite e do modal |
| `styles.css` | Design system (tokens), layout do canvas e do modal |
| `script.js` | Estado do modal, máscara de WhatsApp e envio do RSVP |
| `og-image.html` | Fonte da thumbnail de link (1200 × 630) — não é uma página do site |
| `tools/og-image.mjs` | Rasteriza `og-image.html` em `assets/og-image.png` |
| `assets/` | Imagens da peça e a thumbnail gerada |
| `docs/handoff/` | Handoff de design original (referência: medidas, cores e copy aprovada) |

## Decisões de implementação

**Stack.** O repositório não tinha ambiente. Como a peça é uma página estática única distribuída
por link (e-mail/WhatsApp), foi implementada em HTML + CSS + JS sem build — carrega rápido, não
tem dependência para manter e publica em qualquer lugar. Se o convite virar parte de um app maior,
o markup mapeia direto para um componente React/Vue.

**Escala do canvas.** Em vez de fixar 1080 × 1920, todas as medidas do handoff são escritas como
`calc(var(--u) * N)`, onde `--u` é o tamanho de 1px do canvas no viewport atual:

```css
--u: min(calc(100vw / 1080), calc(100svh / 1920), 1px);
```

A peça escala proporcionalmente e continua pixel-perfect em relação ao design em qualquer tela —
tela cheia num celular 9:16, centralizada com bordas no desktop. O teto de `1px` evita ampliar
ainda mais a foto da Amy, que já é renderizada acima da resolução nativa.

**Layout desktop.** Em telas landscape com 900px ou mais (`min-width: 900px` e
`min-aspect-ratio: 1/1`), o pôster letterboxado dá lugar a um layout de duas colunas que ocupa a
largura da tela: à esquerda título, lead e o bloco de data + CTA; à direita a bio da Amy e a foto,
que encosta na base como no pôster. A média query só redefine `--u` e o arranjo do grid — os
tokens, as cores e a hierarquia continuam os mesmos, e o `--u` fica mais preso à altura que à
largura para o convite tentar caber numa tela só. Telas verticais (celular, tablet em retrato)
continuam no pôster 9:16, que num celular ocupa a tela inteira.

A foto é um recorte que corta reto na altura do peito. No pôster essa borda encosta na divisória e
some; no desktop ela ficaria flutuando, então um `mask-image` dissolve o corte no fundo.

**Modal fora do canvas.** O modal é uma camada `fixed` separada, com unidade própria
`--mu: clamp(0.62px, var(--u), 1px)`. O piso garante campos com no mínimo 16px (abaixo disso o iOS
dá zoom ao focar o input) e o teto evita que ele cresça além da escala de design em telas grandes.
Abaixo de 720px o grid vira uma coluna e o rodapé do form empilha, como previsto no handoff.

**Além do protótipo.** Foram adicionados: foco preso no modal, `Esc` para fechar, `inert` no fundo,
retorno de foco ao CTA, máscara `(00) 00000-0000` no WhatsApp, estados de `enviando` / `sucesso` /
`erro`, e `prefers-reduced-motion`.

## Envio do RSVP — pendente

Hoje o formulário cai no `mailto:` do protótipo (`contato@joinmind.com.br`), que depende do
cliente de e-mail do convidado. O fluxo real já está implementado: basta preencher a constante no
topo de `script.js`.

```js
var RSVP_ENDPOINT = null;  // ex.: 'https://formspree.io/f/xxxxxxx'
```

Com o endpoint definido, `sendRsvp()` faz `POST` de JSON
(`nome`, `sobrenome`, `empresa`, `cargo`, `email`, `whatsapp`, `evento`), mostra `Enviando…` no
botão, o painel **Presença confirmada** em caso de sucesso e uma mensagem de erro com retry se
falhar. Opções discutidas com o cliente, em ordem de esforço: Formspree/Basin → Google Forms →
RD Station/HubSpot → endpoint próprio.

## Thumbnail de link (WhatsApp)

`assets/og-image.png` (1200 × 630) é a imagem que aparece no preview quando o link é colado no
WhatsApp, no e-mail ou no Slack. A fonte dela é `og-image.html`, uma composição landscape separada
— não um recorte do pôster, que em 9:16 seria cortado pelo crawler.

```bash
npm install      # Playwright, só para este script
npm run og       # og-image.html -> assets/og-image.png
```

O script avisa e sai com código 1 se a Satoshi não tiver carregado, para não gerar um PNG com a
tipografia errada sem ninguém perceber.

Ao publicar, dois ajustes:

1. **`og:image` precisa virar URL absoluta** em `index.html` (o WhatsApp não resolve caminho
   relativo de forma confiável). Há dois lugares: `og:image` e `twitter:image`.
2. A página está com `<meta name="robots" content="noindex, nofollow">`, porque o convite é
   pessoal e não deve ir para busca. Crawlers de preview normalmente ignoram esse meta, mas se o
   preview não aparecer, é a primeira coisa a testar.

## Pendências de marca

Herdadas do handoff, antes de ir para produção:

- **Fonte Satoshi** é carregada da Fontshare. Trocar pelos `.woff2` licenciados que o Mind
  self-hosta (também remove a dependência de CDN de terceiros).
- **`assets/summit-lockup.png`** foi recolorido para branco por script — pedir o lockup branco
  oficial ao time de marca.
- **`assets/amy-edmondson.png`** tem só 380px de largura e é renderizada a 620px — pedir arquivo
  em resolução maior.
- **`assets/og-image.png` foi gerada sem a Satoshi** (a Fontshare estava bloqueada no ambiente em
  que rodou), então saiu com a fonte de fallback. Rodar `npm run og` uma vez numa máquina com
  acesso à Fontshare e commitar o PNG antes de distribuir o link.

A copy em pt-BR foi aprovada pelo cliente palavra por palavra — **não reescrever**.
