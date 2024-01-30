import HTMLtoDOCX from 'html-to-docx';
import { saveAs } from 'file-saver';

import './App.css';

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

        <p>Different borders</p>
        <table
            style="border-collapse: collapse; border-left:1px solid black; border-right: 2px solid brown; border-top: 2px solid yellow; border-bottom: 4px solid orange">
            <tbody>
                <tr>
                    <td>Row 1, Col 1</td>
                    <td>Row 1, Col 2</td>
                </tr>
                <tr>
                    <td>Row 2, Col 1</td>
                    <td>Row 2, Col 2</td>
                </tr>
            </tbody>
        </table>

        <p>Mid Merge Border</p>
        <table class="MsoTableGrid" style="border-collapse: collapse; border: none;" border="1" cellspacing="0" cellpadding="0">
            <tbody>
                <tr>
                    <td style="width: 112.7pt; border: solid windowtext 1.0pt; padding: 0cm 5.4pt 0cm 5.4pt;" valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 112.7pt; border: solid windowtext 1.0pt; border-left: none; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 112.7pt; border: solid windowtext 1.0pt; border-left: none; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 112.7pt; border: solid windowtext 1.0pt; border-left: none; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="width: 112.7pt; border: solid windowtext 1.0pt; border-top: none; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 225.4pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; padding: 0cm 5.4pt 0cm 5.4pt;"
                        colspan="2" rowspan="2" valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 112.7pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="width: 112.7pt; border: solid windowtext 1.0pt; border-top: none; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 112.7pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="width: 112.7pt; border: solid windowtext 1.0pt; border-top: none; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 112.7pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 112.7pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 112.7pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="width: 112.7pt; border: solid windowtext 1.0pt; border-top: none; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 112.7pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 112.7pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 112.7pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; padding: 0cm 5.4pt 0cm 5.4pt;"
                        valign="top">
                        <p style="margin: 0cm; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>

        <p>Tiny MCE No Border Case</p>
        <table class="MsoNormalTable" border="0" cellspacing="0" cellpadding="0">
            <tbody>
                <tr>
                    <td style="width: 116.25pt; background: #2F5496; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%; color: white;">Project Phase</span></p>
                    </td>
                    <td style="width: 297.0pt; background: #2F5496; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%; color: white;">Activities in Scope</span></p>
                    </td>
                    <td style="width: 1.25in; background: #2F5496; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%; color: white;">Estimated Hours</span></p>
                    </td>
                </tr>
                <tr>
                    <td style="width: 503.25pt; background: #E7E6E6; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" colspan="3"
                        valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%; color: black;">AWS Cloud Build</span></p>
                    </td>
                </tr>
                <tr>
                    <td style="width: 116.25pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">Deploy&nbsp;(4) Nodes within AWS per
                                Region</span></p>
                    </td>
                    <td style="width: 297.0pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">Our Services will assist with onboarding of
                                the remote offices. We believe having three nodes per AWS Region will provide optimal High
                                Availability (HA)</span></p>
                    </td>
                    <td style="width: 1.25in; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">16</span></p>
                    </td>
                </tr>
                <tr>
                    <td style="width: 5.75in; background: #E7E6E6; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" colspan="2"
                        valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%; color: black;">Feedback and Environment
                                Remediation</span></p>
                    </td>
                    <td style="width: 1.25in; background: #E7E6E6; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            &nbsp;</p>
                    </td>
                </tr>
                <tr>
                    <td style="width: 116.25pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">Solicit Initial feedback</span></p>
                    </td>
                    <td style="width: 297.0pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">Work with initial pilot user groups to
                                solicit feedback around the performance of the platform.&nbsp;</span></p>
                    </td>
                    <td style="width: 1.25in; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">5</span></p>
                    </td>
                </tr>
                <tr>
                    <td style="width: 116.25pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">Environment Remediation</span></p>
                    </td>
                    <td style="width: 297.0pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">Our Services will allocate up
                                to&nbsp;<strong>15&nbsp;project-hours</strong>&nbsp;for initial remediation as part of this
                                engagement. Should more hours be needed, we will discuss it with the client project
                                lead&nbsp;and provide an addendum to this scope definition upon mutual agreement.</span></p>
                    </td>
                    <td style="width: 1.25in; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p
                            style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">20</span></p>
                    </td>
                </tr>
            </tbody>
        </table>

        <p>Tiny MCE Normal Case</p>
        <table class="MsoNormalTable" style="border: solid black 1.0pt;" border="1" cellspacing="0" cellpadding="0">
            <tbody>
                <tr>
                    <td style="width: 116.25pt; border: solid black 1.0pt; background: #2F5496; padding: 4.0pt 8.0pt 4.0pt 8.0pt;"
                        valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%; color: white;">Project Phase</span>
                        </p>
                    </td>
                    <td style="width: 297.0pt; border: solid black 1.0pt; background: #2F5496; padding: 4.0pt 8.0pt 4.0pt 8.0pt;"
                        valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%; color: white;">Activities in Scope</span>
                        </p>
                    </td>
                    <td style="width: 1.25in; border: solid black 1.0pt; background: #2F5496; padding: 4.0pt 8.0pt 4.0pt 8.0pt;"
                        valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%; color: white;">Estimated Hours</span>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="width: 503.25pt; border: solid black 1.0pt; background: #E7E6E6; padding: 4.0pt 8.0pt 4.0pt 8.0pt;"
                        colspan="3" valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%; color: black;">AWS Cloud Build</span>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="width: 116.25pt; border: solid black 1.0pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">Deploy&nbsp;(4) Nodes within AWS per
                                Region</span>
                        </p>
                    </td>
                    <td style="width: 297.0pt; border: solid black 1.0pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">Our Services will assist with onboarding of the
                                remote offices. We believe having three nodes per AWS Region will provide optimal High
                                Availability (HA)</span>
                        </p>
                    </td>
                    <td style="width: 1.25in; border: solid black 1.0pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">16</span>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="width: 5.75in; border: solid black 1.0pt; background: #E7E6E6; padding: 4.0pt 8.0pt 4.0pt 8.0pt;"
                        colspan="2" valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%; color: black;">Feedback and Environment
                                Remediation</span>
                        </p>
                    </td>
                    <td style="width: 1.25in; border: solid black 1.0pt; background: #E7E6E6; padding: 4.0pt 8.0pt 4.0pt 8.0pt;"
                        valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            &nbsp;</p>
                    </td>
                </tr>
                <tr>
                    <td style="width: 116.25pt; border: solid black 1.0pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">Solicit Initial feedback</span>
                        </p>
                    </td>
                    <td style="width: 297.0pt; border: solid black 1.0pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">Work with initial pilot user groups to solicit
                                feedback around the performance of the platform.&nbsp;</span>
                        </p>
                    </td>
                    <td style="width: 1.25in; border: solid black 1.0pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">5</span>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="width: 116.25pt; border: solid black 1.0pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">Environment Remediation</span>
                        </p>
                    </td>
                    <td style="width: 297.0pt; border: solid black 1.0pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">Our Services will allocate up
                                to&nbsp;<strong>15&nbsp;project-hours</strong>&nbsp;for initial remediation as part of this
                                engagement. Should more hours be needed, we will discuss it with the client project
                                lead&nbsp;and provide an addendum to this scope definition upon mutual agreement.</span>
                        </p>
                    </td>
                    <td style="width: 1.25in; border: solid black 1.0pt; padding: 4.0pt 8.0pt 4.0pt 8.0pt;" valign="top">
                        <p style="margin: 0in 0in 8pt; line-height: 107%; font-size: 11pt; font-family: Calibri, sans-serif;">
                            <span style="font-size: 12.0pt; line-height: 107%;">20</span>
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>

        <p>Tiny MCE Shapes Case</p>
        <table class="MsoTableGrid" style="width: 624px; border-collapse: collapse; border: none; height: 96.5px;" border="1"
            cellspacing="0" cellpadding="0">
            <tbody>
                <tr style="height: 19px;">
                    <td style="width: 117pt; border: 1pt solid black; background: rgb(68, 114, 196); padding: 0in 5.4pt; height: 19px;"
                        valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;"><span
                                style="color: white;">Test table1</span></p>
                    </td>
                    <td style="width: 117pt; border-top: 1pt solid black; border-right: 1pt solid black; border-bottom: 1pt solid black; border-image: initial; border-left: none; background: rgb(68, 114, 196); padding: 0in 5.4pt; height: 19px;"
                        valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;"><span
                                style="color: white;">Test table2</span></p>
                    </td>
                    <td style="width: 117pt; border-top: 1pt solid black; border-right: 1pt solid black; border-bottom: 1pt solid black; border-image: initial; border-left: none; padding: 0in 5.4pt; height: 19px;"
                        valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">Test
                            co3l3</p>
                    </td>
                    <td style="width: 117pt; border-top: 1pt solid black; border-right: 1pt solid black; border-bottom: 1pt solid black; border-image: initial; border-left: none; background: rgb(237, 125, 49); padding: 0in 5.4pt; height: 19px;"
                        valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;"><span
                                style="color: black;">Shad here</span></p>
                    </td>
                </tr>
                <tr style="height: 19px;">
                    <td style="width: 117pt; border-top: none; border-left: 1pt solid black; border-bottom: 1pt solid windowtext; border-right: 1pt solid black; padding: 0in 5.4pt; height: 38px;"
                        rowspan="2" valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 117pt; border-top: none; border-left: none; border-bottom: 1pt solid black; border-right: 1pt solid black; padding: 0in 5.4pt; height: 19px;"
                        valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 117pt; border-top: none; border-left: none; border-bottom: 1pt solid black; border-right: 1pt solid black; padding: 0in 5.4pt; height: 19px;"
                        valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 117pt; border-top: none; border-left: none; border-bottom: 1pt solid black; border-right: 1pt solid black; padding: 0in 5.4pt; height: 19px;"
                        valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                </tr>
                <tr style="height: 19px;">
                    <td style="width: 117pt; border-top: none; border-left: none; border-bottom: 1pt solid windowtext; border-right: 1pt solid black; padding: 0in 5.4pt; height: 19px;"
                        valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 3.25in; border-top: none; border-left: none; border-bottom: 1pt solid black; border-right: 1pt solid black; padding: 0in 5.4pt; height: 19px;"
                        colspan="2" valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                </tr>
                <tr style="height: 19.5px;">
                    <td style="width: 117pt; border: none; padding: 0in 5.4pt; height: 19.5px;" valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 117pt; border-top: none; border-bottom: none; border-left: none; border-image: initial; border-right: 1pt solid windowtext; padding: 0in 5.4pt; height: 19.5px;"
                        valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 117pt; border-top: none; border-left: none; border-bottom: 1pt solid rgb(0, 176, 80); border-right: 1pt solid black; padding: 0in 5.4pt; height: 19.5px;"
                        valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 117pt; border-top: none; border-left: none; border-bottom: 1pt solid rgb(237, 125, 49); border-right: 1pt solid black; padding: 0in 5.4pt; height: 19.5px;"
                        valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                </tr>
                <tr style="height: 20px;">
                    <td style="width: 117pt; border: none; padding: 0in 5.4pt; height: 20px;" valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 117pt; border-top: none; border-bottom: none; border-left: none; border-image: initial; border-right: 1pt solid windowtext; padding: 0in 5.4pt; height: 20px;"
                        valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 117pt; border-top: none; border-left: none; border-bottom: 1pt solid rgb(0, 176, 80); border-right: 1pt solid rgb(237, 125, 49); padding: 0in 5.4pt; height: 20px;"
                        valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                    <td style="width: 117pt; border-top: none; border-left: none; border-bottom: 1pt solid rgb(237, 125, 49); border-right: 1pt solid rgb(237, 125, 49); padding: 0in 5.4pt; height: 20px;"
                        valign="top">
                        <p style="margin: 0in; line-height: normal; font-size: 11pt; font-family: Calibri, sans-serif;">&nbsp;
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    </body>
</html>`;

function App() {
  async function downloadDocx(params) {
    const fileBuffer = await HTMLtoDOCX(htmlString, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });

    saveAs(fileBuffer, 'html-to-docx.docx');
  }

  return (
    <div className="App">
      <header className="App-header">
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className="App-link" href="#" onClick={downloadDocx}>
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
