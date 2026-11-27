/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
/* eslint-disable no-param-reassign */
/* eslint-disable no-case-declarations */
/* eslint-disable no-plusplus */
/* eslint-disable no-else-return */
import { fragment } from 'xmlbuilder2';
import cloneDeep from 'lodash/cloneDeep.js';
import imageToBase64 from 'image-to-base64';
import mimeTypes from 'mime-types';
import sizeOf from 'image-size';
import namespaces from '../../namespaces';
import { pixelToEMU, pixelRegex, TWIPToEMU, percentageRegex } from '../../utils/unit-conversion';
import { paragraphBordersObject } from '../../constants';
import { vNodeHasChildren } from '../../utils/vnode';
import { isValidUrl } from '../../utils/url';
import { attr } from '../../utils/xml';
import type DocxDocument from '../../docx-document';
import { isVNode, asVNode, warnImageSkipped } from './shared';
import type { VTree, VNodeType, BuilderAttributes } from './shared';
import { buildShading, buildBorder, modifiedStyleAttributesBuilder } from './formatting';
import { buildRun, buildRunOrRuns, buildRunOrHyperLink } from './run';

export const buildNumberingProperties = (levelId: number, numberingId: number) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'numPr')
    .ele('@w', 'ilvl')
    .att('@w', 'val', attr(String(levelId)))
    .up()
    .ele('@w', 'numId')
    .att('@w', 'val', attr(String(numberingId)))
    .up()
    .up();

export const buildNumberingInstances = () =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'num')
    .ele('@w', 'abstractNumId')
    .up()
    .up();

export const buildSpacing = (
  lineSpacing: number | null | undefined,
  beforeSpacing: number | null | undefined,
  afterSpacing: number | null | undefined,
) => {
  const spacingFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'spacing');

  if (typeof lineSpacing === 'number' && lineSpacing >= 0) {
    spacingFragment.att('@w', 'line', attr(lineSpacing));
  }
  if (typeof beforeSpacing === 'number' && beforeSpacing >= 0) {
    spacingFragment.att('@w', 'before', attr(beforeSpacing));
  }
  if (typeof afterSpacing === 'number' && afterSpacing >= 0) {
    spacingFragment.att('@w', 'after', attr(afterSpacing));
  }

  spacingFragment.att('@w', 'lineRule', attr('auto')).up();

  return spacingFragment;
};

export const buildIndentation = ({ left, right }: { left?: number; right?: number }) => {
  const indentationFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'ind');

  if (left) {
    indentationFragment.att('@w', 'left', attr(left));
  }
  if (right) {
    indentationFragment.att('@w', 'right', attr(right));
  }

  indentationFragment.up();

  return indentationFragment;
};

export const buildPStyle = (style = 'Normal') =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'pStyle')
    .att('@w', 'val', attr(style))
    .up();

export const buildHorizontalAlignment = (horizontalAlignment: string) => {
  if (horizontalAlignment === 'justify') {
    horizontalAlignment = 'both';
  }
  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'jc')
    .att('@w', 'val', attr(horizontalAlignment))
    .up();
};

export const buildParagraphBorder = () => {
  const paragraphBorderFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'pBdr',
  );
  const bordersObject: Record<string, { size: number; spacing: number; color: string }> =
    cloneDeep(paragraphBordersObject);

  Object.keys(bordersObject).forEach((borderName) => {
    if (bordersObject[borderName]) {
      const { size, spacing, color } = bordersObject[borderName]!;

      const borderFragment = buildBorder(borderName, size, spacing, color);
      paragraphBorderFragment.import(borderFragment);
    }
  });

  paragraphBorderFragment.up();

  return paragraphBorderFragment;
};

