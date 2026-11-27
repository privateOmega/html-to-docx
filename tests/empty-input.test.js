import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

const documentXML = async (docx) =>
  (await JSZip.loadAsync(docx)).file('word/document.xml').async('string');

describe('empty and invalid input', () => {
  it('produces an empty document for an empty string', async () => {
    const xml = await documentXML(await HTMLtoDOCX(''));
    expect(xml).toContain('<w:body>');
    expect(xml).toContain('<w:sectPr>');
    expect(xml).not.toContain('<w:t');
  });

  it('converts whitespace-only input (a single space run, as before)', async () => {
    const xml = await documentXML(await HTMLtoDOCX('  \n\t '));
    expect(xml).toContain('<w:body>');
  });

  it('produces an empty body with a header and footer', async () => {
    const zip = await JSZip.loadAsync(
      await HTMLtoDOCX('', '<p>Header</p>', { header: true, footer: true }, '<p>Footer</p>'),
    );
    expect(await zip.file('word/header1.xml').async('string')).toContain('Header');
    expect(await zip.file('word/footer1.xml').async('string')).toContain('Footer');
  });

  for (const value of [null, undefined, 42, {}]) {
    it(`rejects ${JSON.stringify(value) ?? 'undefined'} with a clear error`, async () => {
      await expect(HTMLtoDOCX(value)).rejects.toThrow(
        new TypeError('HTMLtoDOCX: htmlString must be a string'),
      );
    });
  }
});
