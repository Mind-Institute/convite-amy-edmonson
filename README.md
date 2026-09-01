# Convite — Almoço CHROs com Amy Edmondson

Peça de convite digital para o almoço fechado com **Amy Edmondson** em **16 de setembro, 13h30**,
durante o **Mind Summit 2026**, oferecido em parceria com a Wellz by Wellhub.

O convite é um canvas de **1080 × 1920** (9:16) com um modal de confirmação de presença de seis
campos obrigatórios.

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
| `assets/` | Imagens da peça |
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

**Modal fora do canvas.** O modal é uma camada `fixed` separada, com unidade própria
`--mu: max(var(--u), 0.62px)`. O piso garante campos com no mínimo 16px (abaixo disso o iOS dá
zoom ao focar o input). Abaixo de 720px o grid vira uma coluna e o rodapé do form empilha, como
previsto no handoff.

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

## Pendências de marca

Herdadas do handoff, antes de ir para produção:

- **Fonte Satoshi** é carregada da Fontshare. Trocar pelos `.woff2` licenciados que o Mind
  self-hosta (também remove a dependência de CDN de terceiros).
- **`assets/summit-lockup.png`** foi recolorido para branco por script — pedir o lockup branco
  oficial ao time de marca.
- **`assets/amy-edmondson.png`** tem só 380px de largura e é renderizada a 620px — pedir arquivo
  em resolução maior.
- **`og:image`** aponta para a foto da Amy; trocar pelo PNG 2× da peça quando ele for versionado.

A copy em pt-BR foi aprovada pelo cliente palavra por palavra — **não reescrever**.
