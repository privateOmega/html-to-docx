import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

// For each row, the borders of its first cell: { side: "val/sz" }.
const firstCellBorders = async (html) => {
  const xml = await (
    await JSZip.loadAsync(await HTMLtoDOCX(html))
  )
    .file('word/document.xml')
    .async('string');
  return [...xml.matchAll(/<w:tr>(.*?)<\/w:tr>/gs)].map(([, row]) => {
    const cell = row.match(/<w:tc>(.*?)<\/w:tc>/s)[1];
    const borders = cell.match(/<w:tcBorders>(.*?)<\/w:tcBorders>/s)?.[1] ?? '';
    return Object.fromEntries(
      [...borders.matchAll(/<w:(\w+) w:val="(\w+)"(?: w:sz="([^"]*)")?/g)].map(
        ([, side, val, sz]) => [side, sz === undefined ? val : `${val}/${sz}`],
      ),
    );
  });
};

describe('table cell borders', () => {
  // `border-top: none` wrote w:sz="none", which is not a valid width.
  it('writes no border for a side set to none or 0', async () => {
    const [cell] = await firstCellBorders(
      '<table><tr><td style="border-top: none; border-left: 0; border-right: 1pt solid red">a</td></tr></table>',
    );
    expect(cell.top).toBe('nil');
    expect(cell.left).toBe('nil');
    expect(cell.right).toBe('single/8');
  });
});
