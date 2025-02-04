import it from 'node:test';
import assert from 'assert';
import JSZip from 'jszip';
import { createCanvas } from 'canvas';

import HTMLtoDOCX from '../index.js';

const createdAt = new Date('2025-01-01');

function generateRandomImageDataURL(width = 100, height = 100) {
  const canvas = createCanvas(Math.round(width), Math.round(height));
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(Math.round(width), Math.round(height));

  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] = Math.random() * 255; // Red
    imageData.data[i + 1] = Math.random() * 255; // Green
    imageData.data[i + 2] = Math.random() * 255; // Blue
    imageData.data[i + 3] = 255; // Alpha (fully opaque)
  }
  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL();
}

function generateHTMLWithImages(numberOfImages = 4, imgSizeInMb = 4) {
  const widthAndHeight = Math.sqrt((imgSizeInMb * 1024 * 1024) / 4);
  let html = `
    <html>
      <head>
        <title>Test Document</title>
      </head>
      <body>`;
  for (let i = 0; i < numberOfImages; i++) {
    html += `<img src="${generateRandomImageDataURL(widthAndHeight, widthAndHeight)}" />`;
  }
  html += `
      </body>
    </html>
  `;
  return html;
}

it('handles large images in HTML file', async () => {
  const largeHTML = generateHTMLWithImages();
  const docxContent = await HTMLtoDOCX(largeHTML, null, {
    createdAt,
    modifiedAt: createdAt,
  });

  const zip = new JSZip();
  const zipContent = await zip.loadAsync(docxContent);

  assert.ok('word/document.xml' in zipContent.files);

  const docXml = await zipContent.file('word/document.xml').async('string');
  assert.ok(docXml.includes('<w:cNvPr id="2" name="image-'));
});
