import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

const documentXml = async (html) =>
  (await JSZip.loadAsync(await HTMLtoDOCX(html))).file('word/document.xml').async('string');

describe('table cell spacing (#240, #201)', () => {
  // Any <w:tblCellSpacing>, even with a width of 0, makes Word draw each cell
  // with its own separated borders, which shows as gaps where borders meet.
  it('writes no cell spacing, so Word draws joined borders', async () => {
    for (const html of [
      '<table><tr><td>a</td><td>b</td></tr></table>',
      '<table style="border-collapse: collapse"><tr><td>a</td><td>b</td></tr></table>',
    ]) {
      expect(await documentXml(html)).not.toContain('tblCellSpacing');
    }
  });
});
