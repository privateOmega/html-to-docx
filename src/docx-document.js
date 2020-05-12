import { fragment } from 'xmlbuilder2';

import {
  generateCoreXML,
  generateStylesXML,
  generateNumberingXML,
  generateDocumentRelsXML,
} from './schemas';
import { renderDocumentFile } from './helpers';
import template from '../template/document.template';

const landscapeMargins = {
  top: 1800,
  right: 1440,
  bottom: 1800,
  left: 1440,
};

const portraitMargins = {
  top: 1440,
  right: 1800,
  bottom: 1440,
  left: 1800,
};

class DocxDocument {
  constructor({
    htmlString,
    orientation,
    margins,
    title,
    subject,
    creator,
    keywords,
    description,
    lastModifiedBy,
    revision,
    createdAt,
    modifiedAt,
  }) {
    this.htmlString = htmlString;
    this.orientation = orientation;
    this.width = orientation === 'landscape' ? 15840 : 12240;
    this.height = orientation === 'landscape' ? 12240 : 15840;
    this.margins = margins || orientation === 'landscape' ? landscapeMargins : portraitMargins;
    this.title = title || '';
    this.subject = subject || '';
    this.creator = creator || 'html-to-docx';
    this.keywords = keywords || ['html-to-docx'];
    this.description = description || '';
    this.lastModifiedBy = lastModifiedBy || 'html-to-docx';
    this.revision = revision || 1;
    this.createdAt = createdAt || new Date();
    this.modifiedAt = modifiedAt || new Date();

    this.lastNumberingId = 0;
    this.lastDocumentRelsId = 0;
    this.stylesObjects = [];
    this.numberingObjects = [];
    this.documentRelsObjects = [];
    this.documentXML = null;

    this.convert = this.convert.bind(this);
    this.generateCoreXML = this.generateCoreXML.bind(this);
    this.generateDocumentXML = this.generateDocumentXML.bind(this);
    this.generateStylesXML = this.generateStylesXML.bind(this);
    this.generateNumberingXML = this.generateNumberingXML.bind(this);
    this.generateDocumentRelsXML = this.generateDocumentRelsXML.bind(this);
  }

  convert() {
    const documentXML = renderDocumentFile(this);

    this.documentXML = documentXML;
  }

  generateCoreXML() {
    return generateCoreXML(
      this.title,
      this.subject,
      this.creator,
      this.keywords,
      this.description,
      this.lastModifiedBy,
      this.revision,
      this.createdAt,
      this.modifiedAt
    );
  }

  generateDocumentXML() {
    return template(
      this.width,
      this.height,
      this.orientation,
      this.margins,
      this.documentXML ? this.documentXML.toString({ prettyPrint: true }) : ''
    );
  }

  // eslint-disable-next-line class-methods-use-this
  generateStylesXML() {
    // TODO: Convert styles array into appropriate XML
    const stylingInstancesXML = '';

    return generateStylesXML(stylingInstancesXML);
  }

  // eslint-disable-next-line class-methods-use-this
  generateNumberingXML() {
    const xmlFragment = fragment({
      namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
    });

    this.numberingObjects.forEach(
      // eslint-disable-next-line array-callback-return
      ({ numberingId, ordered }) => {
        const numberingFragment = fragment({
          namespaceAlias: { w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main' },
        })
          .ele('@w', 'num')
          .att('@w', 'numId', String(numberingId))
          .ele('@w', 'abstractNumId')
          .att('@w', 'val', ordered ? '1' : '2')
          .up()
          .up();
        xmlFragment.import(numberingFragment);
      }
    );

    return generateNumberingXML(xmlFragment.toString({ prettyPrint: true }) || '');
  }

  // eslint-disable-next-line class-methods-use-this
  generateDocumentRelsXML() {
    // TODO: Convert documentRels array into appropriate XML
    const documentRelationshipsXML = '';

    return generateDocumentRelsXML(documentRelationshipsXML);
  }

  createOrderedList(ordered = false) {
    this.lastNumberingId += 1;
    this.numberingObjects.push({ numberingId: this.lastNumberingId, ordered });

    return this.lastNumberingId;
  }
}

export default DocxDocument;
