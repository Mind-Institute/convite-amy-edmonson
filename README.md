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
| `public/assets/fonts/` | Satoshi variável, self-hospedada |
| `tools/og-home.html`, `tools/og-edmondson.html`, `tools/og-maslach.html` | Fontes das thumbnails de link (1200 × 630) |
| `tools/og-image.mjs` | Rasteriza as duas em `public/assets/og-image*.png` |
| `wrangler.jsonc` | Deploy (Cloudflare Workers Static Assets) |
| `tools/n8n-rsvp-email.json` | Fluxo do n8n que manda o e-mail a cada confirmação |
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

Cada página tem a sua, em 1200 × 630 — o formato que o WhatsApp usa no card grande de link:

| Página | Thumbnail | Fonte |
|---|---|---|
| `/` | `public/assets/og-image-home.png` | `tools/og-home.html` |
| `/amy-edmondson` | `public/assets/og-image.png` | `tools/og-edmondson.html` |
| `/christina-maslach` | `public/assets/og-image-maslach.png` | `tools/og-maslach.html` |

São composições landscape próprias, não recortes dos pôsteres: em 9:16 o crawler cortaria a peça
e sobraria o meio dela.

```bash
npm install      # Playwright, só para este script
npm run og       # gera as três
```

O script avisa e sai com código 1 se a Satoshi não tiver carregado, para não gerar PNG com a
tipografia errada sem ninguém perceber. Com a fonte self-hospedada isso não depende mais de rede.

> `npm install` **não** baixa o navegador — o pacote `playwright` não tem `postinstall`. Rode
> `npx playwright install chromium` uma vez antes do primeiro `npm run og`.

## Fonte

A Satoshi é **self-hospedada** em `public/assets/fonts/Satoshi-Variable.woff2` — arquivo variável
(eixo de peso 300–900, cobrindo os 400/500/700/900 do design), convertido do `.ttf` licenciado que
o Mind usa. 41 KB. Não há mais nenhuma requisição a CDN de terceiro: as três páginas carregam com
zero recursos externos.

> A Satoshi não tem os glifos `º` e `ª`. Eles aparecem duas vezes na página da Amy ("nº 1" e
> "2º andar") e caem na fonte de sistema do visitante — na prática passa despercebido, mas se
> incomodar, o caminho é pedir um corte mais completo ao time de marca.

## Aviso por e-mail a cada confirmação

Um gatilho `AFTER INSERT` em `rsvps` faz POST da linha nova num webhook do n8n, que manda o e-mail
para o Thiago. A URL e o segredo ficam em `public.integracoes` — tabela com RLS ligada, **sem
policy nenhuma** e com os grants revogados, ou seja, só `service_role` enxerga (ela guarda um
segredo, não pode vazar pela chave pública do site).

Ligar/desligar é um UPDATE, não uma migration. **URL vazia = gatilho não faz nada:**

```sql
update public.integracoes set valor = 'https://SEU-N8N/webhook/rsvp-mind-summit'
 where chave = 'n8n_rsvp_webhook_url';
update public.integracoes set valor = 'um-segredo-qualquer'
 where chave = 'n8n_rsvp_webhook_segredo';
```

`tools/n8n-rsvp-email.json` é o fluxo pronto para importar no n8n (Webhook → confere o header
`x-webhook-secret` → envia o e-mail). Depois de importar: trocar `TROQUE-PELO-SEGREDO`, escolher a
credencial de SMTP no nó de e-mail, ativar, e copiar a Production URL do webhook.

O corpo que chega no webhook:

```json
{
  "id": "uuid", "criado_em": "2026-09-02T16:21:57Z",
  "convite": "Amy Edmondson",
  "nome": "Ana", "sobrenome": "Souza", "nome_completo": "Ana Souza",
  "empresa": "Acme", "cargo": "CHRO",
  "email": "ana@acme.com", "whatsapp": "(11) 98765-4321",
  "cpf": "11144477735", "cpf_formatado": "111.444.777-35"
}
```

> O `pg_net` é assíncrono e não tem retentativa: se o n8n estiver fora do ar na hora, aquele
> e-mail se perde — mas a confirmação não, ela já está gravada. O banco é a fonte de verdade; o
> e-mail é só aviso.

## Pendências

**Assets da página da Christina.** O material inicial foi um PDF achatado (três JPEGs de
1080 × 1920, com o texto queimado por cima das imagens), não um handoff com os arquivos soltos. A
foto dela e o lockup horizontal já vieram nos originais; os tiles do line-up, as arenas e os
avatares seguem recortados do PDF — ficam corretos em 1×, mas sem folga para telas retina. Ganham
qualidade se vierem os arquivos soltos.

`public/assets/christina-maslach-selo.webp` (o selo em fundo creme com o anel "mind summit") veio
junto mas não corresponde a nenhum bloco do PDF, então está guardado sem uso — dizer se tem lugar.

**Botão sem destino.** "Por que levar meu time?", na tela 3 do convite da Christina, é um
`<button>` sem ação — aparece com o visual normal e não faz nada ao clique, como pedido até haver
uma página de destino. Quando houver, virar um `<a href="...">` como o botão ao lado.

A copy em pt-BR foi aprovada pelo cliente palavra por palavra — **não reescrever**.
