import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

const TABLE = '<table><tr><td>cell</td></tr></table>';

// The top-level blocks of a part: "table", "empty" for a paragraph without
// text, or the paragraph's text. Headers are serialized without the w: prefix.
const blocks = (xml, root) => {
  const unprefixed = xml.replace(/<(\/?)w:/g, '<$1');
  const body = unprefixed.match(new RegExp(`<${root}[^>]*>(.*)</${root}>`, 's'))[1];
  const result = [];
  for (const [element] of body.matchAll(/<tbl>.*?<\/tbl>|<p>.*?<\/p>|<p\/>/gs)) {
    if (element.startsWith('<tbl>')) {
      result.push('table');
    } else {
      const text = [...element.matchAll(/<t(?: [^>]*)?>([^<]*)<\/t>/g)].map((t) => t[1]).join('');
      result.push(text || 'empty');
    }
  }
  return result;
};

const bodyBlocks = async (html) => {
  const zip = await JSZip.loadAsync(await HTMLtoDOCX(html));
  return blocks(await zip.file('word/document.xml').async('string'), 'body');
};

describe('paragraphs after tables (#138)', () => {
  it('adds no empty paragraph between a table and the next paragraph', async () => {
    expect(await bodyBlocks(`<p>before</p>${TABLE}<p>after</p>`)).toEqual([
      'before',
      'table',
      'after',
    ]);
  });

  // Without a paragraph in between, Word merges adjacent tables into one.
  it('keeps adjacent tables apart', async () => {
    expect(await bodyBlocks(`${TABLE}${TABLE}<p>after</p>`)).toEqual([
      'table',
      'empty',
      'table',
      'after',
    ]);
  });

  it('ends the document with a paragraph after a final table', async () => {
    expect(await bodyBlocks(`<p>before</p>${TABLE}`)).toEqual(['before', 'table', 'empty']);
  });

  it('treats tables inside other elements the same way', async () => {
    expect(
      await bodyBlocks(`<div>${TABLE}</div><div><p>after</p></div><figure>${TABLE}</figure>`),
    ).toEqual(['table', 'after', 'table', 'empty']);
  });

  it('ends a header or footer with a paragraph after a final table', async () => {
    const zip = await JSZip.loadAsync(
      await HTMLtoDOCX('<p>body</p>', TABLE, { header: true, footer: true }, `<p>f</p>${TABLE}`),
    );
    const names = Object.keys(zip.files);
    const header = names.find((name) => /^word\/header\d*\.xml$/.test(name));
    const footer = names.find((name) => /^word\/footer\d*\.xml$/.test(name));
    expect(blocks(await zip.file(header).async('string'), 'hdr')).toEqual(['table', 'empty']);
    expect(blocks(await zip.file(footer).async('string'), 'ftr')).toEqual(['f', 'table', 'empty']);
  });
});
