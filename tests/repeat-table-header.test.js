import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

const TABLE =
  '<table><thead><tr><th>H1</th><th>H2</th></tr></thead>' +
  '<tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>';

// For each table row, whether it is marked as a repeating header row.
const headerRows = async (html, options) => {
  const xml = await (
    await JSZip.loadAsync(await HTMLtoDOCX(html, null, options))
  )
    .file('word/document.xml')
    .async('string');
  return [...xml.matchAll(/<w:tr>(.*?)<\/w:tr>/gs)].map((row) => /<w:tblHeader\/>/.test(row[1]));
};

describe('table.row.repeatTableHeader', () => {
  it('marks <thead> rows as repeating header rows', async () => {
    expect(await headerRows(TABLE, { table: { row: { repeatTableHeader: true } } })).toEqual([
      true,
      false,
      false,
    ]);
  });

  it('is off by default', async () => {
    expect(await headerRows(TABLE)).toEqual([false, false, false]);
  });

  it('marks nothing in a table without <thead>', async () => {
    const html = '<table><tr><th>H</th></tr><tr><td>a</td></tr></table>';
    expect(await headerRows(html, { table: { row: { repeatTableHeader: true } } })).toEqual([
      false,
      false,
    ]);
  });

  it('works together with cantSplit', async () => {
    const xml = await (
      await JSZip.loadAsync(
        await HTMLtoDOCX(TABLE, null, {
          table: { row: { repeatTableHeader: true, cantSplit: true } },
        }),
      )
    )
      .file('word/document.xml')
      .async('string');
    const firstRow = xml.match(/<w:tr>(.*?)<\/w:tr>/s)[1];
    expect(firstRow).toMatch(/<w:cantSplit\/>/);
    expect(firstRow).toMatch(/<w:tblHeader\/>/);
  });
});
