import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

const parts = async (html, options) => {
  const zip = await JSZip.loadAsync(await HTMLtoDOCX(html, null, options));
  return {
    document: await zip.file('word/document.xml').async('string'),
    styles: await zip.file('word/styles.xml').async('string'),
  };
};

// The font attributes of an <w:rFonts> element, without theme fonts.
const fonts = (rFonts) =>
  Object.fromEntries(
    [...rFonts.matchAll(/w:(\w+)="([^"]*)"/g)].map(([, key, value]) => [key, value]),
  );

const everyScript = (font) => ({ ascii: font, hAnsi: font, eastAsia: font, cs: font });

describe('fonts', () => {
  // #214: accented Latin letters (â, ț, ș, é) use the hAnsi font, and #216:
  // CJK text uses the eastAsia font. Both came from the theme (Calibri).
  it('uses the document font for every script by default', async () => {
    const { styles } = await parts('<p>âțș 中文</p>', { font: 'Garamond' });
    const rFonts = styles.match(/<w:rPrDefault>.*?<w:rFonts ([^>]*)\/>/s)[1];
    expect(fonts(rFonts)).toEqual(everyScript('Garamond'));
  });

  it('uses an inline font-family for every script', async () => {
    const { document } = await parts('<p><span style="font-family: SimSun">中文 âț</span></p>');
    expect(fonts(document.match(/<w:rFonts ([^>]*)\/>/)[1])).toEqual(everyScript('SimSun'));
  });
});
