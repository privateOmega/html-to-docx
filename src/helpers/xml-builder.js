/* eslint-disable no-case-declarations */
/* eslint-disable no-plusplus */
/* eslint-disable no-else-return */
/* eslint-disable no-unused-vars */
import { fragment } from 'xmlbuilder2';

// eslint-disable-next-line import/no-named-default
import { default as namespaces } from './namespaces';
import { rgbToHex, hslToHex, hslRegex, rgbRegex, hexRegex } from '../utils/color-conversion';
import { pixelsToEMU, pixelRegex, TWIPToEMU, percentageRegex } from '../utils/unit-conversion';

const isVNode = require('virtual-dom/vnode/is-vnode');
const isVText = require('virtual-dom/vnode/is-vtext');

const buildVerticalAlignment = (verticalAlignment) => {
  const vAlignEquivalentValue = verticalAlignment === 'middle' ? 'both' : 'center';

  const verticalAlignmentFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'vAlign')
    .att('@w', 'val', vAlignEquivalentValue)
    .up();

  return verticalAlignmentFragment;
};

const buildColor = (colorCode) => {
  const colorFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'color')
    .att('@w', 'val', colorCode)
    .up();

  return colorFragment;
};

const buildShading = (colorCode) => {
  const shadingFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'shd')
    .att('@w', 'val', 'clear')
    .att('@w', 'fill', colorCode)
    .up();

  return shadingFragment;
};

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

const buildLineBreak = (type = 'textWrapping') => {
  const lineBreakFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'br')
    .att('@w', 'type', type)
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
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      // eslint-disable-next-line default-case
      switch (key) {
        case 'strong':
          const boldFragment = buildBold();
          runPropertiesFragment.import(boldFragment);
          break;
        case 'i':
          const italicsFragment = buildItalics();
          runPropertiesFragment.import(italicsFragment);
          break;
        case 'u':
          const underlineFragment = buildUnderline();
          runPropertiesFragment.import(underlineFragment);
          break;
        case 'color':
          const colorFragment = buildColor(attributes[key]);
          runPropertiesFragment.import(colorFragment);
          break;
        case 'backgroundColor':
          const shadingFragment = buildShading(attributes[key]);
          runPropertiesFragment.import(shadingFragment);
      }
    });
  }
  runPropertiesFragment.up();

  return runPropertiesFragment;
};

// eslint-disable-next-line consistent-return
const buildTextFormatting = (vNode) => {
  // eslint-disable-next-line default-case
  switch (vNode.tagName) {
    case 'strong':
      const boldFragment = buildBold();
      return boldFragment;
    case 'i':
      const italicsFragment = buildItalics();
      return italicsFragment;
    case 'u':
      const underlineFragment = buildUnderline();
      return underlineFragment;
  }
};

const buildRun = (vNode, attributes) => {
  const runFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'r');
  const runPropertiesFragment = buildRunProperties(attributes);
  if (isVNode(vNode)) {
    while (isVNode(vNode) && ['strong', 'i', 'u'].includes(vNode.tagName)) {
      const formattingFragment = buildTextFormatting(vNode);
      runPropertiesFragment.import(formattingFragment);
      if (vNode.children.length === 1) {
        // eslint-disable-next-line no-param-reassign, prefer-destructuring
        vNode = vNode.children[0];
      } else {
        // FIXME: Multiple formatting children nodes under single formatting parent node.
        for (let index = 0; index < vNode.children.length; index++) {
          const childVNode = vNode.children[index];
          if (isVNode(childVNode) && ['strong', 'i', 'u'].includes(childVNode.tagName)) {
            // eslint-disable-next-line no-param-reassign
            vNode = childVNode;
          }
        }
      }
    }
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
  } else if (isVNode(vNode) && vNode.tagName === 'br') {
    const lineBreakFragment = buildLineBreak();
    runFragment.import(lineBreakFragment);
  }
  runFragment.up();

  return runFragment;
};

// eslint-disable-next-line consistent-return
const fixupColorCode = (colorCodeString) => {
  // eslint-disable-next-line no-unused-expressions
  if (rgbRegex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(rgbRegex);
    const red = matchedParts[1];
    const green = matchedParts[2];
    const blue = matchedParts[3];

    return rgbToHex(red, green, blue);
  } else if (hslRegex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(hslRegex);
    const hue = matchedParts[1];
    const saturation = matchedParts[2];
    const luminosity = matchedParts[3];

    return hslToHex(hue, saturation, luminosity);
  } else if (hexRegex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(hexRegex);

    return matchedParts[1];
  }
};

