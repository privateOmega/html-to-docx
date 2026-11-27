// Loads dist/index.browser.mjs in headless Chromium, without a bundler, and
// converts a document there. Fails if the browser build needs anything Node
// provides (Buffer, events, path, ...), so run it after `pnpm build`.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import JSZip from 'jszip';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
  'base64',
);
const TYPES = { '.html': 'text/html', '.mjs': 'text/javascript', '.map': 'application/json' };

const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/') {
    response.writeHead(200, { 'content-type': 'text/html' });
    return response.end('<!doctype html><title>html-to-docx browser test</title>');
  }
  if (url.pathname === '/image') {
    response.writeHead(200, { 'content-type': 'image/png' });
    return response.end(PNG);
  }
  if (url.pathname.startsWith('/dist/')) {
    try {
      const body = await readFile(join(root, url.pathname));
      response.writeHead(200, { 'content-type': TYPES[extname(url.pathname)] ?? 'text/plain' });
      return response.end(body);
    } catch {
      // fall through to 404
    }
  }
  response.writeHead(404, { 'content-type': 'text/html' });
  return response.end('<h1>Not found</h1>');
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const HTML = `
  <h1>Browser test</h1>
  <p>Text with <strong>bold</strong>, an entity &amp; an emoji &#x1F600;.</p>
  <ul><li>one</li><li>two</li></ul>
  <table><tr><td>cell</td><td><img src="data:image/png;base64,${PNG.toString('base64')}"/></td></tr></table>
  <p>remote: <img src="${origin}/image"/> and missing: <img src="${origin}/missing.png"/> end</p>`;

const browser = await chromium.launch();
let failures = 0;
const check = (ok, message) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${message}`);
  if (!ok) failures += 1;
};
try {
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(origin);

  const result = await page.evaluate(
    async ({ html, moduleUrl }) => {
      const { default: HTMLtoDOCX } = await import(moduleUrl);
      const output = await HTMLtoDOCX(html, null, { footer: true, pageNumber: true });
      const bytes = new Uint8Array(await output.arrayBuffer());
      return {
        isBlob: output instanceof Blob,
        type: output.type,
        hasBuffer: typeof globalThis.Buffer !== 'undefined',
        bytes: Array.from(bytes),
      };
    },
    { html: HTML, moduleUrl: `${origin}/dist/index.browser.mjs` },
  );

  check(!result.hasBuffer, 'page has no Buffer global');
  check(result.isBlob, 'result is a Blob');
  check(
    result.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    `Blob type is the DOCX MIME type (${result.type})`,
  );
  const zip = await JSZip.loadAsync(Uint8Array.from(result.bytes));
  const documentXML = await zip.file('word/document.xml').async('string');
  for (const text of [
    'Browser test',
    'bold',
    '&amp;',
    '\u{1F600}',
    'one',
    'cell',
    'remote:',
    'end',
  ]) {
    check(documentXML.includes(text), `document contains ${JSON.stringify(text)}`);
  }
  const media = Object.keys(zip.files).filter(
    (name) => name.startsWith('word/media/') && !zip.files[name].dir,
  );
  check(
    media.length > 0 && media.every((name) => name.endsWith('.png')),
    `images embedded as PNG (${media.length})`,
  );
  check(Boolean(zip.file('word/footer1.xml')), 'footer part present');
  check(
    pageErrors.length === 0,
    `no page errors${pageErrors.length ? `: ${pageErrors.join('; ')}` : ''}`,
  );
} finally {
  await browser.close();
  server.close();
}

if (failures) {
  console.error(`${failures} browser check(s) failed`);
  process.exit(1);
}
