import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import cleaner from 'rollup-plugin-cleaner';

import * as meta from './package.json';

export default {
  input: 'index.js',
  external: [
    'color-name',
    'escape-html',
    'html-minifier',
    'html-to-vdom',
    'jszip',
    'virtual-dom',
    'xmlbuilder2',
  ],
  plugins: [
    resolve(),
    json({ include: 'package.json', preferConst: true }),
    commonjs(),
    terser({
      mangle: false,
    }),
    cleaner({
      targets: ['./dist/'],
    }),
  ],

  output: [
    {
      file: 'dist/html-to-docx.esm.js',
      format: 'es',
      sourcemap: true,
      banner: `// ${meta.homepage} v${meta.version} Copyright ${new Date().getFullYear()} ${
        meta.author
      }`,
    },
    {
      file: 'dist/html-to-docx.cjs.js',
      format: 'cjs',
      sourcemap: true,
      banner: `// ${meta.homepage} v${meta.version} Copyright ${new Date().getFullYear()} ${
        meta.author
      }`,
    },
  ],
};
