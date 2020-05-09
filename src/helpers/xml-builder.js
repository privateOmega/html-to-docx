/* eslint-disable no-unused-vars */

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

/* const buildParagraphBorder = (xmlFragment) => {
  xmlFragment.ele('w:pBdr');
  // Add border styles within it
  xmlFragment.up();
}; */

const buildNumberingProperties = (xmlFragment) => {
  xmlFragment.ele('w:numPr').ele('w:ilvl').ele('w:numId').up();
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

export { buildParagraph, buildTable, buildHyperlink };
