/* eslint-disable no-unused-vars */
import { fragment } from 'xmlbuilder2';

const isVNode = require('virtual-dom/vnode/is-vnode');
const isVText = require('virtual-dom/vnode/is-vtext');

const buildBold = () => {
  const boldFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  })
    .ele('@w', 'b')
    .up();

  return boldFragment;
};

const buildItalics = () => {
  const italicsFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  })
    .ele('@w', 'i')
    .up();

  return italicsFragment;
};

const buildUnderline = () => {
  const underlineFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  })
    .ele('@w', 'u')
    .up();

  return underlineFragment;
};

const buildLineBreak = () => {
  const lineBreakFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  })
    .ele('@w', 'br')
    .up();

  return lineBreakFragment;
};

const buildTextElement = (text) => {
  const textFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  })
    .ele('@w', 't')
    .txt(text)
    .up();

  return textFragment;
};

const buildRunProperties = () => {
  const runPropertiesFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  }).ele('@w', 'rPr');
  // TODO: Add styles within it
  runPropertiesFragment.up();

  return runPropertiesFragment;
};

const buildRun = (vNode) => {
  const runFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  }).ele('@w', 'r');
  const runPropertiesFragment = buildRunProperties();
  runFragment.import(runPropertiesFragment);
  if (isVText(vNode)) {
    const textFragment = buildTextElement(vNode.text);
    runFragment.import(textFragment);
  }
  runFragment.up();

  return runFragment;
};

const buildNumberingProperties = (levelId, numberingId) => {
  const numberingPropertiesFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  })
    .ele('@w', 'numPr')
    .ele('@w', 'ilvl')
    .att('@w', 'val', String(levelId))
    .up()
    .ele('@w', 'numId')
    .att('@w', 'val', String(numberingId))
    .up()
    .up();

  return numberingPropertiesFragment;
};

const buildNumberingInstances = () => {
  const numberingInstancesFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  })
    .ele('@w', 'num')
    .ele('@w', 'abstractNumId')
    .up()
    .up();

  return numberingInstancesFragment;
};

const buildSpacing = () => {
  const spacingFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  })
    .ele('@w', 'spacing')
    .up();

  return spacingFragment;
};

const buildShading = (fillColorCode) => {
  const shadingFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  })
    .ele('@w', 'shd')
    // background color for text
    .att('@w', 'fill', fillColorCode)
    .att('@w', 'color', 'auto')
    .att('@w', 'val', 'clear')
    .up();

  return shadingFragment;
};

const buildIndentation = () => {
  const indentationFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  })
    .ele('@w', 'ind')
    .up();

  return indentationFragment;
};

const buildHorizontalAlignment = () => {
  const horizontalAlignmentFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  })
    .ele('@w', 'jc')
    .up();

  return horizontalAlignmentFragment;
};

const buildParagraphProperties = (attributes, styles) => {
  const paragraphPropertiesFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  }).ele('@w', 'pPr');
  if (attributes && Object.prototype.hasOwnProperty.call(attributes, 'numbering')) {
    const { levelId, numberingId } = attributes.numbering;
    const numberingPropertiesFragment = buildNumberingProperties(levelId, numberingId);
    paragraphPropertiesFragment.import(numberingPropertiesFragment);
  }
  // TODO: Add styles within it
  paragraphPropertiesFragment.up();

  return paragraphPropertiesFragment;
};

const buildParagraph = (vNode, attributes) => {
  const paragraphFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  }).ele('@w', 'p');
  const paragraphPropertiesFragment = buildParagraphProperties(
    attributes,
    isVNode(vNode) ? vNode.properties.attributes.style : {}
  );
  paragraphFragment.import(paragraphPropertiesFragment);
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      // FIXME: Handle <span>
      const runFragment = buildRun(childVNode);
      paragraphFragment.import(runFragment);
    }
  } else {
    // In case paragraphs has to be rendered where vText is present. Eg. table-cell
    const runFragment = buildRun(vNode);
    paragraphFragment.import(runFragment);
  }
  paragraphFragment.up();

  return paragraphFragment;
};

const buildTableCellProperties = (styles) => {
  const tableCellPropertiesFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  }).ele('@w', 'tcPr');
  // TODO: Add styles within it
  tableCellPropertiesFragment.up();

  return tableCellPropertiesFragment;
};

