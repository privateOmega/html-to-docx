/* eslint-disable no-unused-vars */
import { fragment } from 'xmlbuilder2';

// eslint-disable-next-line import/no-named-default
import { default as namespaces } from './namespaces';

const isVNode = require('virtual-dom/vnode/is-vnode');
const isVText = require('virtual-dom/vnode/is-vtext');

const buildBold = () => {
  const boldFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'b')
    .up();

  return boldFragment;
};

const buildItalics = () => {
  const italicsFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'i')
    .up();

  return italicsFragment;
};

const buildUnderline = () => {
  const underlineFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'u')
    .up();

  return underlineFragment;
};

const buildLineBreak = () => {
  const lineBreakFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'br')
    .up();

  return lineBreakFragment;
};

const buildTextElement = (text) => {
  const textFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 't')
    .txt(text)
    .up();

  return textFragment;
};

const buildRunProperties = () => {
  const runPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'rPr');
  // TODO: Add styles within it
  runPropertiesFragment.up();

  return runPropertiesFragment;
};

const buildRun = (vNode, attributes) => {
  const runFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'r');
  const runPropertiesFragment = buildRunProperties();
  runFragment.import(runPropertiesFragment);
  if (isVText(vNode)) {
    const textFragment = buildTextElement(vNode.text);
    runFragment.import(textFragment);
  } else if (attributes && attributes.type === 'picture') {
    const { type, inlineOrAnchored, ...otherAttributes } = attributes;
    // eslint-disable-next-line no-use-before-define
    const imageFragment = buildDrawing(inlineOrAnchored, type, otherAttributes);
    runFragment.import(imageFragment);
  }
  runFragment.up();

  return runFragment;
};

const buildNumberingProperties = (levelId, numberingId) => {
  const numberingPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
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
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'num')
    .ele('@w', 'abstractNumId')
    .up()
    .up();

  return numberingInstancesFragment;
};

const buildSpacing = () => {
  const spacingFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'spacing')
    .up();

  return spacingFragment;
};

const buildShading = (fillColorCode) => {
  const shadingFragment = fragment({
    namespaceAlias: { w: namespaces.w },
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
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'ind')
    .up();

  return indentationFragment;
};

const buildHorizontalAlignment = () => {
  const horizontalAlignmentFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'jc')
    .up();

  return horizontalAlignmentFragment;
};

const buildParagraphProperties = (attributes, styles) => {
  const paragraphPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
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
    namespaceAlias: { w: namespaces.w },
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
    // Or in case the vNode is something like img
    const runFragment = buildRun(vNode, attributes);
    paragraphFragment.import(runFragment);
  }
  paragraphFragment.up();

  return paragraphFragment;
};

const buildTableCellProperties = (styles) => {
  const tableCellPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tcPr');
  // TODO: Add styles within it
  tableCellPropertiesFragment.up();

  return tableCellPropertiesFragment;
};

