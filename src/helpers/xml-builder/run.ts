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
import { isVNode, isVText, asVNode } from './shared';
import type { VTree, VNodeType, BuilderAttributes } from './shared';
import {
  buildLineBreak,
  buildTextElement,
  modifiedStyleAttributesBuilder,
  buildRunProperties,
} from './formatting';
import { buildDrawing } from './drawing';
import { base64ToBytes } from '../../utils/base64';

export const buildRun = async (
  vNode: VTree | null,
  attributes: BuilderAttributes,
  docxDocumentInstance: DocxDocument,
): Promise<XMLBuilder | XMLBuilder[]> => {
  const runFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'r');
  const runPropertiesFragment = buildRunProperties(structuredClone(attributes));

  // case where we have recursive spans representing font changes
  if (isVNode(vNode) && vNode.tagName === 'span') {
    // eslint-disable-next-line no-use-before-define
    return buildRunOrRuns(vNode, attributes, docxDocumentInstance);
  }

  if (
    isVNode(vNode) &&
    [
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
      'blockquote',
      'code',
      'pre',
    ].includes(vNode.tagName)
  ) {
    const runFragmentsArray: XMLBuilder[] = [];

    let vNodes: VTree[] = [vNode];
    // create temp run fragments to split the paragraph into different runs
    let tempAttributes: BuilderAttributes = structuredClone(attributes);
    let tempRunFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'r');
    while (vNodes.length) {
      const tempVNode = vNodes.shift()!;
      if (isVText(tempVNode)) {
        const textFragment = buildTextElement(tempVNode.text);
        const tempRunPropertiesFragment = buildRunProperties({ ...attributes, ...tempAttributes });
        tempRunFragment.import(tempRunPropertiesFragment);
        tempRunFragment.import(textFragment);
        runFragmentsArray.push(tempRunFragment);

        // re initialize temp run fragments with new fragment
        tempAttributes = structuredClone(attributes);
        tempRunFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'r');
      } else if (isVNode(tempVNode)) {
        if (
          [
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
          ].includes(tempVNode.tagName)
        ) {
          // Every tag in this list is a formatting key that buildRunProperties
          // understands (see buildFormatting): strong/b, em/i, u/ins,
          // s/del/strike, sub/sup, mark, code and pre.
          tempAttributes = { [tempVNode.tagName]: true };
          // go a layer deeper if there is a span somewhere in the children
        } else if (tempVNode.tagName === 'span') {
          // eslint-disable-next-line no-use-before-define
          const spanFragment = await buildRunOrRuns(
            tempVNode,
            { ...attributes, ...tempAttributes },
            docxDocumentInstance,
          );

          // if spanFragment is an array, we need to add each fragment to the runFragmentsArray. If the fragment is an array, perform a depth first search on the array to add each fragment to the runFragmentsArray
          if (Array.isArray(spanFragment)) {
            spanFragment.flat(Infinity);
            runFragmentsArray.push(...spanFragment);
          } else {
            runFragmentsArray.push(spanFragment);
          }

          // do not slice and concat children since this is already accounted for in the buildRunOrRuns function
          // eslint-disable-next-line no-continue
          continue;
        }
      }

      if (isVNode(tempVNode) && tempVNode.children && tempVNode.children.length) {
        if (tempVNode.children.length > 1) {
          attributes = { ...attributes, ...tempAttributes };
        }

        vNodes = tempVNode.children.slice().concat(vNodes);
      }
    }
    if (runFragmentsArray.length) {
      return runFragmentsArray;
    }
  }

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

export const buildRunOrRuns = async (
  vNode: VTree | null,
  attributes: BuilderAttributes,
  docxDocumentInstance: DocxDocument,
): Promise<XMLBuilder | XMLBuilder[]> => {
  if (isVNode(vNode) && vNode.tagName === 'span') {
    let runFragments: XMLBuilder[] = [];

    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = asVNode(vNode.children[index]!);
      const modifiedAttributes = modifiedStyleAttributesBuilder(
        docxDocumentInstance,
        vNode,
        attributes,
      );
      const tempRunFragments = await buildRun(childVNode, modifiedAttributes, docxDocumentInstance);
      runFragments = runFragments.concat(
        Array.isArray(tempRunFragments) ? tempRunFragments : [tempRunFragments],
      );
    }

    return runFragments;
  } else {
    const tempRunFragments = await buildRun(vNode, attributes, docxDocumentInstance);
    return tempRunFragments;
  }
};

export const buildRunOrHyperLink = async (
  vNode: VTree | null,
  attributes: BuilderAttributes,
  docxDocumentInstance: DocxDocument,
) => {
  if (isVNode(vNode) && vNode.tagName === 'a') {
    const relationshipId = docxDocumentInstance.createDocumentRelationships(
      docxDocumentInstance.relationshipFilename,
      hyperlinkType,
      vNode.properties && vNode.properties.href ? vNode.properties.href : '',
    );
    const hyperlinkFragment = fragment({ namespaceAlias: { w: namespaces.w, r: namespaces.r } })
      .ele('@w', 'hyperlink')
      .att('@r', 'id', `rId${relationshipId}`);

    const modifiedAttributes = { ...attributes };
    modifiedAttributes.hyperlink = true;

    const runFragments = await buildRunOrRuns(
      vNode.children[0],
      modifiedAttributes,
      docxDocumentInstance,
    );
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

  const runFragments = await buildRunOrRuns(vNode, attributes, docxDocumentInstance);

  return runFragments;
};