export const buildParagraphProperties = (attributes: BuilderAttributes) => {
  const paragraphPropertiesFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'pPr',
  );
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      switch (key) {
        case 'numbering':
          const { levelId, numberingId } = attributes[key]!;
          const numberingPropertiesFragment = buildNumberingProperties(levelId, numberingId);
          paragraphPropertiesFragment.import(numberingPropertiesFragment);
          // eslint-disable-next-line no-param-reassign
          delete attributes.numbering;
          break;
        case 'textAlign':
          const horizontalAlignmentFragment = buildHorizontalAlignment(attributes[key]!);
          paragraphPropertiesFragment.import(horizontalAlignmentFragment);
          // eslint-disable-next-line no-param-reassign
          delete attributes.textAlign;
          break;
        case 'backgroundColor':
          // Add shading to Paragraph Properties only if display is block
          // Essentially if background color needs to be across the row
          if (attributes.display === 'block') {
            const shadingFragment = buildShading(attributes[key]!);
            paragraphPropertiesFragment.import(shadingFragment);
            // FIXME: Inner padding in case of shaded paragraphs.
            const paragraphBorderFragment = buildParagraphBorder();
            paragraphPropertiesFragment.import(paragraphBorderFragment);
            // eslint-disable-next-line no-param-reassign
            delete attributes.backgroundColor;
          }
          break;
        case 'paragraphStyle':
          const pStyleFragment = buildPStyle(attributes.paragraphStyle);
          paragraphPropertiesFragment.import(pStyleFragment);
          delete attributes.paragraphStyle;
          break;
        case 'indentation':
          const indentationFragment = buildIndentation(attributes[key]!);
          paragraphPropertiesFragment.import(indentationFragment);
          // eslint-disable-next-line no-param-reassign
          delete attributes.indentation;
          break;
      }
    });

    const spacingFragment = buildSpacing(
      attributes.lineHeight,
      attributes.beforeSpacing,
      attributes.afterSpacing,
    );
    // eslint-disable-next-line no-param-reassign
    delete attributes.lineHeight;
    // eslint-disable-next-line no-param-reassign
    delete attributes.beforeSpacing;
    // eslint-disable-next-line no-param-reassign
    delete attributes.afterSpacing;

    paragraphPropertiesFragment.import(spacingFragment);
  }
  paragraphPropertiesFragment.up();

  return paragraphPropertiesFragment;
};

export const calculateAbsoluteValues = (attribute: string, originalAttributeInEMU: number) => {
  if (attribute !== 'auto') {
    if (pixelRegex.test(attribute)) {
      return pixelToEMU(Number(attribute.match(pixelRegex)![1]));
    } else if (percentageRegex.test(attribute)) {
      const percentageValue = attribute.match(percentageRegex)![1];
      return Math.round((Number(percentageValue) / 100) * originalAttributeInEMU);
    }
  }
  return originalAttributeInEMU;
};

