import { namespaces } from '../helpers';

const generateDocumentRelsXMLTemplate = () => {
  return `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="${namespaces.numbering}" Target="numbering.xml"/>
          <Relationship Id="rId2" Type="${namespaces.styles}" Target="styles.xml"/>
        </Relationships>
    `;
};

export default generateDocumentRelsXMLTemplate;
