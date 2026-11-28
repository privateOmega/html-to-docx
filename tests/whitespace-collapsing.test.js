import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

// The text of each run in the document body.
const runTexts = async (html) => {
  const xml = await (
    await JSZip.loadAsync(await HTMLtoDOCX(html))
  )
    .file('word/document.xml')
    .async('string');
  return [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((t) => t[1]);
};

describe('whitespace inside text', () => {
  it('collapses runs of spaces, tabs and newlines to one space, like a browser', async () => {
    expect(await runTexts('<p>to make\n                a type    specimen\t\tbook</p>')).toEqual([
      'to make a type specimen book',
    ]);
  });

  it('collapses whitespace inside inline elements', async () => {
    expect(
      await runTexts('<p><strong>\n    Lorem   Ipsum\n</strong> and <u>more    text</u></p>'),
    ).toEqual([' Lorem Ipsum ', ' and ', 'more text']);
  });

  it('leaves non-breaking spaces alone', async () => {
    expect(await runTexts('<p>a&nbsp;&nbsp;&nbsp;b</p>')).toEqual(['a   b']);
  });

  it('leaves the content of <pre> alone', async () => {
    expect(await runTexts('<pre>a    b</pre>')).toEqual(['a    b']);
  });
});
