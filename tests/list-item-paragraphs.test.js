import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

// Each body paragraph: its text, list level when numbered, and left indent.
const paragraphs = async (html) => {
  const xml = await (
    await JSZip.loadAsync(await HTMLtoDOCX(html))
  )
    .file('word/document.xml')
    .async('string');
  return [...xml.matchAll(/<w:p>(.*?)<\/w:p>/gs)].map(([, p]) => {
    const level = p.match(/<w:ilvl w:val="(\d+)"\/>/);
    const indent = p.match(/<w:ind w:left="(\d+)"/);
    return {
      text: [...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((t) => t[1]).join(''),
      level: level ? Number(level[1]) : null,
      indent: indent ? Number(indent[1]) : null,
    };
  });
};

const item = (text, level = 0) => ({ text, level, indent: null });
// Further paragraphs of a list item: not numbered, indented like its text.
const continuation = (text, level = 0) => ({ text, level: null, indent: (level + 1) * 720 });

describe('list items', () => {
  it('renders one numbered paragraph per item', async () => {
    expect(await paragraphs('<ul><li>a</li><li>b <b>c</b> d</li></ul>')).toEqual([
      item('a'),
      item('b c d'),
    ]);
  });

  // #243: only the first paragraph survived; the others became empty runs.
  it('keeps every paragraph of an item', async () => {
    expect(await paragraphs('<ul><li><p>1</p><p>2</p><p>3</p></li></ul>')).toEqual([
      item('1'),
      continuation('2'),
      continuation('3'),
    ]);
  });

  // #87
  it('keeps a paragraph that follows inline content', async () => {
    expect(
      await paragraphs('<ol><li><em><u>Comprehension:</u></em>(Que 1)<p>Passage</p></li></ol>'),
    ).toEqual([item('Comprehension:(Que 1)'), continuation('Passage')]);
  });

  it('continues an item after a nested list', async () => {
    expect(await paragraphs('<ul><li>a<ul><li>b</li></ul>c</li><li>d</li></ul>')).toEqual([
      item('a'),
      item('b', 1),
      continuation('c'),
      item('d'),
    ]);
  });

  it('indents continuation paragraphs of nested items', async () => {
    expect(await paragraphs('<ul><li>a<ul><li><p>b</p><p>c</p></li></ul></li></ul>')).toEqual([
      item('a'),
      item('b', 1),
      continuation('c', 1),
    ]);
  });
});
