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

const buildUnderline = (type = 'single') => {
  const underlineFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'u')
    .att('@w', 'val', type)
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

const buildInsideVBorder = () => {
  const insideVBorderFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'insideV')
    .att('@w', 'val', 'single')
    .att('@w', 'sz', '4')
    .att('@w', 'space', '0')
    .att('@w', 'color', 'auto')
    .up();

  return insideVBorderFragment;
};

const buildInsideHBorder = () => {
  const insideHBorderFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'insideH')
    .att('@w', 'val', 'single')
    .att('@w', 'sz', '4')
    .att('@w', 'space', '0')
    .att('@w', 'color', 'auto')
    .up();

  return insideHBorderFragment;
};

const buildRightBorder = () => {
  const rightBorderFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'right')
    .att('@w', 'val', 'single')
    .att('@w', 'sz', '4')
    .att('@w', 'space', '0')
    .att('@w', 'color', 'auto')
    .up();

  return rightBorderFragment;
};

const buildBottomBorder = () => {
  const bottomBorderFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'bottom')
    .att('@w', 'val', 'single')
    .att('@w', 'sz', '4')
    .att('@w', 'space', '0')
    .att('@w', 'color', 'auto')
    .up();

  return bottomBorderFragment;
};

const buildLeftBorder = () => {
  const leftBorderFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'left')
    .att('@w', 'val', 'single')
    .att('@w', 'sz', '4')
    .att('@w', 'space', '0')
    .att('@w', 'color', 'auto')
    .up();

  return leftBorderFragment;
};

const buildTopBorder = () => {
  const topBorderFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'top')
    .att('@w', 'val', 'single')
    .att('@w', 'sz', '4')
    .att('@w', 'space', '0')
    .att('@w', 'color', 'auto')
    .up();

  return topBorderFragment;
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

const buildRunProperties = (attributes) => {
  const runPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'rPr');
  if (attributes && attributes.type) {
    switch (attributes.type) {
      case 'strong':
        runPropertiesFragment.ele('@w', 'b').up();
        break;
      case 'i':
        runPropertiesFragment.ele('@w', 'i').up();
        break;
      case 'u':
        runPropertiesFragment.ele('@w', 'u').att('@w', 'val', 'single').up();
        break;
      case 'color':
        runPropertiesFragment.ele('@w', 'color').att('@w', 'val', attributes.value);
        break;
      default:
        break;
    }
  }

  // TODO: Add styles within it
  runPropertiesFragment.up();

  return runPropertiesFragment;
};

const buildTextFormatting = (vNode) => {
  if (vNode.tagName === 'strong') {
    const boldFragment = buildBold();
    return boldFragment;
  } else if (vNode.tagName === 'i') {
    const italicsFragment = buildItalics();
    return italicsFragment;
  } else if (vNode.tagName === 'u') {
    const underlineFragment = buildUnderline();
    return underlineFragment;
  }
};

const buildRun = (vNode, attributes) => {
  const runFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'r');
  const runPropertiesFragment = buildRunProperties(attributes);
  let childVNode;
  if (isVNode(vNode) && ['span', 'strong', 'i', 'u'].includes(vNode.tagName)) {
    if (vNode.tagName === 'span') {
      // eslint-disable-next-line no-plusplus
      for (let index = 0; index < vNode.children.length; index++) {
        const spanChildVNode = vNode.children[index];
        if (isVText(spanChildVNode)) {
          childVNode = spanChildVNode;
        } else {
          const formattingFragment = buildTextFormatting(spanChildVNode);
          runPropertiesFragment.import(formattingFragment);
          // TODO: Check if there can ever be possibility of multiple children
          // eslint-disable-next-line prefer-destructuring
          childVNode = spanChildVNode.children[0];
        }
      }
    } else {
      const formattingFragment = buildTextFormatting(vNode);
      runPropertiesFragment.import(formattingFragment);
      // TODO: Check if there can ever be possibility of multiple children
      // eslint-disable-next-line prefer-destructuring
      childVNode = vNode.children[0];
    }
    // eslint-disable-next-line no-param-reassign
    vNode = childVNode;
  }
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
      const runFragment = buildRun(childVNode, attributes);
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
  } else {
    // TODO: Figure out why building with buildParagraph() isn't working
    const paragraphFragment = fragment({
      namespaceAlias: { w: namespaces.w },
    })
      .ele('@w', 'p')
      .up();
    tableCellFragment.import(paragraphFragment);
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

const buildTableGridCol = (gridWidth) => {
  const tableGridColFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'gridCol')
    .att('@w', 'w', String(gridWidth));

  return tableGridColFragment;
};

