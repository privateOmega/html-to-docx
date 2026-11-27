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

describe('run properties', () => {
  it.each([
    ['<pre>', '<pre>X</pre>', /<w:rFonts /g],
    ['<code>', '<code>X</code>', /<w:highlight /g],
  ])('emits each run property once for top-level %s', async (_, html, element) => {
    expect((await runProperties(html, 'X')).match(element)).toHaveLength(1);
  });
});
