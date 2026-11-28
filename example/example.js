/* eslint-disable no-console */
// Writes example/example.docx: a general showcase, followed by one section per
// behaviour fixed for 2.0, each saying what it should look like, so the output
// can be checked by eye in Microsoft Word, LibreOffice or Google Docs.
//
//   pnpm build && node example/example.js
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
// FIXME: Incase you have the npm package
// import HTMLtoDOCX from 'html-to-docx';
import HTMLtoDOCX from '../dist/index.mjs';

const filePath = fileURLToPath(new URL('./example.docx', import.meta.url));

// 80x40 solid-colour PNGs.
const png = (base64) => `data:image/png;base64,${base64}`;
const BLUE = png(
  'iVBORw0KGgoAAAANSUhEUgAAAFAAAAAoCAIAAADmAupWAAAARElEQVR42u3PQQ0AAAgEoEtiMBMbyxZ+ZKMAqZ5XIiwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsfGsBlf+g4hGpyTkAAAAASUVORK5CYII=',
);
const GREEN = png(
  'iVBORw0KGgoAAAANSUhEUgAAAFAAAAAoCAIAAADmAupWAAAARElEQVR42u3PQQ0AAAgEoItjHCMa1RZ+ZKMAqelXIiwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsfGsBt6GsxOWoQOQAAAAASUVORK5CYII=',
);
const ORANGE = png(
  'iVBORw0KGgoAAAANSUhEUgAAAFAAAAAoCAIAAADmAupWAAAARElEQVR42u3PQQ0AAAgEoEtiWMOawxZ+ZKMAma5XIiwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsfGsBCZ4MHnhb9EgAAAAASUVORK5CYII=',
);

const expect = (text) =>
  `<p style="color: #666666; font-size: 9pt;"><em>Expected: ${text}</em></p>`;

