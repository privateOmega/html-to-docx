/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
/* eslint-disable no-param-reassign */
/* eslint-disable no-case-declarations */
/* eslint-disable no-plusplus */
/* eslint-disable no-else-return */
import { fragment } from 'xmlbuilder2';
import namespaces from '../../namespaces';
import { defaultFont, colorlessColors, verticalAlignValues } from '../../constants';
import { attr } from '../../utils/xml';
import type DocxDocument from '../../docx-document';
import { isVNode } from './shared';
import type { VTree, BuilderAttributes } from './shared';
import { fixupColorCode, fixupLineHeight, fixupFontSize, fixupMargin } from './fixups';

// The same font for every script: ASCII, other Latin/Greek/Cyrillic (hAnsi),
// East Asian and complex scripts. Otherwise e.g. accented letters and CJK
// text fall back to another font.
export const buildRunFontFragment = (fontName = defaultFont) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'rFonts')
    .att('@w', 'ascii', attr(fontName))
    .att('@w', 'hAnsi', attr(fontName))
    .att('@w', 'eastAsia', attr(fontName))
    .att('@w', 'cs', attr(fontName))
    .up();

export const buildRunStyleFragment = (type = 'Hyperlink') =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'rStyle')
    .att('@w', 'val', attr(type))
    .up();

export const buildColor = (colorCode: string) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'color')
    .att('@w', 'val', attr(colorCode))
    .up();

export const buildFontSize = (fontSize: number) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'sz')
    .att('@w', 'val', attr(fontSize))
    .up();

export const buildShading = (colorCode: string) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'shd')
    .att('@w', 'val', attr('clear'))
    .att('@w', 'fill', attr(colorCode))
    .up();

export const buildHighlight = (color = 'yellow') =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'highlight')
    .att('@w', 'val', attr(color))
    .up();

export const buildVertAlign = (type = 'baseline') =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'vertAlign')
    .att('@w', 'val', attr(type))
    .up();

export const buildStrike = () =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'strike')
    .att('@w', 'val', attr(true))
    .up();

export const buildBold = () =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'b')
    .up();

export const buildItalics = () =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'i')
    .up();

export const buildUnderline = (type = 'single') =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'u')
    .att('@w', 'val', attr(type))
    .up();

export const buildLineBreak = (type = 'textWrapping') =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'br')
    .att('@w', 'type', attr(type))
    .up();

export const buildBorder = (
  borderSide = 'top',
  borderSize: number | string = 0,
  borderSpacing = 0,
  borderColor: string | undefined = fixupColorCode('black'),
  borderStroke: string | undefined = 'single',
) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', borderSide)
    .att('@w', 'val', attr(borderStroke))
    .att('@w', 'sz', attr(borderSize))
    .att('@w', 'space', attr(borderSpacing))
    .att('@w', 'color', attr(borderColor))
    .up();

export const buildTextElement = (text: string) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 't')
    .att('@xml', 'space', attr('preserve'))
    .txt(text)
    .up();

