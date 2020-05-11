const generateStylesXML = (stylingInstancesXML = '') => {
  return `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

        <w:styles>
            ${stylingInstancesXML}
        </w:styles>
      `;
};

export default generateStylesXML;