const buildRunOrRuns = (vNode, attributes) => {
  if (isVNode(vNode) && vNode.tagName === 'span') {
    const runFragments = [];

    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      const modifiedAttributes = { ...attributes };
      if (isVNode(vNode) && vNode.properties && vNode.properties.style) {
        if (
          vNode.properties.style.color &&
          !['transparent', 'auto'].includes(vNode.properties.style.color)
        ) {
          modifiedAttributes.color = fixupColorCode(vNode.properties.style.color);
        }
        if (
          vNode.properties.style['background-color'] &&
          !['transparent', 'auto'].includes(vNode.properties.style['background-color'])
        ) {
          modifiedAttributes.backgroundColor = fixupColorCode(
            vNode.properties.style['background-color']
          );
        }
      }
      runFragments.push(buildRun(childVNode, modifiedAttributes));
    }

    return runFragments;
  } else {
    const runFragment = buildRun(vNode, attributes);

    return runFragment;
  }
};

const buildRunOrHyperLink = (vNode, attributes, docxDocumentInstance) => {
  if (isVNode(vNode) && vNode.tagName === 'a') {
    const relationshipId = docxDocumentInstance.createDocumentRelationships(
      'hyperlink',
      vNode.properties && vNode.properties.href ? vNode.properties.href : ''
    );
    const hyperlinkFragment = fragment({
      namespaceAlias: { w: namespaces.w, r: namespaces.r },
    })
      .ele('@w', 'hyperlink')
      .att('@r', 'id', `rId${relationshipId}`);

    const runFragments = buildRunOrRuns(vNode.children[0], attributes);
    if (Array.isArray(runFragments)) {
      for (let index = 0; index < runFragments.length; index++) {
        const runFragment = runFragments[index];

        hyperlinkFragment.import(runFragment);
      }
    } else {
      hyperlinkFragment.import(runFragments);
    }
    hyperlinkFragment.up();

    return hyperlinkFragment;
  }
  const runFragments = buildRunOrRuns(vNode, attributes);

  return runFragments;
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

const buildIndentation = () => {
  const indentationFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'ind')
    .up();

  return indentationFragment;
};

const buildHorizontalAlignment = (horizontalAlignment) => {
  const horizontalAlignmentFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'jc')
    .att('@w', 'val', horizontalAlignment)
    .up();

  return horizontalAlignmentFragment;
};

const buildParagraphProperties = (attributes) => {
  const paragraphPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'pPr');
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      // eslint-disable-next-line default-case
      switch (key) {
        case 'numbering':
          const { levelId, numberingId } = attributes[key];
          const numberingPropertiesFragment = buildNumberingProperties(levelId, numberingId);
          paragraphPropertiesFragment.import(numberingPropertiesFragment);
          // Delete used property
          // eslint-disable-next-line no-param-reassign
          delete attributes.numbering;
          break;
        case 'textAlign':
          const horizontalAlignmentFragment = buildHorizontalAlignment(attributes[key]);
          paragraphPropertiesFragment.import(horizontalAlignmentFragment);
          // Delete used property
          // eslint-disable-next-line no-param-reassign
          delete attributes.textAlign;
          break;
      }
    });
  }
  paragraphPropertiesFragment.up();

  return paragraphPropertiesFragment;
};

