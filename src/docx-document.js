import { create, fragment } from 'xmlbuilder2';
import { nanoid } from 'nanoid';

import {
  generateCoreXML,
  generateStylesXML,
  generateNumberingXMLTemplate,
  generateThemeXML,
  documentRelsXML as documentRelsXMLString,
  settingsXML as settingsXMLString,
  webSettingsXML as webSettingsXMLString,
  contentTypesXML as contentTypesXMLString,
  fontTableXML as fontTableXMLString,
  genericRelsXML as genericRelsXMLString,
  generateDocumentTemplate,
} from './schemas';
import { convertVTreeToXML } from './helpers';
import namespaces from './namespaces';
import {
  footerType as footerFileType,
  headerType as headerFileType,
  themeType as themeFileType,
  landscapeMargins,
  portraitMargins,
  defaultOrientation,
  landscapeWidth,
  landscapeHeight,
  applicationName,
  defaultFont,
  defaultFontSize,
  hyperlinkType,
  documentFileName,
  imageType,
} from './constants';

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
    headerType,
    header,
    footerType,
    footer,
    font,
    fontSize,
    complexScriptFontSize,
    table,
    pageNumber,
    skipFirstHeaderFooter,
    lineNumber,
    lineNumberOptions,
  }) {
    this.zip = zip;
    this.htmlString = htmlString;
    this.orientation = orientation;
    this.width = orientation === defaultOrientation ? landscapeHeight : landscapeWidth;
    this.height = orientation === defaultOrientation ? landscapeWidth : landscapeHeight;
    this.margins =
      // eslint-disable-next-line no-nested-ternary
      margins && Object.keys(margins).length
        ? margins
        : orientation === defaultOrientation
        ? portraitMargins
        : landscapeMargins;
    this.availableDocumentSpace = this.width - this.margins.left - this.margins.right;
    this.title = title || '';
    this.subject = subject || '';
    this.creator = creator || applicationName;
    this.keywords = keywords || [applicationName];
    this.description = description || '';
    this.lastModifiedBy = lastModifiedBy || applicationName;
    this.revision = revision || 1;
    this.createdAt = createdAt || new Date();
    this.modifiedAt = modifiedAt || new Date();
    this.headerType = headerType || 'default';
    this.header = header || false;
    this.footerType = footerType || 'default';
    this.footer = footer || false;
    this.font = font || defaultFont;
    this.fontSize = fontSize || defaultFontSize;
    this.complexScriptFontSize = complexScriptFontSize || defaultFontSize;
    this.tableRowCantSplit = (table && table.row && table.row.cantSplit) || false;
    this.pageNumber = pageNumber || false;
    this.skipFirstHeaderFooter = skipFirstHeaderFooter || false;
    this.lineNumber = lineNumber ? lineNumberOptions : null;

    this.lastNumberingId = 0;
    this.lastMediaId = 0;
    this.lastHeaderId = 0;
    this.lastFooterId = 0;
    this.stylesObjects = [];
    this.numberingObjects = [];
    this.relationshipFilename = documentFileName;
    this.relationships = [{ fileName: documentFileName, lastRelsId: 4, rels: [] }];
    this.mediaFiles = [];
    this.headerObjects = [];
    this.footerObjects = [];
    this.documentXML = null;

    this.generateContentTypesXML = this.generateContentTypesXML.bind(this);
    this.generateCoreXML = this.generateCoreXML.bind(this);
    this.generateDocumentXML = this.generateDocumentXML.bind(this);
    this.generateSettingsXML = this.generateSettingsXML.bind(this);
    this.generateWebSettingsXML = this.generateWebSettingsXML.bind(this);
    this.generateStylesXML = this.generateStylesXML.bind(this);
    this.generateFontTableXML = this.generateFontTableXML.bind(this);
    this.generateThemeXML = this.generateThemeXML.bind(this);
    this.generateNumberingXML = this.generateNumberingXML.bind(this);
    this.generateRelsXML = this.generateRelsXML.bind(this);
    this.createMediaFile = this.createMediaFile.bind(this);
    this.createDocumentRelationships = this.createDocumentRelationships.bind(this);
    this.generateHeaderXML = this.generateHeaderXML.bind(this);
    this.generateFooterXML = this.generateFooterXML.bind(this);
  }

  generateContentTypesXML() {
    const contentTypesXML = create({ encoding: 'UTF-8', standalone: true }, contentTypesXMLString);

    if (this.headerObjects && Array.isArray(this.headerObjects) && this.headerObjects.length) {
      this.headerObjects.forEach(
        // eslint-disable-next-line array-callback-return
        ({ headerId }) => {
          const contentTypesFragment = fragment({
            defaultNamespace: {
              ele: namespaces.contentTypes,
            },
          })
            .ele('Override')
            .att('PartName', `/word/header${headerId}.xml`)
            .att(
              'ContentType',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml'
            )
            .up();
          contentTypesXML.root().import(contentTypesFragment);
        }
      );
    }
    if (this.footerObjects && Array.isArray(this.footerObjects) && this.footerObjects.length) {
      this.footerObjects.forEach(
        // eslint-disable-next-line array-callback-return
        ({ footerId }) => {
          const contentTypesFragment = fragment({
            defaultNamespace: {
              ele: namespaces.contentTypes,
            },
          })
            .ele('Override')
            .att('PartName', `/word/footer${footerId}.xml`)
            .att(
              'ContentType',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml'
            )
            .up();
          contentTypesXML.root().import(contentTypesFragment);
        }
      );
    }

    return contentTypesXML.toString({ prettyPrint: true });
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

    if (
      this.header &&
      this.headerObjects &&
      Array.isArray(this.headerObjects) &&
      this.headerObjects.length
    ) {
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
    if (
      this.footer &&
      this.footerObjects &&
      Array.isArray(this.footerObjects) &&
      this.footerObjects.length
    ) {
      const footerXmlFragment = fragment();

      this.footerObjects.forEach(
        // eslint-disable-next-line array-callback-return
        ({ relationshipId, type }) => {
          const footerFragment = fragment({
            namespaceAlias: {
              w: namespaces.w,
              r: namespaces.r,
            },
          })
            .ele('@w', 'footerReference')
            .att('@r', 'id', `rId${relationshipId}`)
            .att('@w', 'type', type)
            .up();
          footerXmlFragment.import(footerFragment);
        }
      );

      documentXML.root().first().first().import(footerXmlFragment);
    }
    if ((this.header || this.footer) && this.skipFirstHeaderFooter) {
      const titlePageFragment = fragment({
        namespaceAlias: {
          w: namespaces.w,
        },
      }).ele('@w', 'titlePg');

      documentXML.root().first().first().import(titlePageFragment);
    }
    if (this.lineNumber) {
      const { countBy, start, restart } = this.lineNumber;
      const lineNumberFragment = fragment({
        namespaceAlias: {
          w: namespaces.w,
        },
      })
        .ele('@w', 'lnNumType')
        .att('@w', 'countBy', countBy)
        .att('@w', 'start', start)
        .att('@w', 'restart', restart);
      documentXML.root().first().first().import(lineNumberFragment);
    }

    return documentXML.toString({ prettyPrint: true });
  }

  // eslint-disable-next-line class-methods-use-this
  generateSettingsXML() {
    const settingsXML = create({ encoding: 'UTF-8', standalone: true }, settingsXMLString);

    return settingsXML.toString({ prettyPrint: true });
  }

  // eslint-disable-next-line class-methods-use-this
  generateWebSettingsXML() {
    const webSettingsXML = create({ encoding: 'UTF-8', standalone: true }, webSettingsXMLString);

    return webSettingsXML.toString({ prettyPrint: true });
  }

  // eslint-disable-next-line class-methods-use-this
  generateStylesXML() {
    const stylesXML = create(
      { encoding: 'UTF-8', standalone: true },
      generateStylesXML(this.font, this.fontSize, this.complexScriptFontSize)
    );

    return stylesXML.toString({ prettyPrint: true });
  }

  // eslint-disable-next-line class-methods-use-this
  generateFontTableXML() {
    const fontTableXML = create({ encoding: 'UTF-8', standalone: true }, fontTableXMLString);

    return fontTableXML.toString({ prettyPrint: true });
  }

  // eslint-disable-next-line class-methods-use-this
  generateThemeXML() {
    const themeXml = create({ encoding: 'UTF-8', standalone: true }, generateThemeXML(this.font));

    return themeXml.toString({ prettyPrint: true });
  }

  generateNumberingXML() {
    const numberingXML = create(
      { encoding: 'UTF-8', standalone: true },
      generateNumberingXMLTemplate()
    );

    const abstractNumberingFragments = fragment();
    const numberingFragments = fragment();

    this.numberingObjects.forEach(
      // eslint-disable-next-line array-callback-return
      ({ numberingId, listElements }) => {
        const abstractNumberingFragment = fragment({
          namespaceAlias: { w: namespaces.w },
        })
          .ele('@w', 'abstractNum')
          .att('@w', 'abstractNumId', String(numberingId))
          .ele('@w', 'multiLevelType')
          .att('@w', 'val', 'hybridMultilevel')
          .up();

        listElements
          .filter((value, index, self) => self.findIndex((v) => v.level === value.level) === index)
          .forEach(({ level, type }) => {
            const levelFragment = fragment({
              namespaceAlias: { w: namespaces.w },
            })
              .ele('@w', 'lvl')
              .att('@w', 'ilvl', level)
              .ele('@w', 'start')
              .att('@w', 'val', '1')
              .up()
              .ele('@w', 'numFmt')
              .att('@w', 'val', type === 'ol' ? 'decimal' : 'bullet')
              .up()
              .ele('@w', 'lvlText')
              .att('@w', 'val', type === 'ol' ? `%${level + 1}` : '')
              .up()
              .ele('@w', 'lvlJc')
              .att('@w', 'val', 'left')
              .up()
              .ele('@w', 'pPr')
              .ele('@w', 'tabs')
              .ele('@w', 'tab')
              .att('@w', 'val', 'num')
              .att('@w', 'pos', (level + 1) * 720)
              .up()
              .up()
              .ele('@w', 'ind')
              .att('@w', 'left', (level + 1) * 720)
              .att('@w', 'hanging', 360)
              .up()
              .up()
              .up();

            if (type === 'ul') {
              const runPropertiesFragment = fragment({
                namespaceAlias: { w: namespaces.w },
              })
                .ele('@w', 'rPr')
                .ele('@w', 'rFonts')
                .att('@w', 'ascii', 'Wingdings')
                .att('@w', 'hAnsi', 'Wingdings')
                .att('@w', 'hint', 'default')
                .up()
                .up();

              levelFragment.last().import(runPropertiesFragment);
            }

            abstractNumberingFragment.import(levelFragment);
          });

        abstractNumberingFragment.up();

        const numberingFragment = fragment({
          namespaceAlias: { w: namespaces.w },
        })
          .ele('@w', 'num')
          .att('@w', 'numId', String(numberingId))
          .ele('@w', 'abstractNumId')
          .att('@w', 'val', String(numberingId))
          .up()
          .up();

        abstractNumberingFragments.import(abstractNumberingFragment);
        numberingFragments.import(numberingFragment);
      }
    );

    numberingXML.root().import(abstractNumberingFragments);
    numberingXML.root().import(numberingFragments);

    return numberingXML.toString({ prettyPrint: true });
  }

  // eslint-disable-next-line class-methods-use-this
  appendRelationships(xmlFragment, relationships) {
    relationships.forEach(
      // eslint-disable-next-line array-callback-return
      ({ relationshipId, type, target, targetMode }) => {
        const relationshipFragment = fragment({
          defaultNamespace: { ele: namespaces.relationship },
        })
          .ele('Relationship')
          .att('Id', `rId${relationshipId}`)
          .att('Type', type)
          .att('Target', target)
          .att('TargetMode', targetMode)
          .up();

        xmlFragment.import(relationshipFragment);
      }
    );
  }

  generateRelsXML() {
    const relationshipXMLStrings = this.relationships.map(({ fileName, rels }) => {
      let xmlFragment;
      if (fileName === documentFileName) {
        xmlFragment = create({ encoding: 'UTF-8', standalone: true }, documentRelsXMLString);
      } else {
        xmlFragment = create({ encoding: 'UTF-8', standalone: true }, genericRelsXMLString);
      }
      this.appendRelationships(xmlFragment.root(), rels);

      return {
        fileName,
        xmlString: xmlFragment.toString({ prettyPrint: true }),
      };
    });

    return relationshipXMLStrings;
  }

  createNumbering(listElements) {
    this.lastNumberingId += 1;
    this.numberingObjects.push({ numberingId: this.lastNumberingId, listElements });

    return this.lastNumberingId;
  }

  createMediaFile(base64String) {
    // eslint-disable-next-line no-useless-escape
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches.length !== 3) {
      throw new Error('Invalid base64 string');
    }

    const base64FileContent = matches[2];
    // matches array contains file type in base64 format - image/jpeg and base64 stringified data
    const fileExtension =
      matches[1].match(/\/(.*?)$/)[1] === 'octet-stream' ? 'png' : matches[1].match(/\/(.*?)$/)[1];

    const fileNameWithExtension = `image-${nanoid()}.${fileExtension}`;

    this.lastMediaId += 1;

    return { id: this.lastMediaId, fileContent: base64FileContent, fileNameWithExtension };
  }

  createDocumentRelationships(fileName = 'document', type, target, targetMode = 'External') {
    let relationshipObject = this.relationships.find(
      (relationship) => relationship.fileName === fileName
    );
    let lastRelsId = 1;
    if (relationshipObject) {
      lastRelsId = relationshipObject.lastRelsId + 1;
      relationshipObject.lastRelsId = lastRelsId;
    } else {
      relationshipObject = { fileName, lastRelsId, rels: [] };
      this.relationships.push(relationshipObject);
    }
    let relationshipType;
    switch (type) {
      case hyperlinkType:
        relationshipType = namespaces.hyperlinks;
        break;
      case imageType:
        relationshipType = namespaces.images;
        break;
      case headerFileType:
        relationshipType = namespaces.headers;
        break;
      case footerFileType:
        relationshipType = namespaces.footers;
        break;
      case themeFileType:
        relationshipType = namespaces.themes;
        break;
    }

    relationshipObject.rels.push({
      relationshipId: lastRelsId,
      type: relationshipType,
      target,
      targetMode,
    });

    return lastRelsId;
  }

  generateHeaderXML(vTree) {
    const headerXML = create({
      encoding: 'UTF-8',
      standalone: true,
      namespaceAlias: {
        w: namespaces.w,
        ve: namespaces.ve,
        o: namespaces.o,
        r: namespaces.r,
        v: namespaces.v,
        wp: namespaces.wp,
        w10: namespaces.w10,
      },
    }).ele('@w', 'hdr');

    const XMLFragment = fragment();
    convertVTreeToXML(this, vTree, XMLFragment);
    headerXML.root().import(XMLFragment);

    this.lastHeaderId += 1;

    return { headerId: this.lastHeaderId, headerXML };
  }

  generateFooterXML(vTree) {
    const footerXML = create({
      encoding: 'UTF-8',
      standalone: true,
      namespaceAlias: {
        w: namespaces.w,
        ve: namespaces.ve,
        o: namespaces.o,
        r: namespaces.r,
        v: namespaces.v,
        wp: namespaces.wp,
        w10: namespaces.w10,
      },
    }).ele('@w', 'ftr');

    const XMLFragment = fragment();
    convertVTreeToXML(this, vTree, XMLFragment);
    if (XMLFragment.first().node.tagName === 'p' && this.pageNumber) {
      const fieldSimpleFragment = fragment({
        namespaceAlias: {
          w: namespaces.w,
        },
      })
        .ele('@w', 'fldSimple')
        .att('@w', 'instr', 'PAGE')
        .ele('@w', 'r')
        .up()
        .up();
      XMLFragment.first().import(fieldSimpleFragment);
    }
    footerXML.root().import(XMLFragment);

    this.lastFooterId += 1;

    return { footerId: this.lastFooterId, footerXML };
  }
}

export default DocxDocument;
