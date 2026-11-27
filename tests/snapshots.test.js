import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import HTMLtoDOCX from '../src/index';
import { readDocx } from './helpers/docx';
import fixtureOptions from './fixtures/options';

// 1x1 transparent PNG, returned for every remote image so tests stay offline.
const PIXEL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Remote images: every fetch returns the same pixel.
vi.stubGlobal(
  'fetch',
  vi.fn(async () => new Response(Buffer.from(PIXEL_PNG_BASE64, 'base64'))),
);

// Deterministic ids for embedded media file names.
vi.mock('../src/utils/id', () => {
  let counter = 0;
  return { randomId: () => `id${(counter += 1)}` };
});

const FIXED_DATE = new Date('2020-01-01T00:00:00.000Z');
const fixturesDir = join(__dirname, 'fixtures');
const fixtures = readdirSync(fixturesDir)
  .filter((name) => name.endsWith('.html'))
  .sort();

describe('docx snapshots', () => {
  it.each(fixtures)('%s', async (fixture) => {
    const name = fixture.replace(/\.html$/, '');
    const html = readFileSync(join(fixturesDir, fixture), 'utf8');
    const { headerHTML, footerHTML, ...options } = fixtureOptions[name] || {};

    const buffer = await HTMLtoDOCX(
      html,
      headerHTML,
      { createdAt: FIXED_DATE, modifiedAt: FIXED_DATE, ...options },
      footerHTML,
    );
    const { files, parts } = await readDocx(buffer);

    await expect(files.join('\n')).toMatchFileSnapshot(`__snapshots__/${name}/files.txt`);
    await Promise.all(
      Object.entries(parts).map(([part, xml]) =>
        expect(xml).toMatchFileSnapshot(`__snapshots__/${name}/${part.replace(/\//g, '__')}`),
      ),
    );
  });
});
