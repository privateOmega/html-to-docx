import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

// The text runs of the document body: text, formatting and link target.
const runs = async (html) => {
  const zip = await JSZip.loadAsync(await HTMLtoDOCX(html));
  const xml = await zip.file('word/document.xml').async('string');
  const rels = await zip.file('word/_rels/document.xml.rels').async('string');
  const target = (id) => rels.match(new RegExp(`Id="${id}"[^>]*Target="([^"]*)"`))?.[1];
  const result = [];
  const pattern = /<w:hyperlink r:id="(\w+)"[^>]*>(.*?)<\/w:hyperlink>|<w:r>(.*?)<\/w:r>/gs;
  const readRun = (run, link) => {
    const text = run.match(/<w:t[^>]*>([^<]*)<\/w:t>/)?.[1];
    if (text === undefined) return;
    const props = run.match(/<w:rPr>(.*?)<\/w:rPr>/s)?.[1] ?? '';
    const format = ['b', 'i', 'u', 'strike', 'color']
      .filter((tag) => new RegExp(`<w:${tag}[ />]`).test(props))
      .join(',');
    result.push(link ? { text, format, link } : { text, format });
  };
  for (const [, id, inner, run] of xml.matchAll(pattern)) {
    if (id) {
      for (const [, r] of inner.matchAll(/<w:r>(.*?)<\/w:r>/gs)) readRun(r, target(id));
    } else {
      readRun(run);
    }
  }
  return result;
};

describe('nested inline elements', () => {
  // #236
  it('keeps the formatting of every enclosing element', async () => {
    expect(await runs('<p><strong><u>Sample</u></strong></p>')).toEqual([
      { text: 'Sample', format: 'b,u' },
    ]);
    expect(await runs('<p><b><i><u>a</u>b</i></b></p>')).toEqual([
      { text: 'a', format: 'b,i,u' },
      { text: 'b', format: 'b,i' },
    ]);
  });

  it('does not leak formatting to siblings', async () => {
    expect(await runs('<p><b>a<i>b</i>c</b>d</p>')).toEqual([
      { text: 'a', format: 'b' },
      { text: 'b', format: 'b,i' },
      { text: 'c', format: 'b' },
      { text: 'd', format: '' },
    ]);
  });

  // #54
  it('keeps links inside inline elements', async () => {
    expect(await runs('<p><span>styled <a href="https://a.example">one</a></span></p>')).toEqual([
      { text: 'styled ', format: '' },
      { text: 'one', format: '', link: 'https://a.example' },
    ]);
    expect(await runs('<p><b>bold <a href="https://b.example">two</a></b></p>')).toEqual([
      { text: 'bold ', format: 'b' },
      { text: 'two', format: 'b', link: 'https://b.example' },
    ]);
  });

  it('keeps every child of a link', async () => {
    expect(
      await runs('<p><a href="https://c.example"><strong>b</strong> and <em>i</em></a></p>'),
    ).toEqual([
      { text: 'b', format: 'b', link: 'https://c.example' },
      { text: ' and ', format: '', link: 'https://c.example' },
      { text: 'i', format: 'i', link: 'https://c.example' },
    ]);
  });

  it('keeps the text of other inline elements', async () => {
    expect(await runs('<p><small>s</small>-<abbr title="x">a</abbr></p>')).toEqual([
      { text: 's', format: '' },
      { text: '-', format: '' },
      { text: 'a', format: '' },
    ]);
  });

  it('applies inline styles of formatting elements', async () => {
    expect(await runs('<p><b style="color: red">r</b></p>')).toEqual([
      { text: 'r', format: 'b,color' },
    ]);
  });
});