export const computeImageDimensions = (vNode: VNodeType, attributes: BuilderAttributes) => {
  const { maximumWidth, originalWidth, originalHeight } = attributes;
  const aspectRatio = originalWidth! / originalHeight!;
  const maximumWidthInEMU = TWIPToEMU(maximumWidth!);
  let originalWidthInEMU = pixelToEMU(originalWidth!);
  let originalHeightInEMU = pixelToEMU(originalHeight!);
  if (originalWidthInEMU > maximumWidthInEMU) {
    originalWidthInEMU = maximumWidthInEMU;
    originalHeightInEMU = Math.round(originalWidthInEMU / aspectRatio);
  }
  let modifiedHeight;
  let modifiedWidth;
  let modifiedMaxHeight;
  let modifiedMaxWidth;

  if (vNode?.properties?.style) {
    const styleWidth = vNode.properties.style.width;
    const styleHeight = vNode.properties.style.height;
    const styleMaxWidth = vNode.properties.style['max-width'];
    const styleMaxHeight = vNode.properties.style['max-height'];

    // style - width
    if (styleWidth) {
      modifiedWidth = calculateAbsoluteValues(styleWidth, originalWidthInEMU);
      if (styleWidth === 'auto' && styleHeight === 'auto') {
        modifiedHeight = originalHeightInEMU;
      }
    }

    // style - height
    if (styleHeight) {
      modifiedHeight = calculateAbsoluteValues(styleHeight, originalHeightInEMU);

      if (styleHeight !== 'auto') {
        if (percentageRegex.test(styleHeight)) {
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
          modifiedWidth = originalWidthInEMU;
        }
      }
    }

    // style - max width
    if (styleMaxWidth) {
      modifiedMaxWidth = calculateAbsoluteValues(styleMaxWidth, originalWidthInEMU);
      if (modifiedWidth) {
        modifiedWidth = modifiedWidth > modifiedMaxWidth ? modifiedMaxWidth : modifiedWidth;
      } else {
        modifiedWidth = modifiedMaxWidth;
      }
    }

    // style - max height
    if (styleMaxHeight) {
      modifiedMaxHeight = calculateAbsoluteValues(styleMaxHeight, originalHeightInEMU);
      if (modifiedHeight) {
        modifiedHeight = modifiedHeight > modifiedMaxHeight ? modifiedMaxHeight : modifiedHeight;
      } else {
        modifiedHeight = modifiedMaxHeight;
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

export const buildParagraph = async (
  vNode: VTree | null,
  attributes: BuilderAttributes,
  docxDocumentInstance: DocxDocument,
) => {
  const paragraphFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'p');
  const modifiedAttributes = modifiedStyleAttributesBuilder(
    docxDocumentInstance,
    vNode,
    attributes,
    {
      isParagraph: true,
    },
  );
  const paragraphPropertiesFragment = buildParagraphProperties(modifiedAttributes);
  paragraphFragment.import(paragraphPropertiesFragment);
  if (isVNode(vNode) && vNodeHasChildren(vNode)) {
    if (
      [
        'span',
        'strong',
        'b',
        'em',
        'i',
        'u',
        'ins',
        'strike',
        'del',
        's',
        'sub',
        'sup',
        'mark',
        'a',
        'code',
        'pre',
      ].includes(vNode.tagName)
    ) {
      const runOrHyperlinkFragments = await buildRunOrHyperLink(
        vNode,
        modifiedAttributes,
        docxDocumentInstance,
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
    } else if (vNode.tagName === 'blockquote') {
      // FIXME: docxDocumentInstance is not passed here, so a blockquote with an
      // inline font-family crashes on createFont. Kept as-is to preserve behaviour.
      const runFragmentOrFragments = await buildRun(
        vNode,
        attributes,
        undefined as unknown as DocxDocument,
      );
      if (Array.isArray(runFragmentOrFragments)) {
        for (let index = 0; index < runFragmentOrFragments.length; index++) {
          paragraphFragment.import(runFragmentOrFragments[index]);
        }
      } else {
        paragraphFragment.import(runFragmentOrFragments);
      }
    } else {
      for (let index = 0; index < vNode.children.length; index++) {
        const childVNode = vNode.children[index]!;
        if (asVNode(childVNode).tagName === 'img') {
          let base64String: string | void;
          const imageSource = asVNode(childVNode).properties.src;
          if (isValidUrl(imageSource)) {
            base64String = await imageToBase64(imageSource).catch(warnImageSkipped);

            if (base64String && mimeTypes.lookup(imageSource)) {
              asVNode(childVNode).properties.src = `data:${mimeTypes.lookup(
                imageSource,
              )};base64, ${base64String}`;
            } else {
              break;
            }
          } else {
            // eslint-disable-next-line no-useless-escape, prefer-destructuring
            base64String = imageSource.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)![2];
          }
          const imageBuffer = Buffer.from(decodeURIComponent(base64String as string), 'base64');
          const imageProperties = sizeOf(imageBuffer);

          modifiedAttributes.maximumWidth =
            modifiedAttributes.maximumWidth || docxDocumentInstance.availableDocumentSpace;
          modifiedAttributes.originalWidth = imageProperties.width;
          modifiedAttributes.originalHeight = imageProperties.height;

          computeImageDimensions(asVNode(childVNode), modifiedAttributes);
        }
        const runOrHyperlinkFragments = await buildRunOrHyperLink(
          childVNode,
          isVNode(childVNode) && childVNode.tagName === 'img'
            ? { ...modifiedAttributes, type: 'picture', description: childVNode.properties.alt }
            : modifiedAttributes,
          docxDocumentInstance,
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
    }
  } else {
    // In case paragraphs has to be rendered where vText is present. Eg. table-cell
    // Or in case the vNode is something like img
    if (isVNode(vNode) && vNode.tagName === 'img') {
      const imageSource = vNode.properties.src;
      let base64String = imageSource;
      if (isValidUrl(imageSource)) {
        base64String = await imageToBase64(imageSource).catch(warnImageSkipped);

        if (base64String && mimeTypes.lookup(imageSource)) {
          vNode.properties.src = `data:${mimeTypes.lookup(imageSource)};base64, ${base64String}`;
        } else {
          paragraphFragment.up();

          return paragraphFragment;
        }
      } else {
        // eslint-disable-next-line no-useless-escape, prefer-destructuring
        base64String = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)[2];
      }

      const imageBuffer = Buffer.from(decodeURIComponent(base64String), 'base64');
      const imageProperties = sizeOf(imageBuffer);

      modifiedAttributes.maximumWidth =
        modifiedAttributes.maximumWidth || docxDocumentInstance.availableDocumentSpace;
      modifiedAttributes.originalWidth = imageProperties.width;
      modifiedAttributes.originalHeight = imageProperties.height;

      computeImageDimensions(vNode, modifiedAttributes);
    }
    const runFragments = await buildRunOrRuns(vNode, modifiedAttributes, docxDocumentInstance);
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
