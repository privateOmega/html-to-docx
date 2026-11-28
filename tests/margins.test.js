import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

// The <w:pgMar> attributes of the document section, as numbers.
const pageMargins = async (options) => {
  const xml = await (
    await JSZip.loadAsync(await HTMLtoDOCX('<p>x</p>', null, options))
  )
    .file('word/document.xml')
    .async('string');
  const pgMar = xml.match(/<w:pgMar ([^>]*)\/>/)[1];
  return Object.fromEntries(
    [...pgMar.matchAll(/w:(\w+)="([^"]*)"/g)].map(([, key, value]) => [key, Number(value)]),
  );
};

const PORTRAIT = {
  top: 1440,
  right: 1800,
  bottom: 1440,
  left: 1800,
  header: 720,
  footer: 720,
  gutter: 0,
};

describe('margins', () => {
  it('uses the defaults when no margins are given', async () => {
    expect(await pageMargins({})).toEqual(PORTRAIT);
  });

  // #225, #57: unspecified sides used to be written as "undefined", which Word
  // rejects as a corrupt file.
  it('fills in the defaults for sides that are not given', async () => {
    expect(await pageMargins({ margins: { top: 10000, right: 2400, left: 5000 } })).toEqual({
      ...PORTRAIT,
      top: 10000,
      right: 2400,
      left: 5000,
    });
    expect(await pageMargins({ margins: { top: '0.5in', left: '2in' } })).toEqual({
      ...PORTRAIT,
      top: 720,
      left: 2880,
    });
  });

  // The README's landscape example passes only top and bottom.
  it('fills in the documented defaults in landscape orientation', async () => {
    expect(
      await pageMargins({ orientation: 'landscape', margins: { top: '1in', bottom: '1in' } }),
    ).toEqual({ ...PORTRAIT, top: 1440, bottom: 1440 });
  });

  // #199: a margin of 0 was replaced by the default.
  it('honours a margin of 0', async () => {
    expect(await pageMargins({ margins: { left: 0, right: 0 } })).toEqual({
      ...PORTRAIT,
      left: 0,
      right: 0,
    });
  });
});