const computeImageDimensions = (vNode, attributes) => {
  const { maximumWidth, originalWidth, originalHeight } = attributes;
  const aspectRatio = originalWidth / originalHeight;
  const maximumWidthInEMU = TWIPToEMU(maximumWidth);
  let originalWidthInEMU = pixelsToEMU(originalWidth);
  let originalHeightInEMU = pixelsToEMU(originalHeight);
  if (originalWidthInEMU > maximumWidthInEMU) {
    originalWidthInEMU = maximumWidthInEMU;
    originalHeightInEMU = Math.round(originalWidthInEMU / aspectRatio);
  }
  let modifiedHeight;
  let modifiedWidth;

  if (vNode.properties && vNode.properties.style) {
    if (vNode.properties.style.width) {
      if (vNode.properties.style.width !== 'auto') {
        if (pixelRegex.test(vNode.properties.style.width)) {
          modifiedWidth = pixelsToEMU(vNode.properties.style.width.match(pixelRegex)[1]);
        } else if (percentageRegex.test(vNode.properties.style.width)) {
          const percentageValue = vNode.properties.style.width.match(percentageRegex)[1];

          modifiedWidth = Math.round((percentageValue / 100) * originalWidthInEMU);
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (vNode.properties.style.height && vNode.properties.style.height === 'auto') {
          modifiedWidth = originalWidthInEMU;
          modifiedHeight = originalHeightInEMU;
        }
      }
    }
    if (vNode.properties.style.height) {
      if (vNode.properties.style.height !== 'auto') {
        if (pixelRegex.test(vNode.properties.style.height)) {
          modifiedHeight = pixelsToEMU(vNode.properties.style.height.match(pixelRegex)[1]);
        } else if (percentageRegex.test(vNode.properties.style.height)) {
          const percentageValue = vNode.properties.style.width.match(percentageRegex)[1];

          modifiedHeight = Math.round((percentageValue / 100) * originalHeightInEMU);
          if (!modifiedWidth) {
            modifiedWidth = Math.round(modifiedHeight * aspectRatio);
          }
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (modifiedWidth) {
          if (!modifiedHeight) {
            modifiedHeight = Math.round(modifiedWidth / aspectRatio);
          }
        } else {
          modifiedHeight = originalHeightInEMU;
          modifiedWidth = originalWidthInEMU;
        }
      }
    }
    if (modifiedWidth && !modifiedHeight) {
      modifiedHeight = Math.round(modifiedWidth / aspectRatio);
    } else if (modifiedHeight && !modifiedWidth) {
      modifiedWidth = Math.round(modifiedHeight * aspectRatio);
    }
  } else {
    modifiedWidth = originalWidthInEMU;
    modifiedHeight = originalHeightInEMU;
  }

  // eslint-disable-next-line no-param-reassign
  attributes.width = modifiedWidth;
  // eslint-disable-next-line no-param-reassign
  attributes.height = modifiedHeight;
};

const buildParagraph = (vNode, attributes, docxDocumentInstance) => {
  const paragraphFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'p');
  const modifiedAttributes = { ...attributes };
  if (isVNode(vNode) && vNode.properties && vNode.properties.style) {
    if (
      vNode.properties.style.color &&
      !['transparent', 'auto'].includes(vNode.properties.style.color)
    ) {
      modifiedAttributes.color = fixupColorCode(vNode.properties.style.color);
    }
    if (
      vNode.properties.style['background-color'] &&
      !['transparent', 'auto'].includes(vNode.properties.style['background-color'])
    ) {
      modifiedAttributes.backgroundColor = fixupColorCode(
        vNode.properties.style['background-color']
      );
    }
    if (vNode.properties.style['vertical-align']) {
      modifiedAttributes.verticalAlign = vNode.properties.style['vertical-align'];
    }
    if (vNode.properties.style['text-align']) {
      modifiedAttributes.textAlign = vNode.properties.style['text-align'];
    }
  }
  const paragraphPropertiesFragment = buildParagraphProperties(modifiedAttributes);
  paragraphFragment.import(paragraphPropertiesFragment);
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      const runOrHyperlinkFragments = buildRunOrHyperLink(
        childVNode,
        modifiedAttributes,
        docxDocumentInstance
      );
      if (Array.isArray(runOrHyperlinkFragments)) {
        for (
          let iteratorIndex = 0;
          iteratorIndex < runOrHyperlinkFragments.length;
          iteratorIndex++
        ) {
          const runOrHyperlinkFragment = runOrHyperlinkFragments[iteratorIndex];

          paragraphFragment.import(runOrHyperlinkFragment);
        }
      } else {
        paragraphFragment.import(runOrHyperlinkFragments);
      }
    }
  } else {
    // In case paragraphs has to be rendered where vText is present. Eg. table-cell
    // Or in case the vNode is something like img
    if (isVNode(vNode) && vNode.tagName === 'img') {
      computeImageDimensions(vNode, modifiedAttributes);
    }
    const runFragments = buildRunOrRuns(vNode, modifiedAttributes);
    if (Array.isArray(runFragments)) {
      for (let index = 0; index < runFragments.length; index++) {
        const runFragment = runFragments[index];

        paragraphFragment.import(runFragment);
      }
    } else {
      paragraphFragment.import(runFragments);
    }
  }
  paragraphFragment.up();

  return paragraphFragment;
};

const buildTableCellProperties = (attributes) => {
  const tableCellPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tcPr');
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      // eslint-disable-next-line default-case
      switch (key) {
        case 'backgroundColor':
          const shadingFragment = buildShading(attributes[key]);
          tableCellPropertiesFragment.import(shadingFragment);
          // Delete used property
          // eslint-disable-next-line no-param-reassign
          delete attributes.backgroundColor;
          break;
        case 'verticalAlign':
          const verticalAlignmentFragment = buildVerticalAlignment(attributes[key]);
          tableCellPropertiesFragment.import(verticalAlignmentFragment);
          // Delete used property
          // eslint-disable-next-line no-param-reassign
          delete attributes.verticalAlign;
          break;
      }
    });
  }
  tableCellPropertiesFragment.up();

  return tableCellPropertiesFragment;
};

