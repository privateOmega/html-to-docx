import { create, fragment } from 'xmlbuilder2';

import {
  generateCoreXML,
  generateStylesXML,
  generateNumberingXMLTemplate,
  generateDocumentRelsXMLTemplate,
} from './schemas';
import { renderDocumentFile, convertVTreeToXML, namespaces } from './helpers';
import generateDocumentTemplate from '../template/document.template';

const crypto = require('crypto');
const VNode = require('virtual-dom/vnode/vnode');
const VText = require('virtual-dom/vnode/vtext');
const convertHTML = require('html-to-vdom')({
  VNode,
  VText,
});

const landscapeMargins = {
  top: 1800,
  right: 1440,
  bottom: 1800,
  left: 1440,
  header: 720,
  footer: 720,
  gutter: 0,
};

const portraitMargins = {
  top: 1440,
  right: 1800,
  bottom: 1440,
  left: 1800,
  header: 720,
  footer: 720,
  gutter: 0,
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
    headerHTMLString,
    headerType,
  }) {
    this.zip = zip;
    this.htmlString = htmlString;
    this.orientation = orientation;
    this.width = orientation === 'landscape' ? 15840 : 12240;
    this.height = orientation === 'landscape' ? 12240 : 15840;
    this.margins =
      // eslint-disable-next-line no-nested-ternary
      margins && Object.keys(margins).length
        ? margins
        : orientation === 'landscape'
        ? landscapeMargins
        : portraitMargins;
    this.title = title || '';
    this.subject = subject || '';
    this.creator = creator || 'html-to-docx';
    this.keywords = keywords || ['html-to-docx'];
    this.description = description || '';
    this.lastModifiedBy = lastModifiedBy || 'html-to-docx';
    this.revision = revision || 1;
    this.createdAt = createdAt || new Date();
    this.modifiedAt = modifiedAt || new Date();
    this.headerHTMLString = headerHTMLString;
    this.headerType = headerType || 'default';

    this.lastNumberingId = 0;
    this.lastDocumentRelsId = 2;
    this.lastMediaId = 0;
    this.lastHeaderId = 0;
    this.stylesObjects = [];
    this.numberingObjects = [];
    this.documentRelsObjects = [];
    this.mediaFiles = [];
    this.headerObjects = [];
    this.documentXML = null;

    this.convert = this.convert.bind(this);
    this.generateCoreXML = this.generateCoreXML.bind(this);
    this.generateDocumentXML = this.generateDocumentXML.bind(this);
    this.generateStylesXML = this.generateStylesXML.bind(this);
    this.generateNumberingXML = this.generateNumberingXML.bind(this);
    this.generateDocumentRelsXML = this.generateDocumentRelsXML.bind(this);
    this.createMediaFile = this.createMediaFile.bind(this);
    this.createDocumentRelationships = this.createDocumentRelationships.bind(this);
    this.generateHeaderXML = this.generateHeaderXML.bind(this);
  }

  convert() {
    const documentXML = renderDocumentFile(this);

    this.documentXML = documentXML;
  }

  generateCoreXML() {
    const coreXML = create(
      { encoding: 'UTF-8', standalone: true },
      generateCoreXML(
        this.title,
        this.subject,
        this.creator,
        this.keywords,
        this.description,
        this.lastModifiedBy,
        this.revision,
        this.createdAt,
        this.modifiedAt
      )
    );

    return coreXML.toString({ prettyPrint: true });
  }

  generateDocumentXML() {
    const documentXML = create(
      { encoding: 'UTF-8', standalone: true },
      generateDocumentTemplate(this.width, this.height, this.orientation, this.margins)
    );
    documentXML.root().first().import(this.documentXML);

    if (this.headerObjects && Array.isArray(this.headerObjects) && this.headerObjects.length) {
      const headerXmlFragment = fragment();

      this.headerObjects.forEach(
        // eslint-disable-next-line array-callback-return
        ({ relationshipId, type }) => {
          const headerFragment = fragment({
            namespaceAlias: {
              w: namespaces.w,
              r: namespaces.r,
            },
          })
            .ele('@w', 'headerReference')
            .att('@r', 'id', `rId${relationshipId}`)
            .att('@w', 'type', type)
            .up();
          headerXmlFragment.import(headerFragment);
        }
      );

      documentXML.root().first().first().import(headerXmlFragment);
    }

    return documentXML.toString({ prettyPrint: true });
  }

  // eslint-disable-next-line class-methods-use-this
  generateStylesXML() {
    const stylesXML = create({ encoding: 'UTF-8', standalone: true }, generateStylesXML());

    return stylesXML.toString({ prettyPrint: true });
  }

  generateNumberingXML() {
    const numberingXML = create(
      { encoding: 'UTF-8', standalone: true },
      generateNumberingXMLTemplate()
    );

    const xmlFragment = fragment();

    this.numberingObjects.forEach(
      // eslint-disable-next-line array-callback-return
      ({ numberingId, ordered }) => {
        const numberingFragment = fragment({
          namespaceAlias: { w: namespaces.w },
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
    const fileExtension =
      matches[1].match(/\/(.*?)$/)[1] === 'octet-stream' ? 'png' : matches[1].match(/\/(.*?)$/)[1];
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
        relationshipType = namespaces.hyperlinks;
        break;
      case 'image':
        relationshipType = namespaces.images;
        break;
      case 'header':
        relationshipType = namespaces.headers;
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

  generateHeaderXML(type = 'default') {
    const vTree = convertHTML(this.headerHTMLString);

    const headerXML = create({
      encoding: 'UTF-8',
      standalone: true,
    });
    headerXML.ele(namespaces.w, 'hdr');

    const XMLFragment = fragment();
    convertVTreeToXML(this, vTree, XMLFragment);
    headerXML.root().import(XMLFragment);

    this.lastHeaderId += 1;

    const relationshipId = this.createDocumentRelationships(
      'header',
      `header${this.lastHeaderId}.xml`,
      'Internal'
    );

    this.zip
      .folder('word')
      .file(
        `header${this.lastHeaderId}.xml`,
        Buffer.from(headerXML.toString({ prettyPrint: true }), 'utf-8'),
        {
          createFolders: false,
        }
      );

    this.headerObjects.push({ headerId: this.lastHeaderId, relationshipId, type });
  }
}

export default DocxDocument;
