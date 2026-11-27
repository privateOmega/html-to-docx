# html-to-docx: Vite + React example

Converts editable HTML to a `.docx` in the browser. No Node polyfills or special bundler configuration are needed.

```bash
# from the repository root: build the library first
pnpm install && pnpm build

# then in this folder
cd example/vite-react
npm install
npm run dev
```

The example depends on the local package (`"html-to-docx": "file:../.."`). In your own app, install it from npm instead: `npm install html-to-docx`.
