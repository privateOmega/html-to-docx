import fs from 'fs';
import { nodeResolve as resolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import cleaner from 'rollup-plugin-cleaner';
import builtins from 'rollup-plugin-node-builtins';

function loadJSON(path) {
  return JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
}

const meta = loadJSON('package.json');

export default {
  input: 'index.js',
  external: ['color-name', 'html-to-vdom', 'jszip', 'virtual-dom', 'xmlbuilder2', 'html-entities'],
  plugins: [
    resolve(),
    json(),
    commonjs(),
    builtins(),
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
      banner: `// ${meta.homepage} v${
        meta.version
      } Copyright ${new Date().getFullYear()} ${meta.author}`,
      globals: {
        jszip: 'JSZip',
        xmlbuilder2: 'xmlbuilder2',
        'html-to-vdom': 'HTMLToVDOM',
        'html-entities': 'htmlEntities',
        'node:crypto': 'node_crypto',
        'color-name': 'colorNames',
      },
    },
  ],
};
