/**
 * Gera assets/og-image.png (1200 × 630) a partir de og-image.html.
 *
 *   npm install       # instala o Playwright (só dev)
 *   npm run og
 *
 * IMPORTANTE: rode numa máquina com acesso à Fontshare (ou com os
 * .woff2 da Satoshi self-hospedados). Sem a Satoshi carregada o PNG
 * sai com a fonte de fallback e a tipografia fica fora da marca.
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { statSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = `file://${resolve(root, 'og-image.html')}`;
const output = resolve(root, 'assets/og-image.png');

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

await page.goto(source, { waitUntil: 'networkidle' });

// document.fonts.check() responde true para famílias que não existem,
// então a checagem é por largura: Satoshi carregada mede diferente do fallback.
const usouSatoshi = await page.evaluate(async () => {
  await document.fonts.ready;
  const amostra = 'AMY EDMONDSON, SEM PALCO';
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = '900 72px monospace';
  const fallback = ctx.measureText(amostra).width;
  ctx.font = '900 72px "Satoshi", monospace';
  return ctx.measureText(amostra).width !== fallback;
});

await page.locator('#og').screenshot({ path: output });
await browser.close();

const kb = Math.round(statSync(output).size / 1024);
console.log(`✔ ${output} — 1200×630, ${kb} KB`);

if (!usouSatoshi) {
  console.warn(
    '\n⚠ A Satoshi NÃO carregou — o PNG saiu com a fonte de fallback.\n' +
    '  Regere numa máquina com acesso à Fontshare antes de publicar.'
  );
  process.exitCode = 1;
}
