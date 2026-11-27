import { create } from 'xmlbuilder2';
import VNode from 'virtual-dom/vnode/vnode.js';
import VText from 'virtual-dom/vnode/vtext.js';
// eslint-disable-next-line import/no-named-default
import { default as HTMLToVDOM } from 'html-to-vdom';
import { decode } from 'html-entities';
import type JSZip from 'jszip';
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

import { relsXML } from './schemas';
import DocxDocument, { type DocxDocumentProperties } from './docx-document';
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
import {
  defaultDocumentOptions,
  defaultHTMLString,
  relsFolderName,
  headerFileName,
  footerFileName,
  themeFileName,
  documentFileName,
  headerType,
  footerType,
  internalRelationship,
  wordFolder,
  themeFolder,
  themeType,
} from './constants';
import type { DocumentOptions, Length } from './types';

const convertHTML = HTMLToVDOM({
  VNode,
  VText,
});

const mergeOptions = <T extends object, P extends object>(options: T, patch: P): T & P => ({
  ...options,
  ...patch,
});

const fixupFontSize = (fontSize: number | string | undefined) => {
  let normalizedFontSize: number | string | null;
  // RegExp#test stringifies its argument; numbers never contain 'pt'.
  if (pointRegex.test(fontSize as string)) {
    const matchedParts = (fontSize as string).match(pointRegex)!;

    normalizedFontSize = pointToHIP(Number(matchedParts[1]));
  } else if (fontSize) {
    // assuming it is already in HIP
    normalizedFontSize = fontSize;
  } else {
    normalizedFontSize = null;
  }

  return normalizedFontSize;
};

const normalizeUnits = (
  dimensioningObject: Record<string, Length | undefined> | null | undefined,
  defaultDimensionsProperty: Record<string, number>,
) => {
  let normalizedUnitResult: Record<string, Length | undefined> | null = {};
  if (typeof dimensioningObject === 'object' && dimensioningObject !== null) {
    const result = normalizedUnitResult;
    Object.keys(dimensioningObject).forEach((key) => {
      // RegExp#test stringifies its argument; plain numbers never match a unit.
      const value = dimensioningObject[key] as string;
      if (pixelRegex.test(value)) {
        const matchedParts = value.match(pixelRegex)!;
        result[key] = pixelToTWIP(Number(matchedParts[1]));
      } else if (cmRegex.test(value)) {
        const matchedParts = value.match(cmRegex)!;
        result[key] = cmToTWIP(Number(matchedParts[1]));
      } else if (inchRegex.test(value)) {
        const matchedParts = value.match(inchRegex)!;
        result[key] = inchToTWIP(Number(matchedParts[1]));
      } else if (dimensioningObject[key]) {
        result[key] = dimensioningObject[key];
      } else {
        // incase value is something like 0
        result[key] = defaultDimensionsProperty[key];
      }
    });
  } else {
    // eslint-disable-next-line no-param-reassign
    normalizedUnitResult = null;
  }

  return normalizedUnitResult;
};

