/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
/* eslint-disable no-param-reassign */
/* eslint-disable no-case-declarations */
/* eslint-disable no-plusplus */
/* eslint-disable no-else-return */
import { fragment } from 'xmlbuilder2';
import namespaces from '../../namespaces';
import { hyperlinkType, imageType, internalRelationship } from '../../constants';
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import type DocxDocument from '../../docx-document';
import { isVNode, isVText } from './shared';
import type { VTree, VNodeType, BuilderAttributes } from './shared';
import {
  buildLineBreak,
  buildTextElement,
  modifiedStyleAttributesBuilder,
  buildRunProperties,
} from './formatting';
import { buildDrawing } from './drawing';
import { base64ToBytes } from '../../utils/base64';

// Inline elements that add run formatting (see buildFormatting): strong/b,
// em/i, u/ins, s/del/strike, sub/sup, mark, code and pre.
const formattingTags = new Set([
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
  'code',
  'pre',
]);

// A single run: text, an image or a line break.
const buildLeafRun = async (
  vNode: VTree | null,
  attributes: BuilderAttributes,
  docxDocumentInstance: DocxDocument,
): Promise<XMLBuilder> => {
  const runFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'r');
  const runPropertiesFragment = buildRunProperties(structuredClone(attributes));

  runFragment.import(runPropertiesFragment);
  if (isVText(vNode)) {
    const textFragment = buildTextElement(vNode.text);
    runFragment.import(textFragment);
  } else if (attributes && attributes.type === 'picture') {
    let response = null;

    const base64Uri = decodeURIComponent((vNode as VNodeType).properties.src);
    if (base64Uri) {
      response = docxDocumentInstance.createMediaFile(base64Uri);
    }

    if (response) {
      docxDocumentInstance.zip
        .folder('word')!
        .folder('media')!
        .file(response.fileNameWithExtension, base64ToBytes(response.fileContent), {
          createFolders: false,
        });

      const documentRelsId = docxDocumentInstance.createDocumentRelationships(
        docxDocumentInstance.relationshipFilename,
        imageType,
        `media/${response.fileNameWithExtension}`,
        internalRelationship,
      );

      attributes.inlineOrAnchored = true;
      attributes.relationshipId = documentRelsId;
      attributes.id = response.id;
      attributes.fileContent = response.fileContent;
      attributes.fileNameWithExtension = response.fileNameWithExtension;
    }

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

const buildHyperlink = async (
  vNode: VNodeType,
  attributes: BuilderAttributes,
  docxDocumentInstance: DocxDocument,
): Promise<XMLBuilder> => {
  const relationshipId = docxDocumentInstance.createDocumentRelationships(
    docxDocumentInstance.relationshipFilename,
    hyperlinkType,
    vNode.properties && vNode.properties.href ? vNode.properties.href : '',
  );
  const hyperlinkFragment = fragment({ namespaceAlias: { w: namespaces.w, r: namespaces.r } })
    .ele('@w', 'hyperlink')
    .att('@r', 'id', `rId${relationshipId}`);

  const linkAttributes = { ...attributes, hyperlink: true };
  for (const childVNode of vNode.children) {
    // eslint-disable-next-line no-use-before-define
    for (const runFragment of await buildInlineRuns(
      childVNode,
      linkAttributes,
      docxDocumentInstance,
    )) {
      hyperlinkFragment.import(runFragment);
    }
  }
  hyperlinkFragment.up();

  return hyperlinkFragment;
};

/**
 * The runs (and hyperlinks) for an inline node and everything inside it.
 * Each element passes its formatting and inline styles on to its own
 * descendants only, so `<b>a<i>b</i>c</b>d` gives bold a, bold italic b,
 * bold c and plain d.
 */
const buildInlineRuns = async (
  vNode: VTree | null,
  attributes: BuilderAttributes,
  docxDocumentInstance: DocxDocument,
): Promise<XMLBuilder[]> => {
  if (
    !isVNode(vNode) ||
    vNode.tagName === 'br' ||
    vNode.tagName === 'img' ||
    attributes.type === 'picture'
  ) {
    return [await buildLeafRun(vNode, attributes, docxDocumentInstance)];
  }

  let childAttributes = modifiedStyleAttributesBuilder(docxDocumentInstance, vNode, attributes);
  if (vNode.tagName === 'a' && !attributes.hyperlink) {
    return [await buildHyperlink(vNode, childAttributes, docxDocumentInstance)];
  }
  if (formattingTags.has(vNode.tagName)) {
    childAttributes = { ...childAttributes, [vNode.tagName]: true };
  }

  // Other elements (span, small, abbr, nested links, …) keep their content.
  const runFragments: XMLBuilder[] = [];
  for (const childVNode of vNode.children ?? []) {
    runFragments.push(
      ...(await buildInlineRuns(childVNode, childAttributes, docxDocumentInstance)),
    );
  }

  return runFragments;
};

export const buildRun = async (
  vNode: VTree | null,
  attributes: BuilderAttributes,
  docxDocumentInstance: DocxDocument,
): Promise<XMLBuilder[]> => buildInlineRuns(vNode, attributes, docxDocumentInstance);

// Kept as separate names for the callers; links and spans are handled by buildRun.
export const buildRunOrRuns = buildRun;
export const buildRunOrHyperLink = buildRun;