const buildTableCell = (vNode) => {
  const tableCellFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tc');
  const attributes = {};
  if (isVNode(vNode) && vNode.properties && vNode.properties.style) {
    if (
      vNode.properties.style.color &&
      !['transparent', 'auto'].includes(vNode.properties.style.color)
    ) {
      attributes.color = fixupColorCode(vNode.properties.style.color);
    }
    if (
      vNode.properties.style['background-color'] &&
      !['transparent', 'auto'].includes(vNode.properties.style['background-color'])
    ) {
      attributes.backgroundColor = fixupColorCode(vNode.properties.style['background-color']);
    }
    if (vNode.properties.style['vertical-align']) {
      attributes.verticalAlign = vNode.properties.style['vertical-align'];
    }
  }
  const tableCellPropertiesFragment = buildTableCellProperties(attributes);
  tableCellFragment.import(tableCellPropertiesFragment);
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      const paragraphFragment = buildParagraph(childVNode, attributes);
      tableCellFragment.import(paragraphFragment);
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
    const gridWidth = attributes.maximumWidth / gridColumns.length;

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

const buildTableWidth = (tableWidth) => {
  const tableWidthFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  })
    .ele('@w', 'tblW')
    .att('@w', 'type', 'dxa')
    .att('@w', 'w', String(tableWidth))
    .up();

  return tableWidthFragment;
};

const buildTableProperties = (attributes) => {
  const tablePropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tblPr');

  const tableWidthFragment = buildTableWidth(attributes.maximumWidth);
  tablePropertiesFragment.import(tableWidthFragment);
  const tableBordersFragment = buildTableBorders();
  tablePropertiesFragment.import(tableBordersFragment);

  tablePropertiesFragment.up();

  return tablePropertiesFragment;
};

const buildTable = (vNode, attributes) => {
  const tableFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tbl');
  const tablePropertiesFragment = buildTableProperties(attributes);
  tableFragment.import(tablePropertiesFragment);
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      if (childVNode.tagName === 'colgroup') {
        const tableGridFragment = buildTableGrid(childVNode, attributes);
        tableFragment.import(tableGridFragment);
      } else if (childVNode.tagName === 'tbody') {
        for (let iteratorIndex = 0; iteratorIndex < childVNode.children.length; iteratorIndex++) {
          const grandChildVNode = childVNode.children[iteratorIndex];
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

const buildPresetGeometry = () => {
  const presetGeometryFragment = fragment({
    namespaceAlias: { a: namespaces.a },
  })
    .ele('@a', 'prstGeom')
    .att('prst', 'rect')
    .up();

  return presetGeometryFragment;
};

const buildExtents = ({ width, height }) => {
  const extentsFragment = fragment({
    namespaceAlias: { a: namespaces.a },
  })
    .ele('@a', 'ext')
    .att('cx', width)
    .att('cy', height)
    .up();

  return extentsFragment;
};

const buildOffset = () => {
  const offsetFragment = fragment({
    namespaceAlias: { a: namespaces.a },
  })
    .ele('@a', 'off')
    .att('x', '0')
    .att('y', '0')
    .up();

  return offsetFragment;
};

const buildGraphicFrameTransform = (attributes) => {
  const graphicFrameTransformFragment = fragment({
    namespaceAlias: { a: namespaces.a },
  }).ele('@a', 'xfrm');

  const offsetFragment = buildOffset();
  graphicFrameTransformFragment.import(offsetFragment);
  const extentsFragment = buildExtents(attributes);
  graphicFrameTransformFragment.import(extentsFragment);

  graphicFrameTransformFragment.up();

  return graphicFrameTransformFragment;
};

const buildShapeProperties = (attributes) => {
  const shapeProperties = fragment({
    namespaceAlias: { pic: namespaces.pic },
  }).ele('@pic', 'spPr');

  const graphicFrameTransformFragment = buildGraphicFrameTransform(attributes);
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

const buildPicture = ({
  id,
  fileNameWithExtension,
  description,
  relationshipId,
  width,
  height,
}) => {
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
  const shapeProperties = buildShapeProperties({ width, height });
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

const buildExtent = ({ width, height }) => {
  const extentFragment = fragment({
    namespaceAlias: { wp: namespaces.wp },
  })
    .ele('@wp', 'extent')
    .att('cx', width)
    .att('cy', height)
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
  const extentFragment = buildExtent({ width: attributes.width, height: attributes.height });
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

const buildDrawing = (inlineOrAnchored = false, graphicType, attributes) => {
  const drawingFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'drawing');
  const inlineOrAnchoredDrawingFragment = inlineOrAnchored
    ? buildInlineDrawing(graphicType, attributes)
    : buildAnchoredDrawing(graphicType, attributes);
  drawingFragment.import(inlineOrAnchoredDrawingFragment);
  drawingFragment.up();

  return drawingFragment;
};

export {
  buildParagraph,
  buildTable,
  buildNumberingInstances,
  buildLineBreak,
  buildIndentation,
  buildTextElement,
  buildBold,
  buildItalics,
  buildUnderline,
  buildDrawing,
};