const sections = [
  [
    'Opens in Word (#225, #199, #57)',
    'this document sets only the top and left page margins. It used to be rejected by Word as corrupt.',
    '<p>If you can read this in Word, partial margins work. Top margin: 0.5 in, left: 1.5 in; the others keep their defaults.</p>',
  ],
  [
    'Inline formatting tags (#330, #237, #226)',
    'each word formatted as named.',
    '<p><em>em italic</em>, <i>i italic</i>, <ins>ins underlined</ins>, <u>u underlined</u>, <s>s struck</s>, <del>del struck</del>, <strike>strike struck</strike>, <mark>mark highlighted</mark>, <code>code grey</code>, <sub>sub</sub>script, <sup>sup</sup>erscript.</p>',
  ],
  [
    'Nested formatting (#236)',
    '"bold underlined", then bold "a", bold italic "b", bold "c" and plain "d".',
    '<p><strong><u>bold underlined</u></strong></p><p><b>a <i>b</i> c</b> d</p><p><b style="color: #c00000;">bold red via style on &lt;b&gt;</b></p>',
  ],
  [
    'Spaces between inline elements (#103)',
    '"Bosch arrived late and had to park" with spaces between the words.',
    '<p><strong>Bosch</strong> <em>arrived</em> <u>late</u> and had to park.</p>',
  ],
  [
    'Links inside inline elements (#54)',
    'three working links: inside a span, a bold link, and one link whose bold and italic parts are all clickable.',
    '<p><span>In a span: <a href="https://example.com/one">link one</a></span></p><p><b>In bold: <a href="https://example.com/two">link two</a></b></p><p><a href="https://example.com/three"><strong>bold part</strong> and <em>italic part</em></a></p>',
  ],
  [
    'Fonts for every script (#214, #216)',
    'the whole line in Arial, including âțșî and the Chinese text; the second line entirely in SimSun if installed.',
    '<p style="font-family: Arial;">Arial: Română âțșî, Français éèçà, 中文测试</p><p><span style="font-family: SimSun;">SimSun: 中文测试 and Latin text</span></p>',
  ],
  [
    'Several paragraphs in a list item (#243, #87)',
    'item 1 has three paragraphs, only the first numbered; "after the nested list" continues item 2 without a new number.',
    '<ol><li><p>Item 1, first paragraph</p><p>Item 1, second paragraph</p><p>Item 1, third paragraph</p></li><li>Item 2<ul><li>nested</li></ul>after the nested list</li><li>Item 3</li></ol>',
  ],
  [
    'Images inside inline elements (#233) and embedded once',
    'a blue image inside spans, a green image that is a link, and an orange image on its own line. Each image is stored once in the file.',
    `<p>Before <span style="font-size: 11pt;"><span style="color: black;"><img src="${BLUE}" alt="blue"></span></span> after</p><p><a href="https://example.com"><img src="${GREEN}" alt="green link"></a></p><img src="${ORANGE}" alt="orange">`,
  ],
  [
    'Unsupported image sources are skipped (#211)',
    'the sentence below is complete; the relative-path image is left out (with a console warning) instead of failing the conversion.',
    '<p>Text before <img src="/images/relative.png" alt="relative"> text after.</p>',
  ],
  [
    'Column widths (#105, #266, #331, #345)',
    'first table 30% / 70%; second table columns in a 1 : 3 ratio; third table first cell spans two equal columns.',
    '<table style="width: 100%;"><tr><td style="width: 30%;">30%</td><td style="width: 70%;">70%</td></tr></table>' +
      '<p></p><table><tr><th style="width: 100px;">100px</th><th style="width: 300px;">300px</th></tr><tr><td>a</td><td>b</td></tr></table>' +
      '<p></p><table style="width: 100%;"><tr><td colspan="2" style="width: 50%;">colspan 2, 50%</td><td>rest</td></tr><tr><td>a</td><td>b</td><td>c</td></tr></table>',
  ],
  [
    'Merged cells and empty rows (#223, #86)',
    'A spans two rows, B spans two columns; the empty <tr> is left out.',
    '<table style="width: 100%;"><tr><td rowspan="2">A (2 rows)</td><td colspan="2">B (2 columns)</td></tr><tr><td>c</td><td>d</td></tr><tr></tr><tr><td>e</td><td>f</td><td>g</td></tr></table>',
  ],
  [
    'Blockquote with a font (#338)',
    'an indented quote with "Georgia" in Georgia.',
    '<blockquote>A quote with <span style="font-family: Georgia;">Georgia</span> in it.</blockquote>',
  ],
  [
    'Repeated table header (#332)',
    'the next page starts with the "Number | Square" header row again.',
    `<table style="width: 60%;"><thead><tr><th>Number</th><th>Square</th></tr></thead><tbody>${Array.from(
      { length: 60 },
      (_, index) => `<tr><td>${index + 1}</td><td>${(index + 1) ** 2}</td></tr>`,
    ).join('')}</tbody></table>`,
  ],
];

