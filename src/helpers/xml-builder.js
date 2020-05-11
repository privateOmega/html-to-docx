/* eslint-disable no-unused-vars */

const isVNode = require('virtual-dom/vnode/is-vnode');
const isVText = require('virtual-dom/vnode/is-vtext');

const buildBold = (xmlFragment) => {
  xmlFragment.ele('w:b').up();
};

const buildItalics = (xmlFragment) => {
  xmlFragment.ele('w:i').up();
};

const buildUnderline = (xmlFragment) => {
  xmlFragment.ele('w:u').up();
};

const buildLineBreak = (xmlFragment) => {
  xmlFragment.ele('w:br').up();
};

const buildTextElement = (xmlFragment, text) => {
  xmlFragment.ele('w:t').txt(text).up();
};

const buildRunProperties = (xmlFragment) => {
  xmlFragment.ele('w:rPr');
  // TODO: Add styles within it
  xmlFragment.up();
};

const buildRun = (xmlFragment, vNode) => {
  xmlFragment.ele('w:r');
  buildRunProperties(xmlFragment);
  if (isVText(vNode)) {
    buildTextElement(xmlFragment);
  }
  xmlFragment.up();
};

const buildNumberingProperties = (xmlFragment, levelId, numberingId) => {
  xmlFragment
    .ele('w:numPr')
    .ele('w:ilvl')
    .att('w:val', String(levelId))
    .ele('w:numId')
    .att('w:val', String(numberingId))
    .up()
    .up();
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
    .att('w:val', 'clear')
    .up();
};

const buildIndentation = (xmlFragment) => {
  xmlFragment.ele('w:ind').up();
};

const buildHorizontalAlignment = (xmlFragment) => {
  xmlFragment.ele('w:jc').up();
};

const buildParagraphProperties = (xmlFragment, attributes, styles) => {
  xmlFragment.ele('w:pPr');
  if (attributes && Object.prototype.hasOwnProperty.call(attributes, 'numbering')) {
    const { levelId, numberingId } = attributes.numbering;
    buildNumberingProperties(xmlFragment, levelId, numberingId);
  }
  // TODO: Add styles within it
  xmlFragment.up();
};

const buildParagraph = (xmlFragment, vNode, attributes) => {
  xmlFragment.ele('w:p');
  buildParagraphProperties(xmlFragment, attributes, vNode.properties.attributes.style);
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      if (childVNode.tagName === 'span') {
        throw new Error('Unsupported');
      }
      buildRun(xmlFragment, childVNode);
    }
  } else {
    // In case paragraphs has to be rendered where vText is present. Eg. table-cell
    buildRun(xmlFragment, vNode);
  }
  xmlFragment.up();
};

const buildTableCellProperties = (xmlFragment, styles) => {
  xmlFragment.ele('w:tcPr');
  // TODO: Add styles within it
  xmlFragment.up();
};

const buildTableCell = (xmlFragment, vNode) => {
  xmlFragment.ele('w:tc');
  buildTableCellProperties(xmlFragment);
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      if (isVText(childVNode)) {
        buildParagraph(xmlFragment, childVNode);
      }
    }
  }
  xmlFragment.up();
};

const buildTableRow = (xmlFragment, vNode) => {
  xmlFragment.ele('w:tr');
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      if (childVNode.tagName === 'td') {
        buildTableCell(xmlFragment, childVNode);
      }
    }
  }
  buildTableCell(xmlFragment);
  xmlFragment.up();
};

const buildTableGridCol = (xmlFragment) => {
  xmlFragment.ele('w:gridCol').up();
};

const buildTableGrid = (xmlFragment, vNode) => {
  xmlFragment.ele('w:tblGrid');
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      if (childVNode.tagName === 'col') {
        buildTableGridCol(xmlFragment);
      }
    }
  }
  xmlFragment.up();
};

const buildTableProperties = (xmlFragment, styles) => {
  xmlFragment.ele('w:tblPr');
  // TODO: Add styles within it
  xmlFragment.up();
};

const buildTable = (xmlFragment, vNode) => {
  xmlFragment.ele('w:tbl');
  buildTableProperties(xmlFragment);
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      if (childVNode.tagName === 'colgroup') {
        buildTableGrid(xmlFragment, childVNode);
      } else if (childVNode.tagName === 'tr') {
        buildTableRow(xmlFragment, childVNode);
      }
    }
  }

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
  buildBold,
  buildItalics,
  buildUnderline,
};
