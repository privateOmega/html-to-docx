import JSZip from 'jszip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HTMLtoDOCX from '../src/index';

const PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

const read = async (docx) => {
  const zip = await JSZip.loadAsync(docx);
  const media = Object.keys(zip.files).filter(
    (name) => name.startsWith('word/media/') && !zip.files[name].dir,
  );
  return { document: await zip.file('word/document.xml').async('string'), media };
};

// The same image in every position the converter handles separately.
const positions = (src) => ({
  'inside a paragraph': `<p>before <img src="${src}"/> after</p>`,
  'top level': `<p>before</p><img src="${src}"/><p>after</p>`,
  'in a table cell': `<table><tr><td>before<img src="${src}"/>after</td></tr></table>`,
});

let warn;
beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('images that cannot be read are skipped', () => {
  for (const [where, html] of Object.entries(positions('https://example.com/missing.png'))) {
    it(`remote 404 page ${where}`, async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response('<h1>Not found</h1>', { status: 404 })),
      );
      const { document, media } = await read(await HTMLtoDOCX(html));
      expect(document).toContain('before');
      expect(document).toContain('after');
      expect(media).toEqual([]);
      expect(warn).toHaveBeenCalled();
    });
  }

  for (const [where, html] of Object.entries(positions('data:image/png;base64,bm90IGFuIGltYWdl'))) {
    it(`data URI that is not an image ${where}`, async () => {
      const { document, media } = await read(await HTMLtoDOCX(html));
      expect(document).toContain('before');
      expect(document).toContain('after');
      expect(media).toEqual([]);
    });
  }

  it('keeps the rest of the paragraph when a download fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );
    const { document } = await read(
      await HTMLtoDOCX('<p>before <img src="https://example.com/a.png"/> after</p>'),
    );
    expect(document).toContain('before');
    expect(document).toContain('after');
  });

  it('still embeds readable images next to unreadable ones', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) =>
        String(url).endsWith('good.png')
          ? new Response(Buffer.from(PNG, 'base64'))
          : new Response('<h1>Not found</h1>', { status: 404 }),
      ),
    );
    const { media } = await read(
      await HTMLtoDOCX(
        '<p><img src="https://example.com/good.png"/></p><img src="https://example.com/bad.png"/>',
      ),
    );
    expect(media.length).toBeGreaterThan(0);
  });
});
