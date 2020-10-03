html-to-docx
============

[![NPM Version][npm-image]][npm-url]

html-to-docx is a js library for converting HTML documents to DOCX format supported by Microsoft Word 2007+, LibreOffice Writer, Google Docs, WPS Writer etc.

It was inspired by [html-docx-js] project but mitigates the problem of documents generated being non-compatiable with word processors like Google Docs and libreOffice Writer that doesn't support [altchunks] feature.

## Installation

Use the npm to install foobar.

```bash
npm install html-to-docx
```

## Usage

```js
await HTMLtoDOCX(htmlString, headerHTMLString, documentOptions)
```

full fledged examples can be found under `example/`

### Parameters

- `htmlString` <[String]> html string equivalent of document content.
- `headerHTMLString` <[String]> html string equivalent of header.
- `documentOptions` <?[Object]>
  - `orientation` <"portrait"|"landscape"> defines the general orientation of the document. Defaults to portrait.
  - `margins` <?[Object]>
    - `top` <[Number]> distance between the top of the text margins for the main document and the top of the page for all pages in this section in [TWIP]. Defaults to 1440. Supports equivalent measurement in [pixel], [cm] or [inch].
    - `right` <[Number]> distance between the right edge of the page and the right edge of the text extents for this document in [TWIP]. Defaults to 1800. Supports equivalent measurement in [pixel], [cm] or [inch].
    - `bottom` <[Number]> distance between the bottom of text margins for the document and the bottom of the page in [TWIP]. Defaults to 1440. Supports equivalent measurement in [pixel], [cm] or [inch].
    - `left` <[Number]> distance between the left edge of the page and the left edge of the text extents for this document in [TWIP]. Defaults to 1800. Supports equivalent measurement in [pixel], [cm] or [inch].
    - `header` <[Number]> distance from the top edge of the page to the top edge of the header in [TWIP]. Defaults to 720. Supports equivalent measurement in [pixel], [cm] or [inch].
    - `footer` <[Number]> distance from the bottom edge of the page to the bottom edge of the footer in [TWIP]. Defaults to 720. Supports equivalent measurement in [pixel], [cm] or [inch].
    - `gutter` <[Number]> amount of extra space added to the specified margin, above any existing margin values. This setting is typically used when a document is being created for binding in [TWIP]. Defaults to 0. Supports equivalent measurement in [pixel], [cm] or [inch].
  - `title` <?[String]> title of the document.
  - `subject` <?[String]> subject of the document.
  - `creator` <?[String]> creator of the document. Defaults to `html-to-docx`
  - `keywords` <?[Array]<[String]>> keywords associated with the document. Defaults to ['html-to-docx'].
  - `description` <?[String]> description of the document.
  - `lastModifiedBy` <?[String]> last modifier of the document. Defaults to `html-to-docx`.
  - `revision` <?[Number]> revision of the document. Defaults to `1`.
  - `createdAt` <?[Date]> time of creation of the document. Defaults to current time.
  - `modifiedAt` <?[Date]> time of last modification of the document. Defaults to current time.
  - `headerType` <"default"|"first"|"even"> type of header. Defaults to `default`
  - `header` <?[Boolean]> flag to enable header. Defaults to `false`.
  - `font` <?[String]> font name to be used. Defaults to `Times New Roman`.
  - `fontSize` <?[Number]> size of font in HIP(Half of point). Defaults to 22. Supports equivalent measure in [pt].
  - `complexScriptFontSize` <?[Number]> size of complex script font in HIP(Half of point). Defaults to 22. Supports equivalent measure in [pt].
  - `tableRowCantSplit` <?[Boolean]> flag to allow table row to split across pages. Defaults to `false`.

### Returns

<[Promise]<[Buffer]|[Blob]>>


## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

MIT

[npm-image]: https://img.shields.io/npm/v/html-to-docx.svg
[npm-url]: https://npmjs.org/package/html-to-docx
[html-docx-js]: https://github.com/evidenceprime/html-docx-js "html-docx-js"
[altchunks]: https://docs.microsoft.com/en-us/dotnet/api/documentformat.openxml.wordprocessing.altchunk?view=openxml-2.8.1 "altchunks "
[String]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object "Object"
[Number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type "Number"
[TWIP]: https://en.wikipedia.org/wiki/Twip "TWIP"
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array "Array"
[Date]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date "Date"
[Boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise "Promise"
[Buffer]: https://nodejs.org/api/buffer.html#buffer_buffer "Buffer"
[Blob]: https://developer.mozilla.org/en-US/docs/Web/API/Blob "Blob"
[pixel]: https://en.wikipedia.org/wiki/Pixel#:~:text=Pixels%2C%20abbreviated%20as%20%22px%22,what%20screen%20resolution%20views%20it. "pixel"
[cm]: https://en.wikipedia.org/wiki/Centimetre "cm"
[inch]: https://en.wikipedia.org/wiki/Inch "inch"
[pt]: https://en.wikipedia.org/wiki/Point_(typography) "pt"