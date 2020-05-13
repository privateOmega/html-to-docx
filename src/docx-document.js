import { create, fragment } from 'xmlbuilder2';

import {
  generateCoreXML,
  generateStylesXML,
  generateNumberingXMLTemplate,
  generateDocumentRelsXMLTemplate,
} from './schemas';
import { renderDocumentFile } from './helpers';
import generateDocumentTemplate from '../template/document.template';

const crypto = require('crypto');

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
    zip,
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
    this.zip = zip;
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
    this.lastMediaId = 0;
    this.stylesObjects = [];
    this.numberingObjects = [];
    this.documentRelsObjects = [];
    this.mediaFiles = [];
    this.documentXML = null;

    this.convert = this.convert.bind(this);
    this.generateCoreXML = this.generateCoreXML.bind(this);
    this.generateDocumentXML = this.generateDocumentXML.bind(this);
    this.generateStylesXML = this.generateStylesXML.bind(this);
    this.generateNumberingXML = this.generateNumberingXML.bind(this);
    this.generateDocumentRelsXML = this.generateDocumentRelsXML.bind(this);
    this.createMediaFile = this.createMediaFile.bind(this);
    this.createDocumentRelationships = this.createDocumentRelationships.bind(this);
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
    const documentXML = create(
      { encoding: 'UTF-8', standalone: true },
      generateDocumentTemplate(this.width, this.height, this.orientation, this.margins)
    );
    documentXML.root().first().import(this.documentXML);

    return documentXML.toString({ prettyPrint: true });
  }

  // eslint-disable-next-line class-methods-use-this
  generateStylesXML() {
    // TODO: Convert styles array into appropriate XML
    const stylingInstancesXML = '';

    return generateStylesXML(stylingInstancesXML);
  }

  generateNumberingXML() {
    const numberingXML = create(
      { encoding: 'UTF-8', standalone: true },
      generateNumberingXMLTemplate()
    );

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
    numberingXML.root().import(xmlFragment);

    return numberingXML.toString({ prettyPrint: true });
  }

  generateDocumentRelsXML() {
    const documentRelsXML = create(
      { encoding: 'UTF-8', standalone: true },
      generateDocumentRelsXMLTemplate()
    );

    this.documentRelsObjects.forEach(
      // eslint-disable-next-line array-callback-return
      ({ relationshipId, type, target, targetMode }) => {
        const relationshipFragment = fragment()
          .ele('Relationship')
          .att('Id', `rId${relationshipId}`)
          .att('Type', type)
          .att('Target', target)
          .att('TargetMode', targetMode)
          .up();
        documentRelsXML.root().import(relationshipFragment);
      }
    );

    return documentRelsXML.toString({ prettyPrint: true });
  }

  createNumbering(ordered = false) {
    this.lastNumberingId += 1;
    this.numberingObjects.push({ numberingId: this.lastNumberingId, ordered });

    return this.lastNumberingId;
  }

  createMediaFile(base64String) {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches.length !== 3) {
      throw new Error('Invalid base64 string');
    }

    const base64FileContent = matches[2];
    // matches array contains file type in base64 format - image/jpeg and base64 stringified data
    const fileExtension = matches[1].match(/\/(.*?)$/)[1];
    const SHA1String = crypto.createHash('sha1').update(crypto.randomBytes(20)).digest('hex');

    const fileNameWithExtension = `image-${SHA1String}.${fileExtension}`;

    this.zip
      .folder('word')
      .folder('media')
      .file(fileNameWithExtension, Buffer.from(base64FileContent, 'base64'), {
        createFolders: false,
      });

    this.lastMediaId += 1;

    return { id: this.lastMediaId, fileNameWithExtension };
  }

  createDocumentRelationships(type, target, targetMode = 'External') {
    this.lastDocumentRelsId += 1;
    let relationshipType;
    switch (type) {
      case 'hyperlink':
        relationshipType = 'http://schemas.microsoft.com/office/2006/relationships/hyperlink';
        break;
      case 'image':
        relationshipType = 'http://schemas.microsoft.com/office/2006/relationships/image';
        break;
      default:
        break;
    }
    this.documentRelsObjects.push({
      relationshipId: this.lastDocumentRelsId,
      type: relationshipType,
      target,
      targetMode,
    });

    return this.lastDocumentRelsId;
  }
}

export default DocxDocument;