const htmlString = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Document</title>
    </head>
    <body>
        <div>
            <p>Taken from wikipedia</p>
            <img
                src="data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
                alt="Red dot"
            />
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png"
                alt="Red dot"
            />
        </div>
        <div>
            <h1>This is heading 1</h1>
            <p>Content</p>
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
        <p>
            <strong>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make
                a type specimen book.
            </strong>
            <i>It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.</i>
            <u>It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages,</u>and more recently with desktop publishing software
            <span style="color: hsl(0, 75%, 60%);"> like Aldus PageMaker </span>including versions of Lorem Ipsum.
            <span style="background-color: hsl(0, 75%, 60%);">Where does it come from? Contrary to popular belief, Lorem Ipsum is not simply random text.</span>
            It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
        </p>
        <p style="font-family: 'Courier New', Courier, monospace;">Look at me, i'm a paragraph in Courier New!</p>
        <p style="font-family: SerifTestFont, serif;">Look at me, i'm a paragraph in SerifTestFont!</p>
        <p style="font-family: SansTestFont, sans-serif;">Look at me, i'm a paragraph in SansTestFont!</p>
        <p style="font-family: MonoTestFont, monospace;">Look at me, i'm a paragraph in MonoTestFont!</p>
        <blockquote>
            For 50 years, WWF has been protecting the future of nature. The world's leading conservation organization, WWF works in 100 countries and is supported by 1.2 million members in the United States and close to 5 million globally.
        </blockquote>
        <p>
            <strong>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make
                a type specimen book.
            </strong>
        </p>
        <p style="margin-left: 40px;">
            <strong>Left indented paragraph:</strong>
            <span>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</span>
        </p>
        <p style="margin-right: 40px;">
            <strong>Right indented paragraph:</strong>
            <span>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</span>
        </p>
        <p style="margin-left: 40px; margin-right: 40px;">
            <strong>Left and right indented paragraph:</strong>
            <span>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</span>
        </p>
        <ul style="list-style-type: circle;">
            <li>Unordered list element</li>
        </ul>
        <br>
        <ol style="list-style-type: decimal;">
            <li>Ordered list element</li>
        </ol>
        <div class="page-break" style="page-break-after: always"></div>
        <ul>
            <li><span style="font-size:10pt"><span style="color:##e28743">I am a teacup <strong><span style="color:#595959">A strong teacup</span></strong></span></span></li>
            <li><span style="font-size:10pt"><span style="color:#4d4f53">I am another teacup <strong><span style="color:#2596be">A blue</span></strong> Teacup</span></span></li>
            <li><span style="font-size:10pt"><span style="color:#cc1177">Stonks only go up if you turn the chart sometimes</span></span></li>
        </ul>
        <div class="page-break" style="page-break-after: always"></div>
        <ul>
            <li>
                <a href="https://en.wikipedia.org/wiki/Coffee">
                    <strong>
                        <u>Coffee</u>
                    </strong>
                </a>
            </li>
            <li>Tea
                <ol>
                    <li>Black tea
                        <ol style="list-style-type:lower-alpha-bracket-end;" data-start="2">
                            <li>Srilankan <strong>Tea</strong>
                                <ul>
                                    <li>Uva <b>Tea</b></li>
                                </ul>
                            </li>
                            <li>Assam Tea</li>
                        </ol>
                    </li>
                    <li>Green tea</li>
                </ol>
            </li>
            <li>Milk
                <ol>
                    <li>Cow Milk</li>
                    <li>Soy Milk</li>
                </ol>
            </li>
        </ul>
        <br>
        <table>
            <tr>
                <th>Country</th>
                <th>Capital</th>
            </tr>
            <tr>
                <td>India</td>
                <td>New Delhi</td>
            </tr>
            <tr>
                <td>United States of America</td>
                <td>Washington DC</td>
            </tr>
            <tr>
                <td>Bolivia</td>
                <td>
                    <ol>
                        <li>Sucre</li>
                        <li>La Paz</li>
                    </ol>
                </td>
            </tr>
        </table>

        <div class="page-break" style="page-break-after: always"></div>
        <table align="center" class="Table">
          <tbody>
            <tr>
              <td colspan="2" rowspan="2" style="border-bottom:none; width:249px; padding:5px 11px 5px 11px; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt">&nbsp;</span></span></span></p>
              </td>
              <td colspan="3" style="border-bottom:1px solid black; width:374px; padding:5px 11px 5px 11px; background-color:gray; border-top:1px solid black; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><span style="color:black">Example Header</span></span></span></span></p>
              </td>
            </tr>
            <tr>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:#d9d9d9; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><b><span style="font-size:10.0pt"><span style="color:black">Financial</span></span></b></span></span></span></p>
              </td>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:#d9d9d9; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><b><span style="font-size:10.0pt"><span style="color:black">Tech</span></span></b></span></span></span></p>
              </td>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:#d9d9d9; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><b><span style="font-size:10.0pt"><span style="color:black">Total Market</span></span></b></span></span></span></p>
              </td>
            </tr>
            <tr>
              <td rowspan="3" style="border-bottom:none; width:125px; padding:5px 11px 5px 11px; background-color:gray; border-top:none; border-right:1px solid black; border-left:1px solid black" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><b><span style="font-size:10.0pt"><span style="color:black">Level of Meme</span></span></b></span></span></span></p>
              </td>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:#d9d9d9; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><b><span style="font-size:10.0pt"><span style="color:black">High</span></span></b></span></span></span></p>
              </td>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:red; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><span style="color:black">GUSH</span></span></span></span></p>
              </td>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:#ffc000; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><span style="color:black">ARKK</span></span></span></span></p>
              </td>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:yellow; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><span style="color:black">SPLX</span></span></span></span></p>
              </td>
            </tr>
            <tr>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:#d9d9d9; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><b><span style="font-size:10.0pt"><span style="color:black">Medium</span></span></b></span></span></span></p>
              </td>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:#ffc000; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><span style="color:black">[̲̅$̲̅(̲̅ ͡&deg; ͜ʖ ͡&deg;̲̅)̲̅$̲̅]</span></span></span></span></p>
              </td>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:yellow; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><span style="color:black">TQQQ</span></span></span></span></p>
              </td>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:#92d050; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><span style="color:black">( ͡~ ͜ʖ ͡&deg;)</span></span></span></span></p>
              </td>
            </tr>
            <tr>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:#d9d9d9; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><b><span style="font-size:10.0pt"><span style="color:black">Low</span></span></b></span></span></span></p>
              </td>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:yellow; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><span style="color:black">( ◔ ʖ̯ ◔ )</span></span></span></span></p>
              </td>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:#92d050; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><span style="color:black">QQQ</span></span></span></span></p>
              </td>
              <td style="border-bottom:1px solid black; width:125px; padding:5px 11px 5px 11px; background-color:#00b050; border-top:none; border-right:1px solid black; border-left:none" valign="top">
              <p style="margin-bottom:8px"><span style="font-family:Arial,Helvetica,sans-serif;"><span style="font-size:11pt"><span style="line-height:12pt"><span style="color:black">SPY</span></span></span></span></p>
              </td>
            </tr>
          </tbody>
        </table>
        <ul>
            <li style="margin-bottom:10px">
                <span style="font-size:10pt"><span style="color:#e28743">I am a teacup <strong><span style="color:#595959">A strong teacup</span></strong></span></span>
            </li>
            <li style="margin-bottom:15px">
                <span style="font-size:10pt"><span style="color:#4d4f53">I am another teacup <strong><span style="color:#2596be">A blue</span></strong> Teacup</span></span>
            </li>
            <li style="margin-bottom:20px">
                <span style="font-size:15pt"><span style="color:#cc1177">Stonks only go up if you turn the chart sometimes</span></span>
            </li>
            <li style="margin-bottom:30px">
                <span style="font-size:15pt"><span style="color:#cc1177">One small step for man</span></span>
            </li>
            <li>
                <span style="font-size:30pt"><span style="color:#cc1177">One giant leap for mankind</span></span>
            </li>
            <li>
                <span style="font-size:30pt"><span style="color:#cc1177">Never surrender, no mercy, and never give up!</span></span>
            </li>
        </ul>
        <div class="page-break" style="page-break-after: always"></div>
        <h1>html-to-docx 2.0: checks for Word</h1>
        <p>Each section names the issue or PR it covers and what it should look like.</p>
        ${sections
          .map(([title, expected, body]) => `<h2>${title}</h2>${expect(expected)}${body}`)
          .join('\n')}
    </body>
</html>`;

(async () => {
  const fileBuffer = await HTMLtoDOCX(htmlString, null, {
    title: 'html-to-docx example',
    // Only some margins: the others keep their defaults (#225).
    margins: { top: '0.5in', left: '1.5in' },
    table: { row: { cantSplit: true, repeatTableHeader: true } },
    footer: true,
    pageNumber: true,
  });

  fs.writeFile(filePath, fileBuffer, (error) => {
    if (error) {
      console.log('Docx file creation failed');
      return;
    }
    console.log(`Docx file created successfully: ${filePath}`);
  });
})();
