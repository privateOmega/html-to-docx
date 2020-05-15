const generateDocumentTemplate = (width, height, orientation, margins) => {
  return `
  <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

    <w:document
        xmlns:w="http://purl.oclc.org/ooxml/wordprocessingml/main">
        <w:body>
            <w:sectPr>
                <w:pgSz w:w="${width}" w:h="${height}" w:orient="${orientation}" />
                <w:pgMar w:top="${margins.top}"
                        w:right="${margins.right}"
                        w:bottom="${margins.bottom}"
                        w:left="${margins.left}"
                        w:header="${margins.header}"
                        w:footer="${margins.footer}"
                        w:gutter="${margins.gutter}"/>
            </w:sectPr>
        </w:body>
    </w:document>
  `;
};

export default generateDocumentTemplate;
