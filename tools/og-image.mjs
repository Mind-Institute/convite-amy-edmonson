/**
 * Gera as thumbnails de link (1200 × 630) das páginas de convite.
 *
 *   npm install       # instala o Playwright (só dev)
 *   npm run og
 *
 * IMPORTANTE: rode numa máquina com acesso à Fontshare (ou com os
 * .woff2 da Satoshi self-hospedados). Sem a Satoshi carregada os PNGs
 * saem com a fonte de fallback e a tipografia fica fora da marca.
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { statSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const PECAS = [
  { fonte: 'tools/og-edmondson.html', saida: 'public/assets/og-image.png' },
  { fonte: 'tools/og-maslach.html', saida: 'public/assets/og-image-maslach.png' }
];

const browser = await chromium.launch();
let semSatoshi = 0;

for (const peca of PECAS) {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1
  });

  await page.goto(`file://${resolve(root, peca.fonte)}`, { waitUntil: 'networkidle' });

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

  const output = resolve(root, peca.saida);
  await page.locator('#og').screenshot({ path: output });
  await page.close();

  const kb = Math.round(statSync(output).size / 1024);
  console.log(`✔ ${peca.saida} — 1200×630, ${kb} KB`);
  if (!usouSatoshi) semSatoshi++;
}

await browser.close();

if (semSatoshi) {
  console.warn(
    `\n⚠ A Satoshi NÃO carregou em ${semSatoshi} de ${PECAS.length} peça(s) — os PNGs saíram\n` +
    '  com a fonte de fallback. Regere numa máquina com acesso à Fontshare\n' +
    '  antes de publicar.'
  );
  process.exitCode = 1;
}
