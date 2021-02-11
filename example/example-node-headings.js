/* eslint-disable no-console */
const fs = require('fs');
// FIXME: Incase you have the npm package
// const HTMLtoDOCX = require('html-to-docx');
const HTMLtoDOCX = require('../dist/html-to-docx.cjs');

const filePath = './example.docx';

const htmlString = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Document</title>
    </head>
    <body>
        <div>
            <h1>Taken from wikipedia</h1>
				<p>Main content</p>
        </div>
        <div>
            <h2>This is heading 2</h2>
				<p>Content</p>
            <h3>This is heading 3</h3>
				<p>Content</p>
            <h4>This is heading 4</h4>
				<p>Content</p>
            <h5>This is heading 5</h5>
				<p>Content</p>
            <h6>This is heading 6</h6>
				<p>Content</p>
        </div>
    </body>
</html>`;

(async () => {
  const fileBuffer = await HTMLtoDOCX(htmlString, null, {
    table: { row: { cantSplit: true } },
    footer: true,
    pageNumber: true,
  });

  fs.writeFile(filePath, fileBuffer, (error) => {
    if (error) {
      console.log('Docx file creation failed');
      return;
    }
    console.log('Docx file created successfully');
  });
})();
