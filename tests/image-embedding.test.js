import JSZip from 'jszip';
import { afterEach, describe, expect, it, vi } from 'vitest';

import HTMLtoDOCX from '../src/index';

const PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
const DATA_URI = `data:image/png;base64,${PNG}`;

// Media files, image relationships and the relationship ids the drawings use.
const read = async (html) => {
  const zip = await JSZip.loadAsync(await HTMLtoDOCX(html));
  const document = await zip.file('word/document.xml').async('string');
  const rels = await zip.file('word/_rels/document.xml.rels').async('string');
  return {
    media: Object.keys(zip.files).filter((n) => n.startsWith('word/media/') && !zip.files[n].dir),
    imageRels: [...rels.matchAll(/Id="(\w+)"[^>]*Target="media\/[^"]+"/g)].map((m) => m[1]),
    embeds: [...document.matchAll(/r:embed="(\w+)"/g)].map((m) => m[1]),
  };
};

const positions = {
  'top level': `<img src="${DATA_URI}"/><img src="${DATA_URI}"/>`,
  'in a paragraph': `<p><img src="${DATA_URI}"/><img src="${DATA_URI}"/></p>`,
  'in a table cell': `<table><tr><td><img src="${DATA_URI}"/><img src="${DATA_URI}"/></td></tr></table>`,
  'in a figure': `<figure><img src="${DATA_URI}"/></figure><figure><img src="${DATA_URI}"/></figure>`,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('each image is embedded once', () => {
  for (const [where, html] of Object.entries(positions)) {
    it(where, async () => {
      const { media, imageRels, embeds } = await read(html);
      expect(embeds).toHaveLength(2);
      expect(media).toHaveLength(2);
      expect(imageRels.sort()).toEqual([...embeds].sort());
    });
  }

  it('downloads a remote top-level image once', async () => {
    const fetch = vi.fn(async () => new Response(Buffer.from(PNG, 'base64')));
    vi.stubGlobal('fetch', fetch);
    const { media, embeds } = await read('<img src="https://example.com/a.png"/>');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(media).toHaveLength(1);
    expect(embeds).toHaveLength(1);
  });
});