export const modifiedStyleAttributesBuilder = (
  docxDocumentInstance: DocxDocument,
  vNode: VTree | null,
  attributes: BuilderAttributes,
  options?: BuilderAttributes,
) => {
  const modifiedAttributes: BuilderAttributes = { ...attributes };

  // styles
  if (isVNode(vNode) && vNode.properties && vNode.properties.style) {
    if (vNode.properties.style.color && !colorlessColors.includes(vNode.properties.style.color)) {
      modifiedAttributes.color = fixupColorCode(vNode.properties.style.color);
    }

    if (
      vNode.properties.style['background-color'] &&
      !colorlessColors.includes(vNode.properties.style['background-color'])
    ) {
      modifiedAttributes.backgroundColor = fixupColorCode(
        vNode.properties.style['background-color'],
      );
    }

    if (
      vNode.properties.style['vertical-align'] &&
      verticalAlignValues.includes(vNode.properties.style['vertical-align'])
    ) {
      modifiedAttributes.verticalAlign = vNode.properties.style['vertical-align'];
    }

    if (
      vNode.properties.style['text-align'] &&
      ['left', 'right', 'center', 'justify'].includes(vNode.properties.style['text-align'])
    ) {
      modifiedAttributes.textAlign = vNode.properties.style['text-align'];
    }

    // FIXME: remove bold check when other font weights are handled.
    if (vNode.properties.style['font-weight'] && vNode.properties.style['font-weight'] === 'bold') {
      modifiedAttributes.strong = vNode.properties.style['font-weight'];
    }
    if (vNode.properties.style['font-family']) {
      modifiedAttributes.font = docxDocumentInstance.createFont(
        vNode.properties.style['font-family'],
      );
    }
    if (vNode.properties.style['font-size']) {
      modifiedAttributes.fontSize = fixupFontSize(vNode.properties.style['font-size']);
    }
    if (vNode.properties.style['line-height']) {
      modifiedAttributes.lineHeight = fixupLineHeight(
        vNode.properties.style['line-height'],
        vNode.properties.style['font-size']
          ? fixupFontSize(vNode.properties.style['font-size'])
          : null,
      );
    }
    if (vNode.properties.style['margin-left'] || vNode.properties.style['margin-right']) {
      const leftMargin = fixupMargin(vNode.properties.style['margin-left']);
      const rightMargin = fixupMargin(vNode.properties.style['margin-right']);
      const indentation: { left?: number; right?: number } = {};
      if (leftMargin) {
        indentation.left = leftMargin;
      }
      if (rightMargin) {
        indentation.right = rightMargin;
      }
      if (leftMargin || rightMargin) {
        modifiedAttributes.indentation = indentation;
      }
    }

    // list elements might have margin-bottom style and happens in list where a p node exist for each list item
    // copy the margin-bottom (if applicable) to the afterSpacing attribute
    if (vNode.tagName === 'p' && vNode.properties.style['margin-bottom']) {
      modifiedAttributes.afterSpacing = fixupMargin(vNode.properties.style['margin-bottom']);
    }

    if (vNode.properties.style.display) {
      modifiedAttributes.display = vNode.properties.style.display;
    }

    if (vNode.properties.style.width) {
      modifiedAttributes.width = vNode.properties.style.width;
    }
  }

  // paragraph only
  if (options && options.isParagraph) {
    if (isVNode(vNode) && vNode.tagName === 'blockquote') {
      modifiedAttributes.indentation = { left: 284 };
      modifiedAttributes.textAlign = 'justify';
    } else if (isVNode(vNode) && vNode.tagName === 'code') {
      modifiedAttributes.highlightColor = 'lightGray';
    } else if (isVNode(vNode) && vNode.tagName === 'pre') {
      modifiedAttributes.font = 'Courier';
    }
  }

  return modifiedAttributes;
};

// html tag to formatting function
// options are passed to the formatting function if needed
export const buildFormatting = (htmlTag: string, options?: BuilderAttributes) => {
  switch (htmlTag) {
    case 'strong':
    case 'b':
      return buildBold();
    case 'em':
    case 'i':
      return buildItalics();
    case 'ins':
    case 'u':
      return buildUnderline();
    case 'strike':
    case 'del':
    case 's':
      return buildStrike();
    case 'sub':
      return buildVertAlign('subscript');
    case 'sup':
      return buildVertAlign('superscript');
    case 'mark':
      return buildHighlight();
    case 'code':
      return buildHighlight('lightGray');
    case 'highlightColor':
      return buildHighlight(options && options.color ? options.color : 'lightGray');
    case 'font':
      return buildRunFontFragment(options!.font);
    case 'pre':
      return buildRunFontFragment('Courier');
    case 'color':
      return buildColor(options && options.color ? options.color : 'black');
    case 'backgroundColor':
      return buildShading(options && options.color ? options.color : 'black');
    case 'fontSize':
      // does this need a unit of measure?
      return buildFontSize(options && options.fontSize ? options.fontSize : 10);
    case 'hyperlink':
      return buildRunStyleFragment('Hyperlink');
  }

  return null;
};

export const buildRunProperties = (attributes: BuilderAttributes) => {
  const runPropertiesFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'rPr');
  // A property element may appear only once in <w:rPr>; when several
  // attributes map to the same element (e.g. <pre> and the Courier font set
  // for it), the first one wins.
  const emitted = new Set<string>();
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      const options: BuilderAttributes = {};
      if (key === 'color' || key === 'backgroundColor' || key === 'highlightColor') {
        options.color = attributes[key] as string;
      }

      if (key === 'fontSize' || key === 'font') {
        (options as Record<string, unknown>)[key] = attributes[key];
      }

      const formattingFragment = buildFormatting(key, options);
      if (formattingFragment) {
        const element = (formattingFragment.first().node as unknown as Element).nodeName;
        if (!emitted.has(element)) {
          emitted.add(element);
          runPropertiesFragment.import(formattingFragment);
        }
      }
    });
  }
  runPropertiesFragment.up();

  return runPropertiesFragment;
};
