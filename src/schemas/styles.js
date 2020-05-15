import { namespaces } from '../helpers';

const generateStylesXML = (stylingInstancesXML = '') => {
  return `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

        <w:styles xmlns:w="${namespaces.w}">
            ${stylingInstancesXML}
        </w:styles>
      `;
};

export default generateStylesXML;