const buildTableCell = (vNode) => {
  const tableCellFragment = fragment({
    namespaceAlias: { w: namespaces.w },
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
    namespaceAlias: { w: namespaces.w },
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
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'gridCol');

  return tableGridColFragment;
};

const buildTableGrid = (vNode) => {
  const tableGridFragment = fragment({
    namespaceAlias: { w: namespaces.w },
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
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tblPr');
  // TODO: Add styles within it
  tablePropertiesFragment.up();

  return tablePropertiesFragment;
};

const buildTable = (vNode) => {
  const tableFragment = fragment({
    namespaceAlias: { w: namespaces.w },
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
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'hyperlink');
  const runFragment = buildRun();
  hyperlinkFragment.import(runFragment);
  hyperlinkFragment.up();

  return hyperlinkFragment;
};

const buildShapeProperties = () => {
  const shapeProperties = fragment({
    namespaceAlias: { pic: namespaces.pic },
  }).ele('@pic', 'spPr');

  shapeProperties.up();

  return shapeProperties;
};

const buildBinaryLargeImageOrPicture = (relationshipId) => {
  const binaryLargeImageOrPictureFragment = fragment({
    namespaceAlias: {
      a: namespaces.a,
      r: namespaces.r,
    },
  })
    .ele('@a', 'blip')
    .att('@r', 'embed', `rId${relationshipId}`)
    // FIXME: possible values 'email', 'none', 'print', 'hqprint', 'screen'
    .att('cstate', 'print');

  binaryLargeImageOrPictureFragment.up();

  return binaryLargeImageOrPictureFragment;
};

const buildBinaryLargeImageOrPictureFill = (relationshipId) => {
  const binaryLargeImageOrPictureFillFragment = fragment({
    namespaceAlias: { pic: namespaces.pic },
  }).ele('@pic', 'blipFill');
  const binaryLargeImageOrPictureFragment = buildBinaryLargeImageOrPicture(relationshipId);
  binaryLargeImageOrPictureFillFragment.import(binaryLargeImageOrPictureFragment);
  binaryLargeImageOrPictureFillFragment.up();

  return binaryLargeImageOrPictureFillFragment;
};

const buildNonVisualPictureDrawingProperties = () => {
  const nonVisualPictureDrawingPropertiesFragment = fragment({
    namespaceAlias: { pic: namespaces.pic },
  }).ele('@pic', 'cNvPicPr');

  nonVisualPictureDrawingPropertiesFragment.up();

  return nonVisualPictureDrawingPropertiesFragment;
};

const buildNonVisualDrawingProperties = (
  pictureId,
  pictureNameWithExtension,
  pictureTitle = '',
  pictureDescription = ''
) => {
  const nonVisualDrawingPropertiesFragment = fragment({
    namespaceAlias: { pic: namespaces.pic },
  })
    .ele('@pic', 'cNvPr')
    .att('id', pictureId)
    .att('name', pictureNameWithExtension)
    .att('title', pictureTitle)
    .att('descr', pictureDescription);

  nonVisualDrawingPropertiesFragment.up();

  return nonVisualDrawingPropertiesFragment;
};

const buildNonVisualPictureProperties = (
  pictureId,
  pictureNameWithExtension,
  pictureTitle,
  pictureDescription
) => {
  const nonVisualPicturePropertiesFragment = fragment({
    namespaceAlias: { pic: namespaces.pic },
  }).ele('@pic', 'nvPicPr');
  // TODO: Handle picture attributes
  const nonVisualDrawingPropertiesFragment = buildNonVisualDrawingProperties(
    pictureId,
    pictureNameWithExtension,
    pictureTitle,
    pictureDescription
  );
  nonVisualPicturePropertiesFragment.import(nonVisualDrawingPropertiesFragment);
  const nonVisualPictureDrawingPropertiesFragment = buildNonVisualPictureDrawingProperties();
  nonVisualPicturePropertiesFragment.import(nonVisualPictureDrawingPropertiesFragment);
  nonVisualPicturePropertiesFragment.up();

  return nonVisualPicturePropertiesFragment;
};

const buildPicture = ({ id, fileNameWithExtension, title, description, relationshipId }) => {
  const pictureFragment = fragment({
    namespaceAlias: { pic: namespaces.pic },
  }).ele('@pic', 'pic');
  const nonVisualPicturePropertiesFragment = buildNonVisualPictureProperties(
    id,
    fileNameWithExtension,
    title,
    description
  );
  pictureFragment.import(nonVisualPicturePropertiesFragment);
  const binaryLargeImageOrPictureFill = buildBinaryLargeImageOrPictureFill(relationshipId);
  pictureFragment.import(binaryLargeImageOrPictureFill);
  const shapeProperties = buildShapeProperties();
  pictureFragment.import(shapeProperties);
  pictureFragment.up();

  return pictureFragment;
};

const buildGraphicData = (graphicType, attributes) => {
  const graphicDataFragment = fragment({
    namespaceAlias: {
      a: namespaces.a,
    },
  }).ele('@a', 'graphicData');
  if (graphicType === 'picture') {
    const pictureFragment = buildPicture(attributes);
    graphicDataFragment.import(pictureFragment);
  }
  graphicDataFragment.up();

  return graphicDataFragment;
};

const buildGraphic = (graphicType, attributes) => {
  const graphicFragment = fragment({
    namespaceAlias: {
      a: namespaces.a,
    },
  }).ele('@a', 'graphic');
  // TODO: Handle drawing type
  const graphicDataFragment = buildGraphicData(graphicType, attributes);
  graphicFragment.import(graphicDataFragment);
  graphicFragment.up();

  return graphicFragment;
};

const buildAnchoredDrawing = (graphicType, attributes) => {
  const anchoredDrawingFragment = fragment({
    namespaceAlias: {
      wp: namespaces.wp,
    },
  }).ele('@wp', 'anchor');
  const graphicFragment = buildGraphic(graphicType, attributes);
  anchoredDrawingFragment.import(graphicFragment);

  return anchoredDrawingFragment;
};

const buildInlineDrawing = (graphicType, attributes) => {
  const inlineDrawingFragment = fragment({
    namespaceAlias: {
      wp: namespaces.wp,
    },
  }).ele('@wp', 'inline');
  const graphicFragment = buildGraphic(graphicType, attributes);
  inlineDrawingFragment.import(graphicFragment);

  return inlineDrawingFragment;
};

const buildDrawing = (float = false, graphicType, attributes) => {
  const drawingFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'drawing');
  const inlineOrAnchoredDrawingFragment = float
    ? buildAnchoredDrawing(graphicType, attributes)
    : buildInlineDrawing(graphicType, attributes);
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
