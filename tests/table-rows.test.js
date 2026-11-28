import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

// For each table row, the cells as "text" plus their merge/span markers.
const rows = async (html) => {
  const xml = await (
    await JSZip.loadAsync(await HTMLtoDOCX(html))
  )
    .file('word/document.xml')
    .async('string');
  return [...xml.matchAll(/<w:tr>(.*?)<\/w:tr>/gs)].map(([, row]) =>
    [...row.matchAll(/<w:tc>(.*?)<\/w:tc>/gs)].map(([, cell]) => {
      const text = [...cell.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((t) => t[1]).join('');
      const merge = cell.match(/<w:vMerge w:val="(\w+)"/)?.[1];
      const span = cell.match(/<w:gridSpan w:val="(\d+)"/)?.[1];
      return [text, merge && `vMerge=${merge}`, span && `gridSpan=${span}`]
        .filter(Boolean)
        .join(' ');
    }),
  );
};

describe('table rows', () => {
  // #86: a <w:tr> without any <w:tc> makes Word reject the document.
  it('leaves out rows without cells', async () => {
    expect(await rows('<table><tr></tr><tr><td>a</td></tr><tr></tr></table>')).toEqual([['a']]);
  });

  it('keeps a row that only continues a cell from the row above', async () => {
    expect(await rows('<table><tr><td rowspan="2">a</td></tr><tr></tr></table>')).toEqual([
      ['a vMerge=restart'],
      ['vMerge=continue'],
    ]);
  });

  // #223, #251: continued cells were written with gridSpan 0, which is invalid.
  it('writes a grid span only for cells that span columns', async () => {
    expect(
      await rows(
        '<table><tr><td colspan="2">a</td></tr><tr><td rowspan="2">b</td><td>c</td></tr><tr><td>d</td></tr></table>',
      ),
    ).toEqual([['a gridSpan=2'], ['b vMerge=restart', 'c'], ['vMerge=continue', 'd']]);
  });

  it('keeps the grid span of a continued cell that spans columns', async () => {
    expect(
      await rows(
        '<table><tr><td rowspan="2" colspan="2">a</td><td>b</td></tr><tr><td>c</td></tr></table>',
      ),
    ).toEqual([
      ['a vMerge=restart gridSpan=2', 'b'],
      ['vMerge=continue gridSpan=2', 'c'],
    ]);
  });
});