const buildTableCell = (vNode) => {
  const tableCellFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  }).ele('@w', 'tc');
  const tableCellPropertiesFragment = buildTableCellProperties();
  tableCellFragment.import(tableCellPropertiesFragment);
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      if (isVText(childVNode)) {
        const paragraphFragment = buildParagraph(childVNode);
        tableCellFragment.import(paragraphFragment);
      }
    }
  }
  tableCellFragment.up();

  return tableCellFragment;
};

const buildTableRow = (vNode) => {
  const tableRowFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  }).ele('@w', 'tr');
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      if (childVNode.tagName === 'td') {
        const tableCellFragment = buildTableCell(childVNode);
        tableRowFragment.import(tableCellFragment);
      }
    }
  }
  tableRowFragment.up();

  return tableRowFragment;
};

const buildTableGridCol = () => {
  const tableGridColFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  }).ele('@w', 'gridCol');

  return tableGridColFragment;
};

const buildTableGrid = (vNode) => {
  const tableGridFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  }).ele('@w', 'tblGrid');
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      if (childVNode.tagName === 'col') {
        const tableGridColFragment = buildTableGridCol();
        tableGridFragment.import(tableGridColFragment);
      }
    }
  }
  tableGridFragment.up();

  return tableGridFragment;
};

const buildTableProperties = (styles) => {
  const tablePropertiesFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  }).ele('@w', 'tblPr');
  // TODO: Add styles within it
  tablePropertiesFragment.up();

  return tablePropertiesFragment;
};

const buildTable = (vNode) => {
  const tableFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  }).ele('@w', 'tbl');
  const tablePropertiesFragment = buildTableProperties();
  tableFragment.import(tablePropertiesFragment);
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      if (childVNode.tagName === 'colgroup') {
        const tableGridFragment = buildTableGrid(childVNode);
        tableFragment.import(tableGridFragment);
      } else if (childVNode.tagName === 'tbody') {
        // eslint-disable-next-line no-plusplus
        for (let iteratorIndex = 0; iteratorIndex < childVNode.children.length; iteratorIndex++) {
          const grandChildVNode = childVNode.children[index];
          if (grandChildVNode.tagName === 'tr') {
            const tableRowFragment = buildTableRow(grandChildVNode);
            tableFragment.import(tableRowFragment);
          }
        }
      } else if (childVNode.tagName === 'tr') {
        const tableRowFragment = buildTableRow(childVNode);
        tableFragment.import(tableRowFragment);
      }
    }
  }
  tableFragment.up();

  return tableFragment;
};

const buildHyperlink = () => {
  // Relationship for external hyperlinks r:id="rId4"
  const hyperlinkFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  }).ele('@w', 'hyperlink');
  const runFragment = buildRun();
  hyperlinkFragment.import(runFragment);
  hyperlinkFragment.up();

  return hyperlinkFragment;
};

const buildShapeProperties = () => {
  const shapeProperties = fragment({
    namespaceAlias: { pic: 'http://schemas.openxmlformats.org/drawingml/2006/picture' },
  }).ele('@pic', 'spPr');

  shapeProperties.up();

  return shapeProperties;
};

const buildBinaryLargeImageOrPicture = (relationshipId) => {
  const binaryLargeImageOrPictureFragment = fragment({
    namespaceAlias: {
      a: 'http://schemas.openxmlformats.org/drawingml/2006/main',
      r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    },
  })
    .ele('@a', 'blip')
    .att('@r', 'embed', `rId${relationshipId}`)
    // FIXME: possible values 'email', 'none', 'print', 'hqprint', 'screen'
    .att('cstate', 'print');

  binaryLargeImageOrPictureFragment.up();

  return binaryLargeImageOrPictureFragment;
};

const buildBinaryLargeImageOrPictureFill = () => {
  const binaryLargeImageOrPictureFillFragment = fragment({
    namespaceAlias: { pic: 'http://schemas.openxmlformats.org/drawingml/2006/picture' },
  }).ele('@pic', 'blipFill');
  const binaryLargeImageOrPictureFragment = buildBinaryLargeImageOrPicture();
  binaryLargeImageOrPictureFillFragment.import(binaryLargeImageOrPictureFragment);
  binaryLargeImageOrPictureFillFragment.up();

  return binaryLargeImageOrPictureFillFragment;
};

