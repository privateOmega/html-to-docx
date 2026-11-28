import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

// The <w:gridCol> widths of each <w:tblGrid> in the document.
const grids = async (html) => {
  const xml = await (
    await JSZip.loadAsync(await HTMLtoDOCX(html))
  )
    .file('word/document.xml')
    .async('string');
  return [...xml.matchAll(/<w:tblGrid>(.*?)<\/w:tblGrid>|<w:tblGrid\/>/gs)].map(([, cols = '']) =>
    [...cols.matchAll(/<w:gridCol w:w="([^"]*)"\/>/g)].map((m) => Number(m[1])),
  );
};

// Default page: 12240 twips wide with 1800 twip side margins.
const PAGE = 8640;

describe('table grid', () => {
  it('splits the width equally when no column has a width', async () => {
    expect(await grids('<table><tr><td>a</td><td>b</td><td>c</td></tr></table>')).toEqual([
      [2880, 2880, 2880],
    ]);
  });

  it('writes whole twips', async () => {
    const [grid] = await grids(
      '<table><tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr></table>',
    );
    expect(grid.every(Number.isInteger)).toBe(true);
  });

  // #266
  it('keeps the ratio of absolute column widths', async () => {
    expect(
      await grids(
        '<table><tr><th style="width: 100px">a</th><th style="width: 300px">b</th></tr><tr><td>1</td><td>2</td></tr></table>',
      ),
    ).toEqual([[1500, 4500]]);
  });

  it('scales absolute widths that do not fit on the page', async () => {
    expect(
      await grids(
        '<table><tr><th style="width: 210px">a</th><th style="width: 390px">b</th></tr></table>',
      ),
    ).toEqual([[3024, 5616]]);
  });

  // #105
  it('uses percentage widths of the table width', async () => {
    expect(
      await grids(
        '<table style="width: 100%"><tr><td style="width: 30%">a</td><td style="width: 70%">b</td></tr></table>',
      ),
    ).toEqual([[2592, 6048]]);
  });

  it('gives the remaining width to columns without a width', async () => {
    expect(
      await grids(
        '<table style="width: 100%"><tr><td style="width: 25%">a</td><td>b</td><td>c</td></tr></table>',
      ),
    ).toEqual([[2160, 3240, 3240]]);
  });

  it('spreads the width of a cell over the columns it spans', async () => {
    expect(
      await grids(
        '<table><tr><td colspan="2" style="width: 200px">a</td><td style="width: 100px">b</td></tr></table>',
      ),
    ).toEqual([[1500, 1500, 1500]]);
  });

  it('sizes the grid to the table width', async () => {
    expect(await grids('<table style="width: 50%"><tr><td>a</td><td>b</td></tr></table>')).toEqual([
      [PAGE / 4, PAGE / 4],
    ]);
  });

  it('uses <col> widths when there is a <colgroup>', async () => {
    expect(
      await grids(
        '<table style="width: 100%"><colgroup><col style="width: 20%"><col style="width: 80%"></colgroup><tr><td>a</td><td>b</td></tr></table>',
      ),
    ).toEqual([[1728, 6912]]);
  });

  // A table with several of <colgroup>, <thead> and <tbody> got one grid each.
  it('writes one grid per table', async () => {
    expect(
      await grids(
        '<table><colgroup><col><col></colgroup><thead><tr><th>h1</th><th>h2</th></tr></thead><tbody><tr><td>a</td><td>b</td></tr></tbody></table>',
      ),
    ).toEqual([[4320, 4320]]);
  });

  it('takes the columns from the first row that has cells', async () => {
    expect(await grids('<table><tr></tr><tr><td>a</td><td>b</td></tr></table>')).toEqual([
      [4320, 4320],
    ]);
  });
});
