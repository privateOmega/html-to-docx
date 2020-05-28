const fs = require('fs');
// FIXME: Incase you have the npm package
// const HTMLtoDOCX = require('html-to-docx');
const HTMLtoDOCX = require('../dist/html-to-docx.cjs');

const filePath = './example.docx';

const htmlString = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  <h1>Welcome</h1>
</body>
</html>`;

(async () => {
  const fileBuffer = await HTMLtoDOCX(htmlString);

  fs.writeFile(filePath, fileBuffer, (error) => {
    if (error) {
      console.log('Docx file creation failed');
    }
    console.log('Docx file created successfully');
  });
})();
