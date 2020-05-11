import { fragment } from 'xmlbuilder2';

import template from '../../template/document.template';

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
    return;
  }
  // eslint-disable-next-line no-empty
  if (vNode.type === 'VirtualText') {
  }
}

function renderDocumentFile(documentOptions, htmlString) {
  const { orientation, margins } = documentOptions;
  const width = orientation === 'landscape' ? 15840 : 12240;
  const height = orientation === 'landscape' ? 12240 : 15840;

  // eslint-disable-next-line no-unused-vars
  const vTree = convertHTML(htmlString);

  const xmlFragment = fragment();

  // eslint-disable-next-line no-unused-vars
  const xmlString = convertVTreeToXML(vTree, xmlFragment);

  return template(width, height, orientation, margins);
}

export default renderDocumentFile;
