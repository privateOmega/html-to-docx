import { defineConfig } from 'tsdown';

export default defineConfig({
  // Switches to src/index.ts (with dts) once the entry is converted to TypeScript.
  entry: ['index.js'],
  format: ['esm', 'cjs'],
  platform: 'node',
  target: 'node22',
  sourcemap: true,
  dts: false,
  exports: true,
  publint: true,
});
