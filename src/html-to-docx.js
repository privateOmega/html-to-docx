import { create } from 'xmlbuilder2';

import { relsXML } from './schemas';
import DocxDocument from './docx-document';
import { renderDocumentFile } from './helpers';
import {
  pixelRegex,
  pixelToTWIP,
  cmRegex,
  cmToTWIP,
  inchRegex,
  inchToTWIP,
  pointRegex,
  pointToHIP,
} from './utils/unit-conversion';

const VNode = require('virtual-dom/vnode/vnode');
const VText = require('virtual-dom/vnode/vtext');
const convertHTML = require('html-to-vdom')({
  VNode,
  VText,
});

const defaultDocumentOptions = {
  pageSize: {
    width: 12240,
    height: 15840,
  },
  margins: {
    top: 1440,
    right: 1800,
    bottom: 1440,
    left: 1800,
    header: 720,
    footer: 720,
    gutter: 0,
  },
  title: '',
  subject: '',
  creator: 'html-to-docx',
  keywords: ['html-to-docx'],
  description: '',
  lastModifiedBy: 'html-to-docx',
  revision: 1,
  createdAt: new Date(),
  modifiedAt: new Date(),
  headerType: 'default',
  header: false,
  footerType: 'default',
  footer: false,
  font: 'Times New Roman',
  fontSize: 22,
  complexScriptFontSize: 22,
  table: {
    row: {
      cantSplit: false,
    },
  },
  pageNumber: false,
  skipFirstHeaderFooter: false,
};

const mergeOptions = (options, patch) => ({ ...options, ...patch });

const fixupFontSize = (fontSize) => {
  let normalizedFontSize;
  if (pointRegex.test(fontSize)) {
    const matchedParts = fontSize.match(pointRegex);

    normalizedFontSize = pointToHIP(matchedParts[1]);
  } else if (fontSize) {
    // assuming it is already in HIP
    normalizedFontSize = fontSize;
  } else {
    normalizedFontSize = null;
  }

  return normalizedFontSize;
};

const normalizeUnits = (dimensioningObject, defaultDimensionsProperty) => {
  let normalizedUnitResult = {};
  if (typeof dimensioningObject === 'object' && dimensioningObject !== null) {
    Object.keys(dimensioningObject).forEach((key) => {
      if (pixelRegex.test(dimensioningObject[key])) {
        const matchedParts = dimensioningObject[key].match(pixelRegex);
        normalizedUnitResult[key] = pixelToTWIP(matchedParts[1]);
      } else if (cmRegex.test(dimensioningObject[key])) {
        const matchedParts = dimensioningObject[key].match(cmRegex);
        normalizedUnitResult[key] = cmToTWIP(matchedParts[1]);
      } else if (inchRegex.test(dimensioningObject[key])) {
        const matchedParts = dimensioningObject[key].match(inchRegex);
        normalizedUnitResult[key] = inchToTWIP(matchedParts[1]);
      } else if (dimensioningObject[key]) {
        normalizedUnitResult[key] = dimensioningObject[key];
      } else {
        // incase value is something like 0
        normalizedUnitResult[key] = defaultDimensionsProperty[key];
      }
    });
  } else {
    // eslint-disable-next-line no-param-reassign
    normalizedUnitResult = null;
  }

  return normalizedUnitResult;
};

const normalizeDocumentOptions = (documentOptions) => {
  const normalizedDocumentOptions = { ...documentOptions };
  Object.keys(documentOptions).forEach((key) => {
    // eslint-disable-next-line default-case
    switch (key) {
      case 'pageSize':
      case 'margins':
        normalizedDocumentOptions[key] = normalizeUnits(
          documentOptions[key],
          defaultDocumentOptions[key]
        );
        break;
      case 'fontSize':
      case 'complexScriptFontSize':
        normalizedDocumentOptions[key] = fixupFontSize(documentOptions[key]);
        break;
    }
  });

  return normalizedDocumentOptions;
};

// Ref: https://en.wikipedia.org/wiki/Office_Open_XML_file_formats
// http://officeopenxml.com/anatomyofOOXML.php
// eslint-disable-next-line import/prefer-default-export
export function addFilesToContainer(
  zip,
  htmlString,
  suppliedDocumentOptions,
  headerHTMLString,
  footerHTMLString
) {
  const normalizedDocumentOptions = normalizeDocumentOptions(suppliedDocumentOptions);
  const documentOptions = mergeOptions(defaultDocumentOptions, normalizedDocumentOptions);

  if (documentOptions.header && !headerHTMLString) {
    // eslint-disable-next-line no-param-reassign
    headerHTMLString = '<p></p>';
  }
  if (documentOptions.footer && !footerHTMLString) {
    // eslint-disable-next-line no-param-reassign
    footerHTMLString = '<p></p>';
  }

  const docxDocument = new DocxDocument({ zip, htmlString, ...documentOptions });
  // Conversion to Word XML happens here
  docxDocument.documentXML = renderDocumentFile(docxDocument);

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

  if (docxDocument.header && headerHTMLString) {
    const vTree = convertHTML(headerHTMLString);

    docxDocument.relationshipFilename = 'header1';
    const { headerId, headerXML } = docxDocument.generateHeaderXML(vTree);
    docxDocument.relationshipFilename = 'document';

    const relationshipId = docxDocument.createDocumentRelationships(
      docxDocument.relationshipFilename,
      'header',
      `header${headerId}.xml`,
      'Internal'
    );

    zip.folder('word').file(`header${headerId}.xml`, headerXML.toString({ prettyPrint: true }), {
      createFolders: false,
    });

    docxDocument.headerObjects.push({ headerId, relationshipId, type: docxDocument.headerType });
  }
  if (docxDocument.footer && footerHTMLString) {
    const vTree = convertHTML(footerHTMLString);

    docxDocument.relationshipFilename = 'footer1';
    const { footerId, footerXML } = docxDocument.generateFooterXML(vTree);
    docxDocument.relationshipFilename = 'document';

    const relationshipId = docxDocument.createDocumentRelationships(
      docxDocument.relationshipFilename,
      'footer',
      `footer${footerId}.xml`,
      'Internal'
    );

    zip.folder('word').file(`footer${footerId}.xml`, footerXML.toString({ prettyPrint: true }), {
      createFolders: false,
    });

    docxDocument.footerObjects.push({ footerId, relationshipId, type: docxDocument.footerType });
  }

  zip
    .folder('word')
    .file('document.xml', docxDocument.generateDocumentXML(), {
      createFolders: false,
    })
    .file('fontTable.xml', docxDocument.generateFontTableXML(), {
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
    });

  const relationshipXMLs = docxDocument.generateRelsXML();
  if (relationshipXMLs && Array.isArray(relationshipXMLs)) {
    relationshipXMLs.forEach(({ fileName, xmlString }) => {
      zip.folder('word').folder('_rels').file(`${fileName}.xml.rels`, xmlString, {
        createFolders: false,
      });
    });
  }

  zip.file('[Content_Types].xml', docxDocument.generateContentTypesXML(), { createFolders: false });

  return zip;
}
