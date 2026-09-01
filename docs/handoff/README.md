# Handoff: Convite — Almoço CHROs com Amy Edmondson (Mind Summit 2026)

## Overview
Peça de convite digital (1080 × 1920, formato vertical/stories-poster) para um almoço fechado com Amy Edmondson durante o Mind Summit 2026, oferecido em parceria com a Wellz by Wellhub. O convite abre um modal de confirmação de presença com seis campos obrigatórios; o envio hoje é via `mailto:` para contato@joinmind.com.br.

## About the Design Files
Os arquivos deste bundle são **referências de design feitas em HTML** — protótipos que mostram a aparência e o comportamento pretendidos, **não código de produção para copiar direto**. A tarefa é **recriar estes designs no ambiente do codebase de destino** (React, Vue, Next.js, etc.), usando os padrões e bibliotecas já estabelecidos lá. Se ainda não existir um ambiente, escolher o framework mais adequado e implementar os designs nele.

O arquivo principal (`Convite CHROs Lunch.dc.html`) é escrito num formato interno de componente ("Design Component") com estilos inline e um pequeno runtime (`support.js`). **Não porte o runtime.** Leia-o como especificação visual: a marcação e os valores inline são a fonte de verdade para medidas, cores e tipografia.

## Fidelity
**High-fidelity (hifi).** Cores, tipografia, espaçamentos e estados finais. Recriar pixel-perfect usando as bibliotecas do codebase. Todas as medidas abaixo estão em px no canvas de 1080 × 1920 — escale proporcionalmente se o destino for responsivo.

## Design System
O design segue o **Mind Institute Design System** (dark mode). Se o codebase já tiver esse design system, use os tokens dele em vez dos hex literais abaixo.

- Fonte: **Satoshi** (400/500/700/900). Fallback: sans-serif. O brand self-hosta os .woff2; este protótipo carrega da Fontshare.
- Canvas escuro `#0B0B0F`; superfície de card `#2C2D3D`; hairline `rgba(143,143,163,0.27)`.
- Acentos semânticos: **Verde #68EE95** (jornada Focus — usado aqui como cor de ação/CTA), **Laranja #FF7057** (jornada Mastery — usado para destaques e o nome da Amy), **Roxo #9843FF** (só no glow de fundo).
- Raios: 8 (campos) · 12 (inputs deste layout) · 16 · 24 · 32 (painéis grandes) · 100 (pílulas).
- Copy em pt-BR, sentence case, sem emoji, em-dash real.

---

## Screens / Views

### 1. Convite (tela principal)

**Purpose:** convidar um CHRO nominalmente para o almoço e levá-lo a confirmar presença.

**Layout raiz**
- `width: 1080px; height: 1920px; position: relative; overflow: hidden`
- `background: #0B0B0F`, `color: #fff`, `font-family: Satoshi, sans-serif`
- Dois glows radiais decorativos, ambos `position: absolute`, `border-radius: 50%`, atrás do conteúdo:
  - Verde: `top: -160px; right: -240px; 900 × 900px`, `radial-gradient(circle, rgba(104,238,149,0.10) 0%, rgba(11,11,15,0) 70%)`
  - Roxo: `bottom: 380px; left: -300px; 760 × 760px`, `radial-gradient(circle, rgba(152,67,255,0.12) 0%, rgba(11,11,15,0) 70%)`
- Wrapper de conteúdo: `position: relative; height: 100%; display: flex; flex-direction: column`

**A. Header (flex: none)**
- `display: flex; align-items: center; justify-content: space-between`
- `padding: 46px 68px 30px`; `border-bottom: 1px solid rgba(143,143,163,0.22)`
- Esquerda: lockup **Mind Summit 2026** em branco — `assets/summit-lockup.png`, `height: 108px; width: auto`
- Direita: selo "CONVITE PESSOAL · NÃO TRANSFERÍVEL"
  - `display: flex; align-items: center; gap: 12px`
  - quadrado `10 × 10px`, `background: #FF7057`
  - texto: `21px / 700 / letter-spacing: 0.06em / uppercase`, cor `#FF7057`