const buildTableGrid = (vNode, attributes) => {
  const tableGridFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tblGrid');
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    const gridColumns = vNode.children.filter((childVNode) => childVNode.tagName === 'col');
    const gridWidth = attributes.width / gridColumns.length;
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < gridColumns.length; index++) {
      const tableGridColFragment = buildTableGridCol(gridWidth);
      tableGridFragment.import(tableGridColFragment);
    }
  }
  tableGridFragment.up();

  return tableGridFragment;
};

const buildTableBorders = () => {
  const tableBordersFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tblBorders');

  const topBorderFragment = buildTopBorder();
  tableBordersFragment.import(topBorderFragment);
  const leftBorderFragment = buildLeftBorder();
  tableBordersFragment.import(leftBorderFragment);
  const bottomBorderFragment = buildBottomBorder();
  tableBordersFragment.import(bottomBorderFragment);
  const rightBorderFragment = buildRightBorder();
  tableBordersFragment.import(rightBorderFragment);
  const insideHBorderFragment = buildInsideHBorder();
  tableBordersFragment.import(insideHBorderFragment);
  const insideVBorderFragment = buildInsideVBorder();
  tableBordersFragment.import(insideVBorderFragment);

  tableBordersFragment.up();

  return tableBordersFragment;
};

const buildTableProperties = (styles) => {
  const tablePropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tblPr');
  // TODO: Add styles within it

  const tableBordersFragment = buildTableBorders();
  tablePropertiesFragment.import(tableBordersFragment);

  tablePropertiesFragment.up();

  return tablePropertiesFragment;
};

