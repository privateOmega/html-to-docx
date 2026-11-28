import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

const firstCellWidth = async (width) => {
  const xml = await (
    await JSZip.loadAsync(
      await HTMLtoDOCX(`<table><tr><td style="width: ${width};">x</td><td>y</td></tr></table>`),
    )
  )
    .file('word/document.xml')
    .async('string');
  const firstCell = xml.match(/<w:tc>(.*?)<\/w:tc>/s)[1];
  return firstCell.match(/<w:tcW [^>]*\/>/)?.[0] ?? null;
};

describe('table cell widths', () => {
  it.each([
    ['50%', '<w:tcW w:w="2500" w:type="pct"/>'],
    ['100%', '<w:tcW w:w="5000" w:type="pct"/>'],
    ['33.3%', '<w:tcW w:w="1665" w:type="pct"/>'],
    ['auto', '<w:tcW w:w="0" w:type="auto"/>'],
  ])('maps %s', async (width, expected) => {
    expect(await firstCellWidth(width)).toBe(expected);
  });

  it.each(['100px', '2cm', '1in', '12pt'])('keeps absolute width %s in twips', async (width) => {
    expect(await firstCellWidth(width)).toMatch(/^<w:tcW w:w="\d+" w:type="dxa"\/>$/);
  });

  it.each(['3em', '100', '50vw'])(
    'omits an unsupported width (%s) instead of failing',
    async (width) => {
      expect(await firstCellWidth(width)).toBeNull();
    },
  );
});