**B. Corpo (flex: 1)**
- `display: flex; flex-direction: column; justify-content: space-between`
- `padding: 62px 68px 48px`; `min-height: 0`
- Quatro blocos distribuídos por `space-between` (esta distribuição automática é intencional — não fixe alturas)

**B1. Bloco de título** — `display: flex; flex-direction: column; gap: 30px`
- Eyebrow row: `display: flex; align-items: center; gap: 20px`
  - régua `56 × 3px`, `background: #68EE95`
  - "Almoço fechado" — `22px / 700 / letter-spacing: 0.14em / uppercase`, `#68EE95`
  - pílula "16 de setembro" — `20px / 900 / letter-spacing: 0.08em / uppercase`, texto `#0B0B0F`, fundo `#68EE95`, `border-radius: 100px`, `padding: 10px 24px`
- `<h1>` "Amy Edmondson, sem palco" — `100px / 900 / line-height: 0.94 / letter-spacing: -0.03em / uppercase`, `text-wrap: balance`
- Subtítulo — `31px / 400 / line-height: 1.45`, `color: rgba(255,255,255,0.72)`, `max-width: 860px`, `text-wrap: pretty`
  - Copy: "Uma conversa exclusiva entre líderes sobre risco, erro e como construir organizações que aprendem mais rápido do que o mundo muda."

**B2. Bloco Amy** — `display: flex; align-items: flex-end; gap: 32px`
- Coluna de texto (`flex: 1`, `gap: 22px`):
  - `<h2>` "Amy<br>Edmondson." — `68px / 900 / line-height: 0.94 / letter-spacing: -0.02em / uppercase`, `color: #FF7057`
  - Bio — `28px / 400 / line-height: 1.45`, `rgba(255,255,255,0.85)`, `text-wrap: pretty`
    - Copy: "A maior autoridade mundial em segurança psicológica, professora da Harvard Business School e pensadora de gestão nº 1 do mundo pelo Thinkers50. Transformou a forma como as maiores organizações enfrentam erros, assumem riscos e constroem alta performance."
- Foto: `assets/amy-edmondson.png`, `width: 620px; height: auto; flex: none`, `margin: 0 -40px -14px 0` (sangra 40px na margem direita e 14px na base, de propósito)

**B3. Bloco data + CTA** — `display: flex; align-items: flex-end; justify-content: space-between; gap: 40px`
- `border-top: 1px solid rgba(143,143,163,0.3)`; `padding: 40px 8px 0 0`
- Esquerda (`gap: 12px`):
  - Linha de data: `display: flex; align-items: baseline; gap: 18px`, `58px / 900 / letter-spacing: -0.02em / line-height: 1`
    - "16 SET" · bullet "•" em `#68EE95` · "13H30" — todos com `white-space: nowrap`
  - Linha de local: `display: flex; align-items: flex-start; gap: 14px`
    - Ícone pin 24×24 viewBox, render `30 × 30px`, `stroke: #68EE95`, `stroke-width: 1.8`, `margin-top: 3px` (linha fina, estilo Lucide `map-pin`)
    - Texto `26px / line-height: 1.4`, `rgba(255,255,255,0.7)`, três linhas:
      "São Paulo Expo · Pavilhão 3" / "2º andar, Sala Executiva" / "durante o Mind Summit 2026"
- Direita — **CTA "Confirmar meu lugar"** (abre o modal)
  - `display: flex; align-items: center; gap: 16px`, `flex: none`
  - `background: #68EE95`, `color: #0B0B0F`, `border-radius: 100px`, `padding: 24px 42px`
  - `27px / 700`, `cursor: pointer`, `margin-bottom: 6px`
  - Label com `white-space: nowrap` + seta "→"
  - **Hover:** `background: #8df3ae`
  - ⚠ Estas medidas foram calibradas para o CTA e a linha de data caberem juntos nos 944px da coluna. Se aumentar qualquer fonte deste bloco, verifique que o botão não vaza da página.

