/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
/* eslint-disable no-param-reassign */
/* eslint-disable no-case-declarations */
/* eslint-disable no-plusplus */
/* eslint-disable no-else-return */
import { fragment } from 'xmlbuilder2';
import { fetchImageAsDataUri, measureImage } from '../../utils/image';
import namespaces from '../../namespaces';
import { paragraphBordersObject } from '../../constants';
import { vNodeHasChildren } from '../../utils/vnode';
import { base64DataUriPayload, isValidUrl } from '../../utils/url';
import { attr } from '../../utils/xml';
import type DocxDocument from '../../docx-document';
import { isVNode, asVNode, unsupportedImageSource, warnImageSkipped } from './shared';
import type { VTree, BuilderAttributes } from './shared';
import { buildShading, buildBorder, modifiedStyleAttributesBuilder } from './formatting';
import { buildRun, buildRunOrRuns, buildRunOrHyperLink } from './run';
import { computeImageDimensions } from './image';
import { base64ToBytes } from '../../utils/base64';

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
    structuredClone(paragraphBordersObject);

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
      const runFragmentOrFragments = await buildRun(vNode, attributes, docxDocumentInstance);
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
            const dataUri = await fetchImageAsDataUri(imageSource).catch(warnImageSkipped);

            if (dataUri) {
              asVNode(childVNode).properties.src = dataUri;
              base64String = dataUri.slice(dataUri.indexOf(',') + 1);
            } else {
              // Skip this image but keep the rest of the paragraph.
              continue;
            }
          } else {
            const payload = base64DataUriPayload(imageSource);
            if (!payload) {
              warnImageSkipped(unsupportedImageSource(imageSource));
              // Skip this image but keep the rest of the paragraph.
              continue;
            }
            base64String = payload;
          }
          const imageProperties = measureImage(
            base64ToBytes(decodeURIComponent(base64String as string)),
          );
          if (!imageProperties) {
            warnImageSkipped(`unsupported image data (${imageSource})`);
            continue;
          }

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
        const dataUri = await fetchImageAsDataUri(imageSource).catch(warnImageSkipped);

        if (dataUri) {
          vNode.properties.src = dataUri;
          base64String = dataUri.slice(dataUri.indexOf(',') + 1);
        } else {
          paragraphFragment.up();

          return paragraphFragment;
        }
      } else {
        const payload = base64DataUriPayload(imageSource);
        if (!payload) {
          // Same as a failed download: an empty paragraph without the image.
          warnImageSkipped(unsupportedImageSource(imageSource));
          paragraphFragment.up();

          return paragraphFragment;
        }
        base64String = payload;
      }

      const imageProperties = measureImage(base64ToBytes(decodeURIComponent(base64String)));
      if (!imageProperties) {
        // Same as a failed download: an empty paragraph without the image.
        warnImageSkipped(`unsupported image data (${imageSource})`);
        paragraphFragment.up();

        return paragraphFragment;
      }

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
