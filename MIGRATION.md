# Migrating from 1.x to 2.0

2.0 modernizes the package: it is written in TypeScript, ships ES module and CommonJS builds with type definitions, and runs in browsers without polyfills. **The documents it generates are unchanged** for the same input and options, apart from the small differences listed under [Behaviour](#behaviour).

The `HTMLtoDOCX(htmlString, headerHTMLString, documentOptions, footerHTMLString)` API and all options are the same.

## Breaking changes

### Node.js 22 or newer

Node.js 20 reached end of life in April 2026. 2.0 requires Node.js 22+ (`engines.node: ">=22"`).

### No UMD build; use the package entry point

`dist/html-to-docx.umd.js` and `dist/html-to-docx.esm.js` are gone. The package now has an `exports` map:

| Import                                  | Resolves to                  |
| --------------------------------------- | ---------------------------- |
| `import HTMLtoDOCX from 'html-to-docx'` | `dist/index.mjs` (ES module) |
| `require('html-to-docx')`               | `dist/index.cjs` (CommonJS)  |

`require('html-to-docx')` still returns the function directly. Deep imports into `dist/` are no longer supported. To use it from a `<script>` tag, bundle it or load it from an ES-module CDN (for example `https://esm.sh/html-to-docx`).

### Browsers: remove the Buffer polyfill

1.x needed Node's `Buffer` in the browser (the UMD build bundled polyfills; bundlers needed a `buffer` polyfill). 2.0 uses no Node built-ins in the conversion, so you can remove those polyfills. In the browser the result is a `Blob`, as before.

### TypeScript

Types are now included. If you installed the community `@types/html-to-docx`, uninstall it:

```bash
npm uninstall @types/html-to-docx
```

Named type exports are available: `import HTMLtoDOCX, { type DocumentOptions } from 'html-to-docx'`. With CommonJS, use `HTMLtoDOCX.DocumentOptions`.

## Behaviour

- **`decodeUnicode: true`**: entity decoding uses html-entities 2.6, which fixes names that contain a shorter legacy entity (`&centerdot;` now decodes to `·` instead of `¢erdot;`). `&lang;` and `&rang;` decode to U+2329/U+232A instead of U+27E8/U+27E9.
- **Embedded media file names** inside the `.docx` (`word/media/image-….png`) use a 32-character hex id instead of a 21-character id. They are internal to the document.
- **Remote images** are downloaded with the built-in `fetch` instead of `node-fetch`. Redirects are still followed and the response status is still not checked. `.jxl` images now get the `image/jxl` type.

## Removed dependencies

`lodash`, `nanoid`, `image-to-base64` (and `node-fetch`) are no longer dependencies, and `xmlbuilder2` is no longer pinned to 2.1.2 with `@oozcitak` overrides.