**B4. Rodapé de parceria** — `display: flex; align-items: center; justify-content: center; gap: 28px`
- `border-top: 1px solid rgba(143,143,163,0.25)`; `padding-top: 34px`
- "Oferecido pelo Mind Summit 2026 em parceria com" — `19px / 700 / letter-spacing: 0.14em / uppercase`, `rgba(143,143,163,0.9)`, `flex: none`
- Logo Wellz: `assets/wellz-branco-hd.png`, `height: 78px; width: auto; flex: none`

### 2. Modal de confirmação

**Purpose:** capturar os dados do convidado que confirma presença.

**Trigger:** clique no CTA "Confirmar meu lugar".

**Overlay**
- `position: absolute; inset: 0; z-index: 20`
- `background: rgba(5,5,8,0.84)`; `backdrop-filter: blur(10px)`
- `display: flex; align-items: center; justify-content: center`; `padding: 68px`
- Clique no overlay **fecha** o modal; clique dentro do card **não** (stopPropagation)

**Card**
- `width: 100%`, `background: #2C2D3D`, `border: 1px solid rgba(143,143,163,0.27)`
- `border-radius: 32px`, `padding: 56px`, `gap: 36px` em coluna
- `box-shadow: 0 40px 90px rgba(0,0,0,0.55)`

**Header do card** — `display: flex; align-items: flex-start; justify-content: space-between; gap: 24px`
- Eyebrow "Almoço fechado · 16 set · 13h30" — `20px / 700 / letter-spacing: 0.14em / uppercase`, `#68EE95`
- `<h3>` "Confirmar meu lugar" — `54px / 900 / line-height: 0.98 / letter-spacing: -0.02em / uppercase`, `#fff`
- Botão fechar "×": `56 × 56px`, `border-radius: 100px`, `border: 1px solid rgba(143,143,163,0.4)`, `color: rgba(255,255,255,0.75)`, `font-size: 30px`, centralizado, `cursor: pointer`

**Form** — `display: flex; flex-direction: column; gap: 26px`
- Grid de campos: `display: grid; grid-template-columns: 1fr 1fr; gap: 26px`
- **Seis campos, todos obrigatórios**, nesta ordem: Nome · Sobrenome · Empresa · Cargo · E-mail · WhatsApp
- Cada campo é um `<label>` em coluna, `gap: 12px`:
  - Texto da label: `20px / 700 / letter-spacing: 0.1em / uppercase`, `rgba(143,143,163,0.95)`, seguido de um asterisco `*` em `#FF7057`
  - Input: `background: rgba(11,11,15,0.6)`, `border: 1px solid rgba(143,143,163,0.35)`, `border-radius: 12px`, `padding: 22px 24px`, `26px / 500` Satoshi, `color: #fff`, `outline: none`
  - **Focus:** `border-color: #68EE95`
  - Placeholders: "Seu nome" · "Seu sobrenome" · "Nome da empresa" · "Seu cargo" · "nome@empresa.com" · "(11) 99999-9999"
  - `name`: `nome`, `sobrenome`, `empresa`, `cargo`, `email` (`type="email"`), `whatsapp`
- Rodapé do form: `display: flex; align-items: center; justify-content: space-between; gap: 32px`
  - Nota: "* Todos os campos são obrigatórios." — `20px / line-height: 1.4`, `rgba(143,143,163,0.95)`, com o `*` em `#FF7057`
  - Botão submit "Enviar confirmação →" — `background: #68EE95`, `color: #0B0B0F`, `border: none`, `border-radius: 100px`, `padding: 26px 46px`, `29px / 700`, `cursor: pointer`, `flex: none`; **hover** `#8df3ae`