const buildTable = (vNode, attributes) => {
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
        const tableGridFragment = buildTableGrid(childVNode, attributes);
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

const buildPresetGeometry = () => {
  const presetGeometryFragment = fragment({
    namespaceAlias: { a: namespaces.a },
  })
    .ele('@a', 'prstGeom')
    .att('prst', 'rect')
    .up();

  return presetGeometryFragment;
};

const buildGraphicFrameTransform = () => {
  const graphicFrameTransformFragment = fragment({
    namespaceAlias: { a: namespaces.a },
  })
    .ele('@a', 'xfrm')
    .ele('@a', 'off')
    .att('x', '0')
    .att('y', '0')
    .up()
    .ele('@a', 'ext')
    .att('cx', '5943600')
    .att('cy', '3347085')
    .up();

  graphicFrameTransformFragment.up();

  return graphicFrameTransformFragment;
};

const buildShapeProperties = () => {
  const shapeProperties = fragment({
    namespaceAlias: { pic: namespaces.pic },
  }).ele('@pic', 'spPr');

  const graphicFrameTransformFragment = buildGraphicFrameTransform();
  shapeProperties.import(graphicFrameTransformFragment);
  const presetGeometryFragment = buildPresetGeometry();
  shapeProperties.import(presetGeometryFragment);

  shapeProperties.up();

  return shapeProperties;
};

const buildFillRect = () => {
  const fillRectFragment = fragment({
    namespaceAlias: { a: namespaces.a },
  })
    .ele('@a', 'fillRect')
    .up();

  return fillRectFragment;
};

const buildStretch = () => {
  const stretchFragment = fragment({
    namespaceAlias: { a: namespaces.a },
  }).ele('@a', 'stretch');

  const fillRectFragment = buildFillRect();
  stretchFragment.import(fillRectFragment);

  stretchFragment.up();

  return stretchFragment;
};

const buildSrcRectFragment = () => {
  const srcRectFragment = fragment({
    namespaceAlias: { a: namespaces.a },
  })
    .ele('@a', 'srcRect')
    .att('b', '0')
    .att('l', '0')
    .att('r', '0')
    .att('t', '0')
    .up();

  return srcRectFragment;
};

const buildBinaryLargeImageOrPicture = (relationshipId) => {
  const binaryLargeImageOrPictureFragment = fragment({
    namespaceAlias: { a: namespaces.a, r: namespaces.r },
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
  const srcRectFragment = buildSrcRectFragment();
  binaryLargeImageOrPictureFillFragment.import(srcRectFragment);
  const stretchFragment = buildStretch();
  binaryLargeImageOrPictureFillFragment.import(stretchFragment);

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
  pictureDescription = ''
) => {
  const nonVisualDrawingPropertiesFragment = fragment({
    namespaceAlias: { pic: namespaces.pic },
  })
    .ele('@pic', 'cNvPr')
    .att('id', pictureId)
    .att('name', pictureNameWithExtension)
    .att('descr', pictureDescription);

  nonVisualDrawingPropertiesFragment.up();

  return nonVisualDrawingPropertiesFragment;
};

const buildNonVisualPictureProperties = (
  pictureId,
  pictureNameWithExtension,
  pictureDescription
) => {
  const nonVisualPicturePropertiesFragment = fragment({
    namespaceAlias: { pic: namespaces.pic },
  }).ele('@pic', 'nvPicPr');
  // TODO: Handle picture attributes
  const nonVisualDrawingPropertiesFragment = buildNonVisualDrawingProperties(
    pictureId,
    pictureNameWithExtension,
    pictureDescription
  );
  nonVisualPicturePropertiesFragment.import(nonVisualDrawingPropertiesFragment);
  const nonVisualPictureDrawingPropertiesFragment = buildNonVisualPictureDrawingProperties();
  nonVisualPicturePropertiesFragment.import(nonVisualPictureDrawingPropertiesFragment);
  nonVisualPicturePropertiesFragment.up();

  return nonVisualPicturePropertiesFragment;
};

const buildPicture = ({ id, fileNameWithExtension, description, relationshipId }) => {
  const pictureFragment = fragment({
    namespaceAlias: { pic: namespaces.pic },
  }).ele('@pic', 'pic');
  const nonVisualPicturePropertiesFragment = buildNonVisualPictureProperties(
    id,
    fileNameWithExtension,
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
    namespaceAlias: { a: namespaces.a },
  })
    .ele('@a', 'graphicData')
    .att('uri', 'http://schemas.openxmlformats.org/drawingml/2006/picture');
  if (graphicType === 'picture') {
    const pictureFragment = buildPicture(attributes);
    graphicDataFragment.import(pictureFragment);
  }
  graphicDataFragment.up();

  return graphicDataFragment;
};

const buildGraphic = (graphicType, attributes) => {
  const graphicFragment = fragment({
    namespaceAlias: { a: namespaces.a },
  }).ele('@a', 'graphic');
  // TODO: Handle drawing type
  const graphicDataFragment = buildGraphicData(graphicType, attributes);
  graphicFragment.import(graphicDataFragment);
  graphicFragment.up();

  return graphicFragment;
};

const buildDrawingObjectNonVisualProperties = (pictureId, pictureName) => {
  const drawingObjectNonVisualPropertiesFragment = fragment({
    namespaceAlias: { wp: namespaces.wp },
  })
    .ele('@wp', 'docPr')
    .att('id', pictureId)
    .att('name', pictureName)
    .up();

  return drawingObjectNonVisualPropertiesFragment;
};

const buildWrapSquare = () => {
  const wrapSquareFragment = fragment({
    namespaceAlias: { wp: namespaces.wp },
  })
    .ele('@wp', 'wrapSquare')
    .att('wrapText', 'bothSides')
    .att('distB', '228600')
    .att('distT', '228600')
    .att('distL', '228600')
    .att('distR', '228600')
    .up();

  return wrapSquareFragment;
};

const buildWrapNone = () => {
  const wrapNoneFragment = fragment({
    namespaceAlias: { wp: namespaces.wp },
  })
    .ele('@wp', 'wrapNone')
    .up();

  return wrapNoneFragment;
};

const buildEffectExtentFragment = () => {
  const effectExtentFragment = fragment({
    namespaceAlias: { wp: namespaces.wp },
  })
    .ele('@wp', 'effectExtent')
    .att('b', '0')
    .att('l', '0')
    .att('r', '0')
    .att('t', '0')
    .up();

  return effectExtentFragment;
};

const buildExtent = () => {
  const extentFragment = fragment({
    namespaceAlias: { wp: namespaces.wp },
  })
    .ele('@wp', 'extent')
    .att('cx', '5943600')
    .att('cy', '3347085')
    .up();

  return extentFragment;
};

const buildPositionV = () => {
  const positionVFragment = fragment({
    namespaceAlias: { wp: namespaces.wp },
  })
    .ele('@wp', 'positionV')
    .att('relativeFrom', 'paragraph')
    .ele('@wp', 'posOffset')
    .txt('19050')
    .up()
    .up();

  return positionVFragment;
};

const buildPositionH = () => {
  const positionHFragment = fragment({
    namespaceAlias: { wp: namespaces.wp },
  })
    .ele('@wp', 'positionH')
    .att('relativeFrom', 'column')
    .ele('@wp', 'posOffset')
    .txt('19050')
    .up()
    .up();

  return positionHFragment;
};

const buildSimplePos = () => {
  const simplePosFragment = fragment({
    namespaceAlias: { wp: namespaces.wp },
  })
    .ele('@wp', 'simplePos')
    .att('x', '0')
    .att('y', '0')
    .up();

  return simplePosFragment;
};

const buildAnchoredDrawing = (graphicType, attributes) => {
  const anchoredDrawingFragment = fragment({
    namespaceAlias: { wp: namespaces.wp },
  })
    .ele('@wp', 'anchor')
    .att('distB', '0')
    .att('distL', '0')
    .att('distR', '0')
    .att('distT', '0')
    .att('relativeHeight', '0')
    .att('behindDoc', 'false')
    .att('locked', 'true')
    .att('layoutInCell', 'true')
    .att('allowOverlap', 'false')
    .att('simplePos', 'false');
  // Even though simplePos isnt supported by Word 2007 simplePos is required.
  const simplePosFragment = buildSimplePos();
  anchoredDrawingFragment.import(simplePosFragment);
  const positionHFragment = buildPositionH();
  anchoredDrawingFragment.import(positionHFragment);
  const positionVFragment = buildPositionV();
  anchoredDrawingFragment.import(positionVFragment);
  const extentFragment = buildExtent();
  anchoredDrawingFragment.import(extentFragment);
  const effectExtentFragment = buildEffectExtentFragment();
  anchoredDrawingFragment.import(effectExtentFragment);
  const wrapSquareFragment = buildWrapSquare();
  anchoredDrawingFragment.import(wrapSquareFragment);
  const drawingObjectNonVisualPropertiesFragment = buildDrawingObjectNonVisualProperties(
    attributes.id,
    attributes.fileNameWithExtension
  );
  anchoredDrawingFragment.import(drawingObjectNonVisualPropertiesFragment);
  const graphicFragment = buildGraphic(graphicType, attributes);
  anchoredDrawingFragment.import(graphicFragment);

  anchoredDrawingFragment.up();

  return anchoredDrawingFragment;
};

const buildInlineDrawing = (graphicType, attributes) => {
  const inlineDrawingFragment = fragment({
    namespaceAlias: { wp: namespaces.wp },
  })
    .ele('@wp', 'inline')
    .att('distB', '0')
    .att('distL', '0')
    .att('distR', '0')
    .att('distT', '0');

  const extentFragment = buildExtent();
  inlineDrawingFragment.import(extentFragment);
  const effectExtentFragment = buildEffectExtentFragment();
  inlineDrawingFragment.import(effectExtentFragment);
  const drawingObjectNonVisualPropertiesFragment = buildDrawingObjectNonVisualProperties(
    attributes.id,
    attributes.fileNameWithExtension
  );
  inlineDrawingFragment.import(drawingObjectNonVisualPropertiesFragment);
  const graphicFragment = buildGraphic(graphicType, attributes);
  inlineDrawingFragment.import(graphicFragment);

  inlineDrawingFragment.up();

  return inlineDrawingFragment;
};

const buildDrawing = (float = false, graphicType, attributes) => {
  const drawingFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'drawing');
  const inlineOrAnchoredDrawingFragment = float
    ? buildInlineDrawing(graphicType, attributes)
    : buildAnchoredDrawing(graphicType, attributes);
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
