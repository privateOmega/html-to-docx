import { fragment } from 'xmlbuilder2';

import * as xmlBuilder from './xml-builder';

const VNode = require('virtual-dom/vnode/vnode');
const VText = require('virtual-dom/vnode/vtext');
const isVNode = require('virtual-dom/vnode/is-vnode');
const isVText = require('virtual-dom/vnode/is-vtext');
const escape = require('escape-html');

const convertHTML = require('html-to-vdom')({
  VNode,
  VText,
});

function findXMLEquivalent(docxDocumentInstance, vNode, xmlFragment) {
  switch (vNode.tagName) {
    case 'p':
      xmlBuilder.buildParagraph(xmlFragment, vNode);
      return;
    case 'table':
      xmlBuilder.buildTable(xmlFragment, vNode);
      return;
    case 'ol':
    case 'ul':
      // eslint-disable-next-line no-case-declarations
      const numberingId = docxDocumentInstance.createOrderedList(vNode.tagName === 'ol');
      // eslint-disable-next-line no-plusplus
      for (let index = 0; index < vNode.children.length; index++) {
        const childVNode = vNode.children[index];
        if (childVNode.tagName === 'li') {
          xmlBuilder.buildParagraph(xmlFragment, childVNode, {
            numbering: { levelId: 0, numberingId },
          });
        }
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
function convertVTreeToXML(docxDocumentInstance, vTree, xmlFragment) {
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
  // eslint-disable-next-line no-unused-vars
  const vTree = convertHTML(docxDocumentInstance.htmlString);

  const xmlFragment = fragment();

  const xmlString = convertVTreeToXML(vTree, xmlFragment);

  return xmlString;
}

export default renderDocumentFile;
