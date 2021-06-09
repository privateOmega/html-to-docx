/* eslint-disable no-console */
import fs from 'fs';
// FIXME: Incase you have the npm package
// import HTMLtoDOCX from 'html-to-docx';
import HTMLtoDOCX from '../dist/html-to-docx.esm';

const filePath = './example.docx';

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
        <blockquote>
            For 50 years, WWF has been protecting the future of nature. The world's leading conservation organization, WWF works in 100 countries and is supported by 1.2 million members in the United States and close to 5 million globally.
        </blockquote>
        <p>
            <strong>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make
                a type specimen book.
            </strong>
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
                        <ol>
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
        </table>
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
