import { expect, it, vi } from 'vitest';

// Deterministic media names so both runs produce identical bytes.
// Counter is reset before each conversion so both runs use the same names.
vi.mock('../src/utils/id', () => ({
  randomId: () => `id${(globalThis.mediaIdCounter += 1)}`,
}));

const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
const HTML = `<h1>Title</h1><p>Text <strong>bold</strong></p><p><img src="${PNG}"/></p><table><tr><td><img src="${PNG}"/></td></tr></table>`;
const OPTIONS = {
  createdAt: new Date('2020-01-01T00:00:00Z'),
  modifiedAt: new Date('2020-01-01T00:00:00Z'),
};

const convert = async () => {
  globalThis.mediaIdCounter = 0;
  vi.resetModules();
  const { default: HTMLtoDOCX } = await import('../src/index');
  return HTMLtoDOCX(HTML, null, OPTIONS);
};

// This file runs in its own process, so dependencies (notably JSZip, which
// checks for Buffer when it loads) are first loaded below while Buffer is
// absent, as they would be in a browser.
it('works without Buffer or the Node `global` alias, as in a browser', async () => {
  const RealBuffer = globalThis.Buffer;
  const realGlobal = globalThis.global;
  let browserResult;
  try {
    delete globalThis.Buffer;
    globalThis.global = undefined;
    browserResult = await convert();
  } finally {
    globalThis.Buffer = RealBuffer;
    globalThis.global = realGlobal;
  }

  expect(browserResult).toBeInstanceOf(Blob);
  expect(browserResult.type).toBe(
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  );

  // Same document produced with Buffer available (Node returns a Buffer).
  const nodeResult = await convert();
  expect(Buffer.isBuffer(nodeResult)).toBe(true);
  // Compare contents rather than raw bytes: zip entries carry the current time.
  const unzip = async (data) => {
    // Imported here, after the Buffer-less run, so it cannot preload JSZip.
    const { default: JSZip } = await import('jszip');
    const zip = await JSZip.loadAsync(data);
    const files = {};
    for (const name of Object.keys(zip.files)
      .filter((key) => !zip.files[key].dir)
      .sort()) {
      files[name] = await zip.file(name).async('uint8array');
    }
    return files;
  };
  const browserFiles = await unzip(await browserResult.arrayBuffer());
  expect(Object.keys(browserFiles)).toContain('word/media/image-id1.png');
  expect(browserFiles).toEqual(await unzip(nodeResult));
});
