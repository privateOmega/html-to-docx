/* eslint-disable no-case-declarations */
import { fragment } from 'xmlbuilder2';

import * as xmlBuilder from './xml-builder';
import namespaces from './namespaces';

const VNode = require('virtual-dom/vnode/vnode');
const VText = require('virtual-dom/vnode/vtext');
const isVNode = require('virtual-dom/vnode/is-vnode');
const isVText = require('virtual-dom/vnode/is-vtext');
const escape = require('escape-html');
const sizeOf = require('image-size');

const convertHTML = require('html-to-vdom')({
  VNode,
  VText,
});

// eslint-disable-next-line consistent-return
const buildImage = (docxDocumentInstance, vNode) => {
  let response = null;
  try {
    response = docxDocumentInstance.createMediaFile(vNode.properties.src);
  } catch (error) {
    // NOOP
  }
  if (response) {
    docxDocumentInstance.zip
      .folder('word')
      .folder('media')
      .file(response.fileNameWithExtension, Buffer.from(response.fileContent, 'base64'), {
        createFolders: false,
      });

    const documentRelsId = docxDocumentInstance.createDocumentRelationships(
      'image',
      `media/${response.fileNameWithExtension}`,
      'Internal'
    );

    const imageBuffer = Buffer.from(response.fileContent, 'base64');
    const imageProperties = sizeOf(imageBuffer);

    const imageFragment = xmlBuilder.buildParagraph(
      vNode,
      {
        type: 'picture',
        inlineOrAnchored: false,
        relationshipId: documentRelsId,
        ...response,
        maximumWidth: docxDocumentInstance.availableDocumentSpace,
        originalWidth: imageProperties.width,
        originalHeight: imageProperties.height,
      },
      docxDocumentInstance
    );

    return imageFragment;
  }
};

function findXMLEquivalent(docxDocumentInstance, vNode, xmlFragment) {
  switch (vNode.tagName) {
    case 'p':
      const paragraphFragment = xmlBuilder.buildParagraph(vNode, {}, docxDocumentInstance);
      xmlFragment.import(paragraphFragment);
      return;
    case 'figure':
      if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
        // eslint-disable-next-line no-plusplus
        for (let index = 0; index < vNode.children.length; index++) {
          const childVNode = vNode.children[index];
          if (childVNode.tagName === 'table') {
            const tableFragment = xmlBuilder.buildTable(childVNode, {
              maximumWidth: docxDocumentInstance.availableDocumentSpace,
            });
            xmlFragment.import(tableFragment);
            // Adding empty paragraph for space after table
            const emptyParagraphFragment = xmlBuilder.buildParagraph(null, {});
            xmlFragment.import(emptyParagraphFragment);
          } else if (childVNode.tagName === 'img') {
            const imageFragment = buildImage(docxDocumentInstance, childVNode);
            if (imageFragment) {
              xmlFragment.import(imageFragment);
            }
          }
        }
      }
      return;
    case 'table':
      const tableFragment = xmlBuilder.buildTable(vNode, {
        maximumWidth: docxDocumentInstance.availableDocumentSpace,
      });
      xmlFragment.import(tableFragment);
      // Adding empty paragraph for space after table
      const emptyParagraphFragment = xmlBuilder.buildParagraph(null, {});
      xmlFragment.import(emptyParagraphFragment);
      return;
    case 'ol':
    case 'ul':
      const numberingId = docxDocumentInstance.createNumbering(vNode.tagName === 'ol');
      // eslint-disable-next-line no-plusplus
      for (let index = 0; index < vNode.children.length; index++) {
        const childVNode = vNode.children[index];
        if (childVNode.tagName === 'li') {
          // eslint-disable-next-line no-shadow
          const paragraphFragment = xmlBuilder.buildParagraph(
            childVNode,
            {
              numbering: { levelId: 0, numberingId },
            },
            docxDocumentInstance
          );
          xmlFragment.import(paragraphFragment);
        }
      }
      return;
    case 'img':
      const imageFragment = buildImage(docxDocumentInstance, vNode);
      if (imageFragment) {
        xmlFragment.import(imageFragment);
      }
      return;
    default:
      break;
  }
  if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      // eslint-disable-next-line no-use-before-define
      convertVTreeToXML(docxDocumentInstance, childVNode, xmlFragment);
    }
  }
}

// eslint-disable-next-line consistent-return
export function convertVTreeToXML(docxDocumentInstance, vTree, xmlFragment) {
  if (!vTree) {
    // eslint-disable-next-line no-useless-return
    return '';
  }
  if (Array.isArray(vTree) && vTree.length) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < vTree.length; index++) {
      const vNode = vTree[index];
      convertVTreeToXML(docxDocumentInstance, vNode, xmlFragment);
    }
  } else if (isVNode(vTree)) {
    findXMLEquivalent(docxDocumentInstance, vTree, xmlFragment);
  } else if (isVText(vTree)) {
    xmlBuilder.buildTextElement(xmlFragment, escape(String(vTree.text)));
  }
  return xmlFragment;
}

function renderDocumentFile(docxDocumentInstance) {
  const vTree = convertHTML(docxDocumentInstance.htmlString);

  const xmlFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  });

  const populatedXmlFragment = convertVTreeToXML(docxDocumentInstance, vTree, xmlFragment);

  return populatedXmlFragment;
}

export default renderDocumentFile;