## Interactions & Behavior

| Ação | Comportamento |
|---|---|
| Clique no CTA "Confirmar meu lugar" | `formOpen = true` — modal aparece |
| Clique no overlay ou no "×" | `formOpen = false` |
| Clique dentro do card | `event.stopPropagation()` — não fecha |
| Submit com campo vazio | Validação nativa do browser (`required`) bloqueia o envio |
| Submit válido | Monta o corpo do e-mail, navega para `mailto:`, fecha o modal |

**Validação**
- Os seis campos têm `required`. `email` usa `type="email"` (valida formato).
- **Recomendado ao portar:** máscara de telefone BR no WhatsApp (`(00) 00000-0000`) e validação de domínio corporativo no e-mail, se fizer sentido para o filtro de convidados.

**Envio (estado atual — provisório)**
```
subject: "Confirmação — Almoço CHROs com Amy Edmondson (16/09)"
body:
  Nome: {nome} {sobrenome}
  Empresa: {empresa}
  Cargo: {cargo}
  E-mail: {email}
  WhatsApp: {whatsapp}

  Confirmo minha presença no almoço com Amy Edmondson — 16/09, 13h30.
to: contato@joinmind.com.br
```
O protótipo faz `window.location.href = 'mailto:...'`, o que depende do cliente de e-mail do usuário.

**Ao portar, substituir por um envio real.** Opções discutidas com o cliente, em ordem de esforço:
1. **Formspree / Basin** — POST no endpoint do serviço, respostas em contato@joinmind.com.br. Sem backend.
2. **Google Forms / planilha** — grátis, respostas em planilha.
3. **RD Station / HubSpot** — leads direto no CRM, com tag do evento. Preferível se já houver CRM em uso.
4. **Endpoint próprio** — `POST /api/rsvp` gravando em banco + e-mail transacional (Resend/SES).

Em qualquer opção: estado de loading no botão durante o POST, estado de sucesso ("Presença confirmada") substituindo o form, e estado de erro com retry. Nenhum desses estados existe no protótipo — precisam ser desenhados/implementados.

**Animação/transição**
- Padrão do design system: ~0.2s ease, sem bounce, sem loop infinito. Respeitar `prefers-reduced-motion`.
- Sugestão para o modal: fade do overlay + fade/scale sutil (0.98 → 1) do card.

**Responsivo**
- O protótipo é um canvas fixo de 1080 × 1920 (peça gráfica / share).
- Se virar página web: manter a hierarquia; abaixo de ~768px o grid do form vira uma coluna (`grid-template-columns: 1fr`), a foto da Amy vai para cima ou abaixo do texto, e o bloco data+CTA empilha.

## State Management
Estado único e local:
```
formOpen: boolean = false
```
Valores dos campos são lidos via `FormData` no submit (uncontrolled). Ao portar para React, provavelmente vale um form controlado ou react-hook-form + zod, mais os estados `submitting` / `submitted` / `error` descritos acima.

## Design Tokens

**Cores**
| Token | Valor | Uso |
|---|---|---|
| Ink / canvas | `#0B0B0F` | fundo da peça |
| Surface | `#2C2D3D` | card do modal |
| Verde (Focus) | `#68EE95` | CTAs, eyebrow, pílula de data, pin, foco de input |
| Verde hover | `#8df3ae` | hover dos botões |
| Laranja (Mastery) | `#FF7057` | selo, nome da Amy, asteriscos de obrigatório |
| Roxo (Flow) | `#9843FF` (em `rgba(152,67,255,0.12)`) | glow de fundo |
| Texto primário | `#fff` | |
| Texto 85% | `rgba(255,255,255,0.85)` | bio |
| Texto 72% | `rgba(255,255,255,0.72)` | subtítulo |
| Texto 70% | `rgba(255,255,255,0.7)` | local |
| Cinza label | `rgba(143,143,163,0.9–0.95)` | labels, rodapé |
| Hairline | `rgba(143,143,163,0.22–0.35)` | divisórias e bordas |
| Overlay | `rgba(5,5,8,0.84)` + blur 10px | fundo do modal |
| Input fill | `rgba(11,11,15,0.6)` | |

