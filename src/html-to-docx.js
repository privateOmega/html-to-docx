import { create } from 'xmlbuilder2';

import { contentTypesXML, relsXML } from './schemas';
import DocxDocument from './docx-document';
import { renderDocumentFile } from './helpers';

const VNode = require('virtual-dom/vnode/vnode');
const VText = require('virtual-dom/vnode/vtext');
const convertHTML = require('html-to-vdom')({
  VNode,
  VText,
});

const defaultDocumentOptions = {
  orientation: 'portrait',
  margins: {},
};

const mergeOptions = (options, patch) => ({ ...options, ...patch });

// Ref: https://en.wikipedia.org/wiki/Office_Open_XML_file_formats
// http://officeopenxml.com/anatomyofOOXML.php
// eslint-disable-next-line import/prefer-default-export
export function addFilesToContainer(zip, htmlString, suppliedDocumentOptions, headerHTMLString) {
  const documentOptions = mergeOptions(defaultDocumentOptions, suppliedDocumentOptions);

  const docxDocument = new DocxDocument({ zip, htmlString, ...documentOptions });
  // Conversion to Word XML happens here
  docxDocument.documentXML = renderDocumentFile(docxDocument);

  zip.file(
    '[Content_Types].xml',
    create({ encoding: 'UTF-8', standalone: true }, contentTypesXML).toString({
      prettyPrint: true,
    }),
    { createFolders: false }
  );

  zip
    .folder('_rels')
    .file(
      '.rels',
      create({ encoding: 'UTF-8', standalone: true }, relsXML).toString({ prettyPrint: true }),
      { createFolders: false }
    );

  zip.folder('docProps').file('core.xml', docxDocument.generateCoreXML(), {
    createFolders: false,
  });

  if (headerHTMLString) {
    const vTree = convertHTML(headerHTMLString);

    const { headerId, headerXML } = docxDocument.generateHeaderXML(vTree);

    const relationshipId = docxDocument.createDocumentRelationships(
      'header',
      `header${headerId}.xml`,
      'Internal'
    );

    zip.folder('word').file(`header${headerId}.xml`, headerXML.toString({ prettyPrint: true }), {
      createFolders: false,
    });

    docxDocument.headerObjects.push({ headerId, relationshipId, type: 'default' });
  }

  zip
    .folder('word')
    .file('document.xml', docxDocument.generateDocumentXML(), {
      createFolders: false,
    })
    .file('styles.xml', docxDocument.generateStylesXML(), {
      createFolders: false,
    })
    .file('numbering.xml', docxDocument.generateNumberingXML(), {
      createFolders: false,
    })
    .file('settings.xml', docxDocument.generateSettingsXML(), {
      createFolders: false,
    })
    .file('webSettings.xml', docxDocument.generateWebSettingsXML(), {
      createFolders: false,
    })
    .folder('_rels')
    .file('document.xml.rels', docxDocument.generateDocumentRelsXML(), {
      createFolders: false,
    });

  return zip;
}
