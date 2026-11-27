import JSZip from 'jszip';
import { afterEach, describe, expect, it, vi } from 'vitest';

import HTMLtoDOCX from '../src/index';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
  'base64',
);

const mediaFiles = async (docx) => {
  const zip = await JSZip.loadAsync(docx);
  return Object.keys(zip.files).filter(
    (name) => name.startsWith('word/media/') && !zip.files[name].dir,
  );
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('remote image type comes from the image data', () => {
  it.each([
    ['a URL without an extension', 'https://example.com/image?id=3'],
    ['a dynamic endpoint', 'https://example.com/photo.php'],
    ['a regular image URL', 'https://example.com/photo.png'],
  ])('embeds a PNG served from %s as .png', async (_, url) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(PNG)),
    );
    const media = await mediaFiles(await HTMLtoDOCX(`<p><img src="${url}"/></p>`));
    expect(media.length).toBeGreaterThan(0);
    for (const name of media) expect(name).toMatch(/\.png$/);
  });
});
