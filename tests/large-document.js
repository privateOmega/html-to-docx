import it from 'node:test';
import assert from 'assert';
import JSZip from 'jszip';

import HTMLtoDOCX from '../index.js';

const createdAt = new Date('2025-01-01');

function getSection(id = 0) {
  return `
    <section id="section-${id}">
      <h1>This is a test heading</h1>
      <p>This is a test paragraph with some content.</p>
      <p>A random number: ${Math.random()}</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
      <table>
        <tr>
          <th>Header 1</th>
          <th>Header 2</th>
        </tr>
        <tr>
          <td>Cell 1</td>
          <td>Cell 2</td>
        </tr>
      </table>
    </section>
  `;
}

function generateLargeHTML(sizeInMB = 2) {
  const bytesPerParagraph = getSection().length;
  const targetBytes = sizeInMB * 1024 * 1024;
  const paragraphCount = Math.ceil(targetBytes / bytesPerParagraph);

  return `
    <html>
      <head>
        <title>Test Document</title>
      </head>
      <body>
      ${Array(paragraphCount)
        .fill('')
        .map((_, i) => getSection(i))
        .join('')}
      </body>
    </html>
  `;
}

it('handles large HTML files', async () => {
  const largeHTML = generateLargeHTML();
  const docxContent = await HTMLtoDOCX(largeHTML, null, {
    createdAt,
    modifiedAt: createdAt,
  });

  const zip = new JSZip();
  const zipContent = await zip.loadAsync(docxContent);

  // Verify the document was created successfully
  assert.ok('word/document.xml' in zipContent.files);

  // Check that the document contains our content
  const docXml = await zipContent.file('word/document.xml').async('string');
  assert.ok(docXml.includes('<w:t xml:space="preserve">This is a test paragraph'));
});