**Tipografia** — Satoshi
| Papel | Tamanho / peso | Extra |
|---|---|---|
| H1 | 100 / 900 | lh 0.94, ls -0.03em, uppercase |
| H2 (nome) | 68 / 900 | lh 0.94, ls -0.02em, uppercase |
| H3 (modal) | 54 / 900 | lh 0.98, ls -0.02em, uppercase |
| Data | 58 / 900 | lh 1, ls -0.02em |
| Subtítulo | 31 / 400 | lh 1.45 |
| Botão submit | 29 / 700 | |
| Bio | 28 / 400 | lh 1.45 |
| CTA | 27 / 700 | |
| Local | 26 / 400 | lh 1.4 |
| Input | 26 / 500 | |
| Eyebrow | 22 / 700 | ls 0.14em, uppercase |
| Selo header | 21 / 700 | ls 0.06em, uppercase |
| Label / pílula / nota | 20 / 700–900 | ls 0.1–0.14em, uppercase |
| Rodapé parceria | 19 / 700 | ls 0.14em, uppercase |

**Espaçamento** — ritmo de 8px. Valores em uso: 6, 8, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 40, 42, 46, 48, 52, 56, 62, 68.

**Raio** — 12 (inputs) · 32 (card do modal) · 100 (pílulas e botões).

**Sombra** — `0 40px 90px rgba(0,0,0,0.55)` (card do modal).

## Assets
Todos em `assets/` neste bundle.

| Arquivo | Origem | Nota |
|---|---|---|
| `summit-lockup.png` | Mind Design System (`assets/logos/mind-summit-2026-coral.png`) | Recortado do original 7680×4320 e recolorido para branco por script. **Peça o lockup branco oficial ao time de marca antes de ir para produção.** |
| `amy-edmondson.png` | Enviado pelo cliente | Recorte com fundo transparente. Original tem apenas ~380px de largura e é renderizado a 620px — **pedir arquivo em resolução maior.** |
| `wellz-branco-hd.png` | Enviado pelo cliente (`wellz-by-wellhub-digital-logo-branco.png`) | Recortado para a bounding box e reexportado a 2000px de largura. |
| `simbolo-mind.svg` | Mind Design System (`assets/symbols/simbolo-mind-01.svg`) | Não usado na versão final; incluído por conveniência. |
| Ícone de pin | SVG inline | Estilo linha fina, ~equivalente ao `map-pin` do Lucide. Substituir pelo ícone do codebase. |

Fonte Satoshi: carregada da Fontshare no protótipo. Em produção, usar os `.woff2` licenciados que o Mind self-hosta.

## Files
| Arquivo | O que é |
|---|---|
| `Convite CHROs Lunch.dc.html` | **A referência de design.** Estilos inline = spec. A classe `Component` no fim do arquivo contém a lógica do modal e do submit. |
| `support.js` | Runtime do formato de protótipo. **Não portar.** |
| `image-slot.js` | Helper de placeholder de imagem, não usado na versão final. **Não portar.** |
| `assets/*` | Imagens listadas acima. |
| `_ds/` (não incluído) | O Mind Design System vive no projeto de design; use a versão que já existir no codebase. |

## Notas finais
- Copy em pt-BR foi aprovada pelo cliente palavra por palavra — **não reescrever**.
- A distribuição vertical da peça usa `space-between`, não posições absolutas. Manter isso ao portar: foi uma correção deliberada de um layout anterior que se sobrepunha.
- Um PNG 2160×3840 (2×) da peça já foi exportado para uso em convite por e-mail/WhatsApp; se precisar de outro tamanho, ele é gerado a partir deste mesmo HTML.
