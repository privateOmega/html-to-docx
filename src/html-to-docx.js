import { create } from 'xmlbuilder2';

import { contentTypesXML, relsXML } from './schemas';
import DocxDocument from './docx-document';

const defaultDocumentOptions = {
  orientation: 'portrait',
  margins: {},
};

const mergeOptions = (options, patch) => ({ ...options, ...patch });

// Ref: https://en.wikipedia.org/wiki/Office_Open_XML_file_formats
// http://officeopenxml.com/anatomyofOOXML.php
// eslint-disable-next-line import/prefer-default-export
export function addFilesToContainer(zip, htmlString, suppliedDocumentOptions) {
  const documentOptions = mergeOptions(defaultDocumentOptions, suppliedDocumentOptions);

  const docxDocument = new DocxDocument({ zip, htmlString, ...documentOptions });
  docxDocument.convert();

  zip.file(
    '[Content_Types].xml',
    Buffer.from(
      create({ encoding: 'UTF-8', standalone: true }, contentTypesXML).toString({
        prettyPrint: true,
      }),
      'utf-8'
    ),
    { createFolders: false }
  );

  zip
    .folder('_rels')
    .file(
      '.rels',
      Buffer.from(
        create({ encoding: 'UTF-8', standalone: true }, relsXML).toString({ prettyPrint: true }),
        'utf-8'
      ),
      { createFolders: false }
    );

  zip.folder('docProps').file('core.xml', Buffer.from(docxDocument.generateCoreXML(), 'utf-8'), {
    createFolders: false,
  });

  zip
    .folder('word')
    // eslint-disable-next-line no-undef
    .file('document.xml', docxDocument.generateDocumentXML(), { createFolders: false })
    // eslint-disable-next-line no-undef
    .file('styles.xml', Buffer.from(docxDocument.generateStylesXML(), 'utf-8'), {
      createFolders: false,
    })
    .file('numbering.xml', Buffer.from(docxDocument.generateNumberingXML(), 'utf-8'), {
      createFolders: false,
    })
    .folder('_rels')
    .file('document.xml.res', Buffer.from(docxDocument.generateDocumentRelsXML(), 'utf-8'), {
      createFolders: false,
    });

  return zip;
}