const buildNonVisualPictureDrawingProperties = () => {
  const nonVisualPictureDrawingPropertiesFragment = fragment({
    namespaceAlias: { pic: 'http://schemas.openxmlformats.org/drawingml/2006/picture' },
  }).ele('@pic', 'cNvPicPr');

  nonVisualPictureDrawingPropertiesFragment.up();

  return nonVisualPictureDrawingPropertiesFragment;
};

const buildNonVisualDrawingProperties = (
  pictureId,
  pictureNameWithExtension,
  pictureTitle,
  pictureDescription
) => {
  const nonVisualDrawingPropertiesFragment = fragment({
    namespaceAlias: { pic: 'http://schemas.openxmlformats.org/drawingml/2006/picture' },
  })
    .ele('@pic', 'cNvPr')
    .att('id', pictureId)
    .att('name', pictureNameWithExtension)
    .att('title', pictureTitle)
    .att('descr', pictureDescription);

  nonVisualDrawingPropertiesFragment.up();

  return nonVisualDrawingPropertiesFragment;
};

const buildNonVisualPictureProperties = () => {
  const nonVisualPicturePropertiesFragment = fragment({
    namespaceAlias: { pic: 'http://schemas.openxmlformats.org/drawingml/2006/picture' },
  }).ele('@pic', 'nvPicPr');
  // TODO: Handle picture attributes
  const nonVisualDrawingPropertiesFragment = buildNonVisualDrawingProperties();
  nonVisualPicturePropertiesFragment.import(nonVisualDrawingPropertiesFragment);
  const nonVisualPictureDrawingPropertiesFragment = buildNonVisualPictureDrawingProperties();
  nonVisualPicturePropertiesFragment.import(nonVisualPictureDrawingPropertiesFragment);
  nonVisualPicturePropertiesFragment.up();

  return nonVisualPicturePropertiesFragment;
};

const buildPicture = () => {
  const pictureFragment = fragment({
    namespaceAlias: { pic: 'http://schemas.openxmlformats.org/drawingml/2006/picture' },
  }).ele('@pic', 'pic');
  const nonVisualPicturePropertiesFragment = buildNonVisualPictureProperties();
  pictureFragment.import(nonVisualPicturePropertiesFragment);
  const binaryLargeImageOrPictureFill = buildBinaryLargeImageOrPictureFill();
  pictureFragment.import(binaryLargeImageOrPictureFill);
  const shapeProperties = buildShapeProperties();
  pictureFragment.import(shapeProperties);
  pictureFragment.up();

  return pictureFragment;
};

const buildGraphicData = (type) => {
  const graphicDataFragment = fragment({
    namespaceAlias: {
      a: 'http://schemas.openxmlformats.org/drawingml/2006/main',
    },
  }).ele('@a', 'graphicData');
  if (type === 'picture') {
    const pictureFragment = buildPicture();
    pictureFragment.import(graphicDataFragment);
  }
  graphicDataFragment.up();

  return graphicDataFragment;
};

const buildGraphic = () => {
  const graphicFragment = fragment({
    namespaceAlias: {
      a: 'http://schemas.openxmlformats.org/drawingml/2006/main',
    },
  }).ele('@a', 'graphic');
  // TODO: Handle drawing type
  const graphicDataFragment = buildGraphicData();
  graphicFragment.import(graphicDataFragment);
  graphicFragment.up();

  return graphicFragment;
};

const buildAnchoredDrawing = () => {
  const anchoredDrawingFragment = fragment({
    namespaceAlias: {
      wp: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    },
  }).ele('@wp', 'anchor');
  const graphicFragment = buildGraphic();
  anchoredDrawingFragment.import(graphicFragment);

  return anchoredDrawingFragment;
};

const buildInlineDrawing = () => {
  const inlineDrawingFragment = fragment({
    namespaceAlias: {
      wp: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    },
  }).ele('@wp', 'inline');
  const graphicFragment = buildGraphic();
  inlineDrawingFragment.import(graphicFragment);

  return inlineDrawingFragment;
};

const buildDrawing = (vNode, type, attributes) => {
  const drawingFragment = fragment({
    namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
  }).ele('@w', 'drawing');
  // TODO: Branch if image is inline or anchored
  const inlineOrAnchoredDrawingFragment =
    type === 'inline' ? buildInlineDrawing() : buildAnchoredDrawing();
  drawingFragment.import(inlineOrAnchoredDrawingFragment);
  drawingFragment.up();

  return drawingFragment;
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
  buildDrawing,
};
