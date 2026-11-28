import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

// The text of each body paragraph (outside tables), and the number of tables.
const read = async (html) => {
  const xml = await (
    await JSZip.loadAsync(await HTMLtoDOCX(html))
  )
    .file('word/document.xml')
    .async('string');
  const text = (part) => [...part.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((t) => t[1]).join('');
  const body = xml.replace(/<w:tbl>.*?<\/w:tbl>/gs, '');
  return {
    paragraphs: [...body.matchAll(/<w:p>(.*?)<\/w:p>/gs)].map(([, p]) => text(p)),
    cells: [...xml.matchAll(/<w:tc>(.*?)<\/w:tc>/gs)].map(([, c]) => text(c)),
  };
};

describe('whitespace between inline elements', () => {
  // #103
  it('keeps the space between two inline elements', async () => {
    const { paragraphs } = await read(
      '<p><strong>Bosch</strong> <em>arrived</em> <u>late</u> and parked.</p>',
    );
    expect(paragraphs).toEqual(['Bosch arrived late and parked.']);
  });

  it('collapses a run of whitespace to one space', async () => {
    const { paragraphs } = await read('<p><b>a</b>\n   \t<i>b</i></p>');
    expect(paragraphs).toEqual(['a b']);
  });

  it('keeps it inside list items and table cells', async () => {
    const { paragraphs, cells } = await read(
      '<ul><li><b>a</b> <i>b</i></li></ul><table><tr><td><b>c</b> <i>d</i></td></tr></table>',
    );
    expect(paragraphs[0]).toBe('a b');
    expect(cells).toEqual(['c d']);
  });

  it('still drops whitespace between block elements', async () => {
    const { paragraphs, cells } = await read(
      '<p>one</p>\n  <p>two</p>\n<table>\n  <tr>\n    <td>x</td>\n    <td>y</td>\n  </tr>\n</table>',
    );
    expect(paragraphs.slice(0, 2)).toEqual(['one', 'two']);
    expect(cells).toEqual(['x', 'y']);
  });
});
