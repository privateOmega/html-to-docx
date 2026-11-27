import { fileURLToPath } from 'node:url';

import { defineConfig, type UserConfig } from 'tsdown';

const emptyShim = fileURLToPath(new URL('./src/shims/empty.ts', import.meta.url));

const shared: UserConfig = {
  platform: 'node',
  target: 'node22',
  sourcemap: true,
  dts: true,
  publint: true,
};

export default defineConfig([
  // ESM: default export plus named type exports.
  { ...shared, entry: { index: 'src/index.ts' }, format: 'esm' },
  // CJS: single default export so require() returns the function and the
  // declarations use `export =` (src/index.ts has named type exports too).
  { ...shared, entry: { index: 'src/cjs.ts' }, format: 'cjs' },
  // Browser: dependencies bundled, with an `events` polyfill, so bundlers and
  // plain <script type="module"> both work without Node polyfills. Types are
  // shared with the ESM build.
  {
    ...shared,
    entry: { 'index.browser': 'src/index.ts' },
    format: 'esm',
    platform: 'browser',
    dts: false,
    minify: true,
    // The bundled source map is ~2.5 MB; keep the npm package small.
    sourcemap: false,
    outExtensions: () => ({ js: '.mjs' }),
    deps: { alwaysBundle: [/.*/] },
    alias: {
      // Used: xmlbuilder2 and htmlparser2 extend EventEmitter at load time;
      // ent decodes astral numeric entities with punycode.
      events: 'events/',
      punycode: 'punycode/punycode.js',
      // Imported but not used by the conversion (stream and URL helpers).
      buffer: emptyShim,
      url: emptyShim,
    },
  },
]);
