import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';
import { readDocx } from './helpers/docx';

describe('page-break-before', () => {
  it('emits a page break before a paragraph styled page-break-before: always', async () => {
    const buffer = await HTMLtoDOCX(
      '<p>Text before break</p><p style="page-break-before: always;">Should start on new page</p>',
    );
    const { parts } = await readDocx(buffer);
    const document = parts['word/document.xml'];
    expect(document).toContain('<w:br w:type="page"/>');
    expect(document).toContain('Should start on new page');
  });

  it('emits a page break before any element styled page-break-before: always', async () => {
    const buffer = await HTMLtoDOCX(
      '<p>Text before break</p><h1 style="page-break-before: always;">Heading on new page</h1>',
    );
    const { parts } = await readDocx(buffer);
    const document = parts['word/document.xml'];
    expect(document).toContain('<w:br w:type="page"/>');
    expect(document).toContain('Heading on new page');
  });

  it('still emits a page break for a div styled page-break-after: always', async () => {
    const buffer = await HTMLtoDOCX(
      '<p>First page</p><div style="page-break-after: always;"></div><p>Second page</p>',
    );
    const { parts } = await readDocx(buffer);
    expect(parts['word/document.xml']).toContain('<w:br w:type="page"/>');
  });
});
