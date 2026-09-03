# Convites — Almoços fechados do Mind Summit 2026

Duas peças de convite digital para os almoços fechados com **Amy Edmondson** (16/09) e
**Christina Maslach** (17/09), reservados a um grupo restrito de CHROs, durante o Mind Summit 2026.

| Rota | O que é |
|---|---|
| `/` | **Página interna, com login**: links dos convites (com envio por WhatsApp) e as confirmações |
| `/amy-edmondson` | Convite da Amy — pôster 1080 × 1920 (9:16) numa tela |
| `/christina-maslach` | Convite da Christina — três telas de scroll (convite, line-up, "não é só palestra") |
| `/christina-maslach-inscritos` | Mesmo almoço, para quem **já tem ingresso** do Summit — só a tela do convite, sem a promessa de cortesia |
| `/admin` | Redireciona para `/` — os e-mails já enviados apontam para cá |

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
| `public/index.html` + `assets/css/painel.css` | Página interna (convites + confirmações) |
| `public/amy-edmondson/index.html` | Convite da Amy |
| `public/christina-maslach/index.html` + `assets/css/maslach.css` | Convite da Christina |
| `public/christina-maslach-inscritos/index.html` | Variante para quem já é inscrito (reusa o `maslach.css`) |
| `public/styles.css` | Design system (tokens) + canvas do pôster + modal e formulário, compartilhados |
| `public/script.js` | Modal, máscaras, validação e envio do RSVP — compartilhado pelas duas páginas |
| `public/assets/` | Imagens |
| `public/app.js` | Login, envio por WhatsApp e a tabela de confirmações |
| `public/admin/index.html` | Só o redirecionamento para `/` |
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
quem confirmou em qual almoço. São três valores, e a diferença entre os dois últimos é
operacional:

| `convite` | Página | O que muda |
|---|---|---|
| `Amy Edmondson` | `/amy-edmondson` | recebe cortesia dos 2 dias do Summit |
| `Christina Maslach` | `/christina-maslach` | recebe cortesia dos 2 dias do Summit |
| `Christina Maslach (inscritos)` | `/christina-maslach-inscritos` | **já comprou o ingresso** — só o almoço |

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
`x-webhook-secret` → envia o e-mail em HTML, com botão para o painel `/admin`). Depois de importar
falta só escolher a credencial de SMTP no nó de e-mail e ativar.

> **Atenção à URL.** `…/webhook-test/…` é a URL de teste do n8n: ela só responde enquanto alguém
> está com o "Test workflow" aberto no editor, e só uma vez. Para valer em produção, a URL é
> `…/webhook/…` (sem o `-test`) e o fluxo precisa estar **ativo**.

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

## Página interna (`/`)

Tudo o que é interno mora atrás de um login só, na raiz: **os links dos convites**, para enviar aos
CHROs, e **as confirmações** recebidas. Os convidados nunca chegam aqui — eles recebem o link
direto da peça.

Cada card de convite tem **Enviar** (abre o WhatsApp com a mensagem e o link prontos, via
`wa.me/?text=`, que no celular cai direto na lista de contatos), **Copiar link** e **Abrir**. No
mobile os três viram alvos de toque de 44px+, porque mandar pelo celular é o caso de uso principal.

Abaixo, as confirmações com contadores por convite, filtro, busca e exportação em CSV. Sem
biblioteca: fala direto com a API REST e a de auth do Supabase.

A tabela é larga de propósito e **rola na horizontal** em vez de espremer as colunas — sombras nas
bordas avisam que há mais conteúdo. No celular são ~1100px de rolagem; no desktop, ~300px.

`/admin` continua respondendo e redireciona para `/`, porque os e-mails já enviados ao Thiago
apontam para lá.

Tema claro, ao contrário dos convites: é ferramenta de trabalho, não peça de campanha. A
identidade fica nos acentos (verde Focus, coral Mastery), na Satoshi e nas pílulas. O lockup do
Summit é branco sobre transparente, então em fundo claro ele entra com `filter: invert(1)` —
trocar por um lockup escuro oficial quando o time de marca tiver um.

**Quem entra:** quem tiver uma linha em `public.admins`. Dar acesso a mais alguém é criar o usuário
no Supabase Auth e inserir o UID:

```sql
insert into public.admins (user_id, nome) values ('<uid-do-usuario>', 'Nome');
```

**Como o acesso é trancado** (verificado nos três casos):

| Quem | Lê `rsvps`? |
|---|---|
| `anon` — a chave que está no código do site | não (`permission denied`) |
| autenticado que não está em `admins` | não (0 linhas) |
| autenticado em `admins` | sim |

A chave publicável no `admin.js` é a mesma das páginas de convite e não dá acesso a nada sozinha:
quem libera é a RLS, e só depois de autenticar.

## Duas versões do convite da Christina

Parte dos CHROs convidados já comprou ingresso do Summit. Para eles, ler "seu convite inclui
acesso aos 2 dias" soa como estar pagando de novo por algo que já têm, então existe uma segunda
versão da peça em `/christina-maslach-inscritos`, sem essa promessa e sem as telas de line-up e
programação — só o convite do almoço.

O conteúdo é gerado a partir da página original, então as duas compartilham a copy aprovada e o
`maslach.css`. As diferenças estão só na primeira tela e no `data-convite`.

> Na página interna os dois cards aparecem lado a lado com etiquetas dizendo **o que cada peça
> afirma** — "A peça oferece os 2 dias do Summit" e "A peça não cita o Summit" —, não o que o
> convidado recebe na prática. A distinção importa: quem envia precisa saber o que a pessoa vai
> ler. O card da Amy leva a mesma etiqueta neutra da variante para inscritos, porque a peça dela
> também não menciona o Summit.

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
