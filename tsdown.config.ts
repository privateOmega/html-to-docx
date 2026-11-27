import { defineConfig, type UserConfig } from 'tsdown';

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
]);
