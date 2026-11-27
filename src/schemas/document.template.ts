import namespaces from '../namespaces';
import type { Orientation, PageMargins } from '../types';

const generateDocumentTemplate = (
  width: number,
  height: number,
  orientation: Orientation,
  margins: PageMargins,
): string => `
  <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

    <w:document
        xmlns:a="${namespaces.a}"
        xmlns:cdr="${namespaces.cdr}"
        xmlns:o="${namespaces.o}"
        xmlns:pic="${namespaces.pic}"
        xmlns:r="${namespaces.r}"
        xmlns:v="${namespaces.v}"
        xmlns:ve="${namespaces.ve}"
        xmlns:vt="${namespaces.vt}"
        xmlns:w="${namespaces.w}"
        xmlns:w10="${namespaces.w10}"
        xmlns:wp="${namespaces.wp}"
        xmlns:wne="${namespaces.wne}"
        >
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

export default generateDocumentTemplate;
