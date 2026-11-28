import JSZip from 'jszip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HTMLtoDOCX from '../src/index';

const PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
const DATA_URI = `data:image/png;base64,${PNG}`;

const read = async (html) => {
  const zip = await JSZip.loadAsync(await HTMLtoDOCX(html));
  const document = await zip.file('word/document.xml').async('string');
  return {
    document,
    media: Object.keys(zip.files).filter((n) => n.startsWith('word/media/') && !zip.files[n].dir),
    drawings: (document.match(/<w:drawing>/g) ?? []).length,
    text: [...document.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((t) => t[1]).join(''),
  };
};

let warn;
beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('images inside inline elements', () => {
  // #233
  it('embeds an image nested in spans', async () => {
    const { media, drawings, text } = await read(
      `<p>a<span style="font-size: 11pt;"><span style="color: black;"><img src="${DATA_URI}"></span></span>b</p>`,
    );
    expect(drawings).toBe(1);
    expect(media).toHaveLength(1);
    expect(text).toBe('ab');
  });

  it('embeds an image inside formatting elements and links', async () => {
    const { document, drawings, media } = await read(
      `<p><strong><img src="${DATA_URI}"></strong><a href="https://example.com"><img src="${DATA_URI}"></a></p>`,
    );
    expect(drawings).toBe(2);
    expect(media).toHaveLength(2);
    expect(document).toMatch(/<w:hyperlink [^>]*>\s*<w:r>.*?<w:drawing>/s);
  });

  it('sizes a nested image from its style', async () => {
    const { document } = await read(
      `<p><span><img src="${DATA_URI}" style="width: 100px; height: 50px"></span></p>`,
    );
    expect(document).toContain('<wp:extent cx="952500" cy="476250"/>');
  });

  it('downloads a nested remote image', async () => {
    const fetch = vi.fn(async () => new Response(Buffer.from(PNG, 'base64')));
    vi.stubGlobal('fetch', fetch);
    const { drawings } = await read('<p><span><img src="https://example.com/a.png"></span></p>');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(drawings).toBe(1);
  });

  it('skips a nested image that cannot be read and keeps the text', async () => {
    const { drawings, media, text } = await read('<p>a<span><img src="/relative.png"></span>b</p>');
    expect(drawings).toBe(0);
    expect(media).toEqual([]);
    expect(text).toBe('ab');
    expect(warn).toHaveBeenCalled();
  });
});
