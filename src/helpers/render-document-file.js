import { fragment } from 'xmlbuilder2';

import { buildTextElement } from './xml-builder';

const VNode = require('virtual-dom/vnode/vnode');
const VText = require('virtual-dom/vnode/vtext');

const convertHTML = require('html-to-vdom')({
  VNode,
  VText,
});

// eslint-disable-next-line no-unused-vars
function convertVTreeToXML(vNode, xmlFragment) {
  if (!vNode) {
    // eslint-disable-next-line no-useless-return
    return '';
  }
  // eslint-disable-next-line no-empty
  if (vNode.type === 'VirtualText') {
  }
}

function renderDocumentFile(docxDocumentInstance) {
  // eslint-disable-next-line no-unused-vars
  const vTree = convertHTML(docxDocumentInstance.htmlString);

  const xmlFragment = fragment();

  const xmlString = convertVTreeToXML(vTree, xmlFragment);

  return xmlString;
}

export default renderDocumentFile;
