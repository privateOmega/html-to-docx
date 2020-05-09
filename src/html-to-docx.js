import { contentTypesXML, generateCoreXML, generateDocumentRelsXML, relsXML } from './schemas';
import { renderDocumentFile } from './helpers';

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

  zip.file('[Content_Types].xml', Buffer.from(contentTypesXML, 'utf-8'), { createFolders: false });

  zip.folder('_rels').file('.rels', Buffer.from(relsXML, 'utf-8'), { createFolders: false });

  zip
    .folder('docProps')
    .file('core.xml', Buffer.from(generateCoreXML(...documentOptions), 'utf-8'), {
      createFolders: false,
    });

  zip
    .folder('word')
    // eslint-disable-next-line no-undef
    .file('document.xml', renderDocumentFile(documentOptions, htmlString), { createFolders: false })
    // eslint-disable-next-line no-undef
    .file('styles.xml', Buffer.from(stylesXML, 'utf-8'), { createFolders: false })
    .folder('_rels')
    // eslint-disable-next-line no-undef
    .file('document.xml.res', Buffer.from(generateDocumentRelsXML(documentXMLRels), 'utf-8'), {
      createFolders: false,
    });

  return zip;
}
