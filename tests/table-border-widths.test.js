import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

// The w:sz of every table and cell border, in eighths of a point.
const borderSizes = async (html) => {
  const xml = await (
    await JSZip.loadAsync(await HTMLtoDOCX(html))
  )
    .file('word/document.xml')
    .async('string');
  const borders = [
    ...xml.matchAll(/<w:(?:tblBorders|tcBorders)>(.*?)<\/w:(?:tblBorders|tcBorders)>/gs),
  ]
    .map(([, inner]) => inner)
    .join('');
  return [...borders.matchAll(/w:sz="([^"]*)"/g)].map((m) => Number(m[1]));
};

// Word's thinnest line border is 1/4 pt (2) and its thickest 12 pt (96).
const inWordRange = (sizes) => sizes.every((size) => size >= 2 && size <= 96);

describe('table border widths', () => {
  // Default cell borders were 1/8 pt, which Word draws unevenly: parts of
  // some cell borders went missing.
  it('draws default cell borders at least 1/4 pt wide', async () => {
    const sizes = await borderSizes('<table><tr><td>a</td><td>b</td></tr></table>');
    expect(sizes.length).toBeGreaterThan(0);
    expect(inWordRange(sizes)).toBe(true);
  });

  it('keeps the HTML border attribute within the range Word draws', async () => {
    expect(inWordRange(await borderSizes('<table border="1"><tr><td>a</td></tr></table>'))).toBe(
      true,
    );
  });

  it('caps very wide CSS borders at 12 pt', async () => {
    const sizes = await borderSizes(
      '<table style="border: 40px solid black"><tr><td style="border: 40px solid red">a</td></tr></table>',
    );
    expect(sizes).toContain(96);
    expect(inWordRange(sizes)).toBe(true);
  });
});
