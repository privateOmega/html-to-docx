import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

describe('blockquote', () => {
  // Runs inside a blockquote were built without the document, so an inline
  // font-family crashed on createFont.
  it('applies font families inside a blockquote', async () => {
    const zip = await JSZip.loadAsync(
      await HTMLtoDOCX('<blockquote>q <span style="font-family: Georgia">g</span></blockquote>'),
    );
    const xml = await zip.file('word/document.xml').async('string');
    expect(xml).toContain('w:ascii="Georgia"');
  });
});
