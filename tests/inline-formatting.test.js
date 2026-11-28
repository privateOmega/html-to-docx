import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

// Run properties of the run whose text is exactly `text`.
const runProperties = async (html, text) => {
  const xml = await (
    await JSZip.loadAsync(await HTMLtoDOCX(html))
  )
    .file('word/document.xml')
    .async('string');
  const run = [...xml.matchAll(/<w:r>(.*?)<\/w:r>/gs)]
    .map((match) => match[1])
    .find((body) => new RegExp(`<w:t[^>]*>${text}</w:t>`).test(body));
  expect(run, `run with text ${text}`).toBeDefined();
  return run.match(/<w:rPr>(.*?)<\/w:rPr>/s)?.[1] ?? '';
};

const TAGS = {
  strong: /<w:b\/>/,
  b: /<w:b\/>/,
  em: /<w:i\/>/,
  i: /<w:i\/>/,
  u: /<w:u w:val="single"\/>/,
  ins: /<w:u w:val="single"\/>/,
  s: /<w:strike( w:val="true")?\/>/,
  del: /<w:strike( w:val="true")?\/>/,
  strike: /<w:strike( w:val="true")?\/>/,
  sub: /<w:vertAlign w:val="subscript"\/>/,
  sup: /<w:vertAlign w:val="superscript"\/>/,
  mark: /<w:highlight w:val="yellow"\/>/,
  code: /<w:highlight w:val="lightGray"\/>/,
};

const POSITIONS = {
  'in a paragraph': (tag) => `<p>before <${tag}>X</${tag}> after</p>`,
  'nested in strong': (tag) => `<p><strong>bold <${tag}>X</${tag}></strong></p>`,
  'in a list item': (tag) => `<ul><li>item <${tag}>X</${tag}></li></ul>`,
  'in a table cell': (tag) => `<table><tr><td>cell <${tag}>X</${tag}></td></tr></table>`,
};

describe('inline formatting tags', () => {
  for (const [tag, expected] of Object.entries(TAGS)) {
    for (const [where, html] of Object.entries(POSITIONS)) {
      it(`<${tag}> ${where}`, async () => {
        expect(await runProperties(html(tag), 'X')).toMatch(expected);
      });
    }
  }

  it.each([
    ['<pre>', '<pre>X</pre>', /<w:rFonts /g],
    ['<code>', '<code>X</code>', /<w:highlight /g],
    ['<p><pre>', '<p><pre>X</pre></p>', /<w:rFonts /g],
  ])('emits each run property once for top-level %s', async (_, html, element) => {
    expect((await runProperties(html, 'X')).match(element)).toHaveLength(1);
  });

  it('keeps the outer formatting on nested runs', async () => {
    const properties = await runProperties('<p><strong>b <em>X</em></strong></p>', 'X');
    expect(properties).toMatch(/<w:b\/>/);
    expect(properties).toMatch(/<w:i\/>/);
  });
});
