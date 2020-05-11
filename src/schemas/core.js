const generateCoreXML = (
  title = '',
  subject = '',
  creator = 'html-to-docx',
  keywords = ['html-to-docx'],
  description = '',
  lastModifiedBy = 'html-to-docx',
  revision = 1,
  createdAt = new Date(),
  modifiedAt = new Date()
) => {
  return `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

        <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <dc:title>${title}</dc:title>
            <dc:subject>${subject}</dc:subject>
            <dc:creator>${creator}</dc:creator>
            ${
              keywords && Array.isArray(keywords)
                ? `<cp:keywords>${keywords.join(', ')}</cp:keywords>`
                : ''
            }
            <dc:description>${description}</dc:description>
            <cp:lastModifiedBy>${lastModifiedBy}</cp:lastModifiedBy>
            <cp:revision>${revision}</cp:revision>
            <dcterms:created xsi:type="dcterms:W3CDTF">${
              createdAt instanceof Date ? createdAt.toISOString() : new Date().toISOString()
            }</dcterms:created>
            <dcterms:modified xsi:type="dcterms:W3CDTF">${
              modifiedAt instanceof Date ? modifiedAt.toISOString() : new Date().toISOString()
            }</dcterms:modified>
        </cp:coreProperties>
    `;
};

export default generateCoreXML;