const normalizeDocumentOptions = (documentOptions: DocumentOptions) => {
  const normalizedDocumentOptions: Record<string, unknown> = { ...documentOptions };
  Object.keys(documentOptions).forEach((key) => {
    // eslint-disable-next-line default-case
    switch (key) {
      case 'pageSize':
      case 'margins':
        normalizedDocumentOptions[key] = normalizeUnits(
          documentOptions[key] as Record<string, Length | undefined> | undefined,
          defaultDocumentOptions[key] as Record<string, number>,
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
async function addFilesToContainer(
  zip: JSZip,
  htmlString: string | null | undefined,
  suppliedDocumentOptions: DocumentOptions,
  headerHTMLString?: string | null,
  footerHTMLString?: string | null,
): Promise<JSZip> {
  const normalizedDocumentOptions = normalizeDocumentOptions(suppliedDocumentOptions);
  const documentOptions = mergeOptions(defaultDocumentOptions, normalizedDocumentOptions);

  if (documentOptions.header && !headerHTMLString) {
    // eslint-disable-next-line no-param-reassign
    headerHTMLString = defaultHTMLString;
  }
  if (documentOptions.footer && !footerHTMLString) {
    // eslint-disable-next-line no-param-reassign
    footerHTMLString = defaultHTMLString;
  }
  if (documentOptions.decodeUnicode) {
    headerHTMLString = decode(headerHTMLString); // eslint-disable-line no-param-reassign
    htmlString = decode(htmlString); // eslint-disable-line no-param-reassign
    footerHTMLString = decode(footerHTMLString); // eslint-disable-line no-param-reassign
  }

  const docxDocument = new DocxDocument({
    zip,
    htmlString,
    ...documentOptions,
  } as DocxDocumentProperties);
  // Conversion to Word XML happens here. An empty document renders to '',
  // which is stored as-is.
  docxDocument.documentXML = (await renderDocumentFile(docxDocument)) as XMLBuilder;

  zip
    .folder(relsFolderName)!
    .file(
      '.rels',
      create({ encoding: 'UTF-8', standalone: true }, relsXML).toString({ prettyPrint: true }),
      { createFolders: false },
    );

  zip.folder('docProps')!.file('core.xml', docxDocument.generateCoreXML(), {
    createFolders: false,
  });

  if (docxDocument.header && headerHTMLString) {
    const vTree = convertHTML(headerHTMLString);

    docxDocument.relationshipFilename = headerFileName;
    const { headerId, headerXML } = await docxDocument.generateHeaderXML(vTree);
    docxDocument.relationshipFilename = documentFileName;
    const fileNameWithExt = `${headerType}${headerId}.xml`;

    const relationshipId = docxDocument.createDocumentRelationships(
      docxDocument.relationshipFilename,
      headerType,
      fileNameWithExt,
      internalRelationship,
    );

    zip.folder(wordFolder)!.file(fileNameWithExt, headerXML.toString({ prettyPrint: true }), {
      createFolders: false,
    });

    docxDocument.headerObjects.push({ headerId, relationshipId, type: docxDocument.headerType });
  }
  if (docxDocument.footer && footerHTMLString) {
    const vTree = convertHTML(footerHTMLString);

    docxDocument.relationshipFilename = footerFileName;
    const { footerId, footerXML } = await docxDocument.generateFooterXML(vTree);
    docxDocument.relationshipFilename = documentFileName;
    const fileNameWithExt = `${footerType}${footerId}.xml`;

    const relationshipId = docxDocument.createDocumentRelationships(
      docxDocument.relationshipFilename,
      footerType,
      fileNameWithExt,
      internalRelationship,
    );

    zip.folder(wordFolder)!.file(fileNameWithExt, footerXML.toString({ prettyPrint: true }), {
      createFolders: false,
    });

    docxDocument.footerObjects.push({ footerId, relationshipId, type: docxDocument.footerType });
  }
  const themeFileNameWithExt = `${themeFileName}.xml`;
  docxDocument.createDocumentRelationships(
    docxDocument.relationshipFilename,
    themeType,
    `${themeFolder}/${themeFileNameWithExt}`,
    internalRelationship,
  );
  zip
    .folder(wordFolder)!
    .folder(themeFolder)!
    .file(themeFileNameWithExt, docxDocument.generateThemeXML(), {
      createFolders: false,
    });

  zip
    .folder(wordFolder)!
    .file('document.xml', docxDocument.generateDocumentXML(), { createFolders: false })
    .file('fontTable.xml', docxDocument.generateFontTableXML(), { createFolders: false })
    .file('styles.xml', docxDocument.generateStylesXML(), { createFolders: false })
    .file('numbering.xml', docxDocument.generateNumberingXML(), { createFolders: false })
    .file('settings.xml', docxDocument.generateSettingsXML(), { createFolders: false })
    .file('webSettings.xml', docxDocument.generateWebSettingsXML(), { createFolders: false });

  const relationshipXMLs = docxDocument.generateRelsXML();
  if (relationshipXMLs && Array.isArray(relationshipXMLs)) {
    relationshipXMLs.forEach(({ fileName, xmlString }) => {
      zip.folder(wordFolder)!.folder(relsFolderName)!.file(`${fileName}.xml.rels`, xmlString, {
        createFolders: false,
      });
    });
  }

  zip.file('[Content_Types].xml', docxDocument.generateContentTypesXML(), { createFolders: false });

  return zip;
}

export default addFilesToContainer;
