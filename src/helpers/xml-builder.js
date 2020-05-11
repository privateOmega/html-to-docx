/* eslint-disable no-unused-vars */

const buildLineBreak = (xmlFragment) => {
  xmlFragment.ele('w:br').up();
};

const buildTextElement = (xmlFragment, text) => {
  xmlFragment.ele('w:t').txt(text);
};

const buildRunProperties = (xmlFragment) => {
  xmlFragment.ele('w:rPr');
  // Add styles within it
  xmlFragment.up();
};

const buildRun = (xmlFragment) => {
  xmlFragment.ele('w:r');
  buildRunProperties(xmlFragment);
  buildTextElement(xmlFragment);
  xmlFragment.up();
};

const buildNumberingProperties = (xmlFragment) => {
  xmlFragment.ele('w:numPr').ele('w:ilvl').ele('w:numId').up();
};

const buildNumberingInstances = (xmlFragment) => {
  xmlFragment.ele('w:num').ele('w:abstractNumId').up();
};

const buildSpacing = (xmlFragment) => {
  xmlFragment.ele('w:spacing').up();
};

const buildShading = (xmlFragment, fillColorCode) => {
  xmlFragment
    .ele('w:shd')
    // background color for text
    .att('w:fill', fillColorCode)
    .att('w:color', 'auto')
    .att('w:val', 'clear');
};

const buildIndentation = (xmlFragment) => {
  xmlFragment.ele('w:ind').up();
};

const buildHorizontalAlignment = (xmlFragment) => {
  xmlFragment.ele('w:jc').up();
};

const buildParagraphProperties = (xmlFragment, styles) => {
  xmlFragment.ele('w:pPr');
  // Add styles within it
  xmlFragment.up();
};

const buildParagraph = (xmlFragment) => {
  xmlFragment.ele('w:p');
  buildParagraphProperties(xmlFragment);
  buildRun(xmlFragment);
  xmlFragment.up();
};

const buildTableCellProperties = (xmlFragment, styles) => {
  xmlFragment.ele('w:tcPr');
  // Add styles within it
  xmlFragment.up();
};

const buildTableCell = (xmlFragment) => {
  xmlFragment.ele('w:tc');
  buildTableCellProperties(xmlFragment);
  xmlFragment.up();
};

const buildTableRow = (xmlFragment) => {
  xmlFragment.ele('w:tr');
  buildTableCell(xmlFragment);
  xmlFragment.up();
};

const buildTableGrid = (xmlFragment) => {
  xmlFragment.ele('w:tblGrid');
  // Add grid element within it
  xmlFragment.up();
};

const buildTableProperties = (xmlFragment, styles) => {
  xmlFragment.ele('w:tblPr');
  // Add styles within it
  xmlFragment.up();
};

const buildTable = (xmlFragment) => {
  xmlFragment.ele('w:tbl');
  buildTableProperties(xmlFragment);
  buildTableGrid(xmlFragment);
  buildTableRow(xmlFragment);
  xmlFragment.up();
};

const buildHyperlink = (xmlFragment) => {
  // Relationship for external hyperlinks r:id="rId4"
  xmlFragment.ele('w:hyperlink');
  buildRun(xmlFragment);
  xmlFragment.up();
};

export {
  buildParagraph,
  buildTable,
  buildHyperlink,
  buildNumberingInstances,
  buildLineBreak,
  buildHorizontalAlignment,
  buildIndentation,
  buildTextElement,
};
