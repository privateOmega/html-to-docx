// Per-fixture document options. `headerHTML` / `footerHTML` are passed as the
// header and footer HTML arguments; everything else is documentOptions.
export default {
  'header-footer': {
    headerHTML: '<p>Header text</p>',
    footerHTML: '<p>Footer text</p>',
    header: true,
    footer: true,
    pageNumber: true,
  },
  'document-options': {
    orientation: 'landscape',
    margins: { top: 720, right: 720, bottom: 720, left: 720, header: 360, footer: 360, gutter: 0 },
    title: 'Fixture title',
    subject: 'Fixture subject',
    creator: 'fixture-creator',
    keywords: ['fixture', 'snapshot'],
    description: 'Fixture description',
    lastModifiedBy: 'fixture-editor',
    revision: 3,
    font: 'Arial',
    fontSize: 24,
    complexScriptFontSize: 24,
    table: { row: { cantSplit: true } },
    lineNumber: true,
    lineNumberOptions: { start: 1, countBy: 2, restart: 'newPage' },
    numbering: { defaultOrderedListStyleType: 'lower-roman' },
    decodeUnicode: true,
    lang: 'en-GB',
  },
};
