import { create, fragment } from 'xmlbuilder2';
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import type JSZip from 'jszip';
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
  defaultLang,
  hyperlinkType,
  documentFileName,
  imageType,
  defaultDocumentOptions,
} from './constants';
import ListStyleBuilder, { type NumberingDefaults } from './utils/list';
import { fontFamilyToTableObject, type FontTableObject } from './utils/font-family-conversion';
import type {
  DocumentOptions,
  FooterObject,
  HeaderFooterType,
  HeaderObject,
  LineNumberOptions,
  MediaFile,
  NumberingObject,
  NumberingProperties,
  Orientation,
  PageMargins,
  Relationship,
  RelationshipFile,
  SectionReference,
} from './types';

/**
 * Options after defaults are merged and units are normalized to numbers,
 * as passed to the DocxDocument constructor.
 */
export interface DocxDocumentProperties extends Omit<
  DocumentOptions,
  'pageSize' | 'margins' | 'fontSize' | 'complexScriptFontSize'
> {
  zip: JSZip;
  htmlString: string;
  orientation: Orientation;
  pageSize?: { width?: number; height?: number };
  margins?: PageMargins;
  fontSize?: number;
  complexScriptFontSize?: number;
}

type SectionType = 'header' | 'footer';

/**
 * xmlbuilder2 types attribute values as strings but stringifies values itself,
 * and treats null/undefined specially. Passing values through unchanged keeps
 * the generated XML identical while satisfying its types.
 */
const attr = (value: string | number | null | undefined) => value as string;

function generateContentTypesFragments(
  contentTypesXML: XMLBuilder,
  type: SectionType,
  objects: Array<HeaderObject | FooterObject>,
) {
  if (objects && Array.isArray(objects)) {
    objects.forEach((object) => {
      const contentTypesFragment = fragment({ defaultNamespace: { ele: namespaces.contentTypes } })
        .ele('Override')
        .att(
          'PartName',
          `/word/${type}${(object as unknown as Record<string, unknown>)[`${type}Id`]}.xml`,
        )
        .att(
          'ContentType',
          `application/vnd.openxmlformats-officedocument.wordprocessingml.${type}+xml`,
        )
        .up();

      contentTypesXML.root().import(contentTypesFragment);
    });
  }
}

function generateSectionReferenceXML(
  documentXML: XMLBuilder,
  documentSectionType: SectionType,
  objects: SectionReference[],
  isEnabled: boolean,
) {
  if (isEnabled && objects && Array.isArray(objects) && objects.length) {
    const xmlFragment = fragment();
    objects.forEach(({ relationshipId, type }) => {
      const objectFragment = fragment({ namespaceAlias: { w: namespaces.w, r: namespaces.r } })
        .ele('@w', `${documentSectionType}Reference`)
        .att('@r', 'id', `rId${relationshipId}`)
        .att('@w', 'type', type)
        .up();
      xmlFragment.import(objectFragment);
    });

    documentXML.root().first().first().import(xmlFragment);
  }
}

function generateXMLString(xmlString: string) {
  const xmlDocumentString = create({ encoding: 'UTF-8', standalone: true }, xmlString);
  return xmlDocumentString.toString({ prettyPrint: true });
}

async function generateSectionXML(
  this: DocxDocument,
  vTree: unknown,
  type: SectionType = 'header',
): Promise<{ id: number; xml: XMLBuilder }> {
  const sectionXML = create({
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
  }).ele('@w', type === 'header' ? 'hdr' : 'ftr');

  const XMLFragment = fragment();
  await convertVTreeToXML(this, vTree, XMLFragment);
  if (
    type === 'footer' &&
    (XMLFragment.first().node as unknown as Element).tagName === 'p' &&
    this.pageNumber
  ) {
    XMLFragment.first().import(
      fragment({ namespaceAlias: { w: namespaces.w } })
        .ele('@w', 'fldSimple')
        .att('@w', 'instr', 'PAGE')
        .ele('@w', 'r')
        .up()
        .up(),
    );
  }
  sectionXML.root().import(XMLFragment);

  if (type === 'header') {
    this.lastHeaderId += 1;
    return { id: this.lastHeaderId, xml: sectionXML };
  }
  this.lastFooterId += 1;
  return { id: this.lastFooterId, xml: sectionXML };
}

class DocxDocument {
  zip: JSZip;
  htmlString: string;
  orientation: Orientation;
  pageSize: { width?: number; height?: number };
  width: number;
  height: number;
  margins: PageMargins;
  availableDocumentSpace: number;
  title: string;
  subject: string;
  creator: string;
  keywords: string[];
  description: string;
  lastModifiedBy: string;
  revision: number;
  createdAt: Date;
  modifiedAt: Date;
  headerType: HeaderFooterType;
  header: boolean;
  footerType: HeaderFooterType;
  footer: boolean;
  font: string;
  fontSize: number;
  complexScriptFontSize: number;
  lang: string;
  tableRowCantSplit: boolean;
  pageNumber: boolean;
  skipFirstHeaderFooter: boolean;
  lineNumber: Partial<LineNumberOptions> | null | undefined;

  lastNumberingId: number;
  lastMediaId: number;
  lastHeaderId: number;
  lastFooterId: number;
  stylesObjects: unknown[];
  numberingObjects: NumberingObject[];
  fontTableObjects: FontTableObject[];
  relationshipFilename: string;
  relationships: RelationshipFile[];
  mediaFiles: MediaFile[];
  headerObjects: HeaderObject[];
  footerObjects: FooterObject[];
  documentXML: XMLBuilder | null;

  generateSectionXML: OmitThisParameter<typeof generateSectionXML>;
  ListStyleBuilder: ListStyleBuilder;

  constructor(properties: DocxDocumentProperties) {
    this.zip = properties.zip;
    this.htmlString = properties.htmlString;
    this.orientation = properties.orientation;
    this.pageSize = properties.pageSize || defaultDocumentOptions.pageSize;

    const isPortraitOrientation = this.orientation === defaultOrientation;
    const height = this.pageSize.height ? this.pageSize.height : landscapeHeight;
    const width = this.pageSize.width ? this.pageSize.width : landscapeWidth;

    this.width = isPortraitOrientation ? width : height;
    this.height = isPortraitOrientation ? height : width;

    const marginsObject = properties.margins;
    this.margins =
      // eslint-disable-next-line no-nested-ternary
      marginsObject && Object.keys(marginsObject).length
        ? marginsObject
        : isPortraitOrientation
          ? portraitMargins
          : landscapeMargins;

    this.availableDocumentSpace = this.width - this.margins.left - this.margins.right;
    this.title = properties.title || '';
    this.subject = properties.subject || '';
    this.creator = properties.creator || applicationName;
    this.keywords = properties.keywords || [applicationName];
    this.description = properties.description || '';
    this.lastModifiedBy = properties.lastModifiedBy || applicationName;
    this.revision = properties.revision || 1;
    this.createdAt = properties.createdAt || new Date();
    this.modifiedAt = properties.modifiedAt || new Date();
    this.headerType = properties.headerType || 'default';
    this.header = properties.header || false;
    this.footerType = properties.footerType || 'default';
    this.footer = properties.footer || false;
    this.font = properties.font || defaultFont;
    this.fontSize = properties.fontSize || defaultFontSize;
    this.complexScriptFontSize = properties.complexScriptFontSize || defaultFontSize;
    this.lang = properties.lang || defaultLang;
    this.tableRowCantSplit =
      (properties.table && properties.table.row && properties.table.row.cantSplit) || false;
    this.pageNumber = properties.pageNumber || false;
    this.skipFirstHeaderFooter = properties.skipFirstHeaderFooter || false;
    this.lineNumber = properties.lineNumber ? properties.lineNumberOptions : null;

    this.lastNumberingId = 0;
    this.lastMediaId = 0;
    this.lastHeaderId = 0;
    this.lastFooterId = 0;
    this.stylesObjects = [];
    this.numberingObjects = [];
    this.fontTableObjects = [];
    this.relationshipFilename = documentFileName;
    this.relationships = [{ fileName: documentFileName, lastRelsId: 5, rels: [] }];
    this.mediaFiles = [];
    this.headerObjects = [];
    this.footerObjects = [];
    this.documentXML = null;

    this.generateContentTypesXML = this.generateContentTypesXML.bind(this);
    this.generateDocumentXML = this.generateDocumentXML.bind(this);
    this.generateCoreXML = this.generateCoreXML.bind(this);
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
    this.generateSectionXML = generateSectionXML.bind(this);

    // The numbering option is passed through as-is; a missing
    // defaultOrderedListStyleType is handled by ListStyleBuilder's callers.
    this.ListStyleBuilder = new ListStyleBuilder(
      properties.numbering as NumberingDefaults | undefined,
    );
  }

  generateContentTypesXML() {
    const contentTypesXML = create({ encoding: 'UTF-8', standalone: true }, contentTypesXMLString);

    generateContentTypesFragments(contentTypesXML, 'header', this.headerObjects);
    generateContentTypesFragments(contentTypesXML, 'footer', this.footerObjects);

    return contentTypesXML.toString({ prettyPrint: true });
  }

  generateDocumentXML() {
    const documentXML = create(
      { encoding: 'UTF-8', standalone: true },
      generateDocumentTemplate(this.width, this.height, this.orientation, this.margins),
    );
    documentXML.root().first().import(this.documentXML!);

    generateSectionReferenceXML(documentXML, 'header', this.headerObjects, this.header);
    generateSectionReferenceXML(documentXML, 'footer', this.footerObjects, this.footer);

    if ((this.header || this.footer) && this.skipFirstHeaderFooter) {
      documentXML
        .root()
        .first()
        .first()
        .import(fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'titlePg'));
    }
    if (this.lineNumber) {
      const { countBy, start, restart } = this.lineNumber;
      documentXML
        .root()
        .first()
        .first()
        .import(
          fragment({ namespaceAlias: { w: namespaces.w } })
            .ele('@w', 'lnNumType')
            .att('@w', 'countBy', attr(countBy))
            .att('@w', 'start', attr(start))
            .att('@w', 'restart', attr(restart)),
        );
    }

    return documentXML.toString({ prettyPrint: true });
  }

  generateCoreXML() {
    return generateXMLString(
      generateCoreXML(
        this.title,
        this.subject,
        this.creator,
        this.keywords,
        this.description,
        this.lastModifiedBy,
        this.revision,
        this.createdAt,
        this.modifiedAt,
      ),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  generateSettingsXML() {
    return generateXMLString(settingsXMLString);
  }

  // eslint-disable-next-line class-methods-use-this
  generateWebSettingsXML() {
    return generateXMLString(webSettingsXMLString);
  }

  generateStylesXML() {
    return generateXMLString(
      generateStylesXML(this.font, this.fontSize, this.complexScriptFontSize, this.lang),
    );
  }

  generateFontTableXML() {
    const fontTableXML = create({ encoding: 'UTF-8', standalone: true }, fontTableXMLString);
    const fontNames = [
      'Arial',
      'Calibri',
      'Calibri Light',
      'Courier New',
      'Symbol',
      'Times New Roman',
    ];
    this.fontTableObjects.forEach(({ fontName, genericFontName }) => {
      if (!fontNames.includes(fontName)) {
        fontNames.push(fontName);
        const fontFragment = fragment({
          namespaceAlias: { w: namespaces.w },
        })
          .ele('@w', 'font')
          .att('@w', 'name', fontName);

        switch (genericFontName) {
          case 'serif':
            fontFragment.ele('@w', 'altName').att('@w', 'val', 'Times New Roman');
            fontFragment.ele('@w', 'family').att('@w', 'val', 'roman');
            fontFragment.ele('@w', 'pitch').att('@w', 'val', 'variable');
            break;
          case 'sans-serif':
            fontFragment.ele('@w', 'altName').att('@w', 'val', 'Arial');
            fontFragment.ele('@w', 'family').att('@w', 'val', 'swiss');
            fontFragment.ele('@w', 'pitch').att('@w', 'val', 'variable');
            break;
          case 'monospace':
            fontFragment.ele('@w', 'altName').att('@w', 'val', 'Courier New');
            fontFragment.ele('@w', 'family').att('@w', 'val', 'modern');
            fontFragment.ele('@w', 'pitch').att('@w', 'val', 'fixed');
            break;
          default:
            break;
        }

        fontTableXML.root().import(fontFragment);
      }
    });

    return fontTableXML.toString({ prettyPrint: true });
  }

  generateThemeXML() {
    return generateXMLString(generateThemeXML(this.font));
  }

  generateNumberingXML() {
    const numberingXML = create(
      { encoding: 'UTF-8', standalone: true },
      generateNumberingXMLTemplate(),
    );

    const abstractNumberingFragments = fragment();
    const numberingFragments = fragment();

    this.numberingObjects.forEach(({ numberingId, type, properties }) => {
      const abstractNumberingFragment = fragment({ namespaceAlias: { w: namespaces.w } })
        .ele('@w', 'abstractNum')
        .att('@w', 'abstractNumId', String(numberingId));

      [...Array(8).keys()].forEach((level) => {
        const levelFragment = fragment({ namespaceAlias: { w: namespaces.w } })
          .ele('@w', 'lvl')
          .att('@w', 'ilvl', attr(level))
          .ele('@w', 'start')
          .att(
            '@w',
            'val',
            attr(
              type === 'ol'
                ? (properties.attributes && properties.attributes['data-start']) || 1
                : '1',
            ),
          )
          .up()
          .ele('@w', 'numFmt')
          .att(
            '@w',
            'val',
            type === 'ol'
              ? this.ListStyleBuilder.getListStyleType(
                  properties.style && properties.style['list-style-type'],
                )
              : 'bullet',
          )
          .up()
          .ele('@w', 'lvlText')
          .att(
            '@w',
            'val',
            type === 'ol'
              ? this.ListStyleBuilder.getListPrefixSuffix(properties.style, level)
              : '',
          )
          .up()
          .ele('@w', 'lvlJc')
          .att('@w', 'val', 'left')
          .up()
          .ele('@w', 'pPr')
          .ele('@w', 'tabs')
          .ele('@w', 'tab')
          .att('@w', 'val', 'num')
          .att('@w', 'pos', attr((level + 1) * 720))
          .up()
          .up()
          .ele('@w', 'ind')
          .att('@w', 'left', attr((level + 1) * 720))
          .att('@w', 'hanging', attr(360))
          .up()
          .up()
          .up();

        if (type === 'ul') {
          levelFragment.last().import(
            fragment({ namespaceAlias: { w: namespaces.w } })
              .ele('@w', 'rPr')
              .ele('@w', 'rFonts')
              .att('@w', 'ascii', 'Symbol')
              .att('@w', 'hAnsi', 'Symbol')
              .att('@w', 'hint', 'default')
              .up()
              .up(),
          );
        }
        abstractNumberingFragment.import(levelFragment);
      });
      abstractNumberingFragment.up();
      abstractNumberingFragments.import(abstractNumberingFragment);

      numberingFragments.import(
        fragment({ namespaceAlias: { w: namespaces.w } })
          .ele('@w', 'num')
          .att('@w', 'numId', String(numberingId))
          .ele('@w', 'abstractNumId')
          .att('@w', 'val', String(numberingId))
          .up()
          .up(),
      );
    });

    numberingXML.root().import(abstractNumberingFragments);
    numberingXML.root().import(numberingFragments);

    return numberingXML.toString({ prettyPrint: true });
  }

  // eslint-disable-next-line class-methods-use-this
  appendRelationships(xmlFragment: XMLBuilder, relationships: Relationship[]) {
    relationships.forEach(({ relationshipId, type, target, targetMode }) => {
      xmlFragment.import(
        fragment({ defaultNamespace: { ele: namespaces.relationship } })
          .ele('Relationship')
          .att('Id', `rId${relationshipId}`)
          .att('Type', type)
          .att('Target', target)
          .att('TargetMode', targetMode)
          .up(),
      );
    });
  }

  generateRelsXML() {
    const relationshipXMLStrings = this.relationships.map(({ fileName, rels }) => {
      const xmlFragment = create(
        { encoding: 'UTF-8', standalone: true },
        fileName === documentFileName ? documentRelsXMLString : genericRelsXMLString,
      );
      this.appendRelationships(xmlFragment.root(), rels);

      return { fileName, xmlString: xmlFragment.toString({ prettyPrint: true }) };
    });

    return relationshipXMLStrings;
  }

  createNumbering(type: NumberingObject['type'], properties: NumberingProperties) {
    this.lastNumberingId += 1;
    this.numberingObjects.push({ numberingId: this.lastNumberingId, type, properties });

    return this.lastNumberingId;
  }

  createFont(fontFamily: string | undefined) {
    const fontTableObject = fontFamilyToTableObject(fontFamily, this.font);
    this.fontTableObjects.push(fontTableObject);
    return fontTableObject.fontName;
  }

  createMediaFile(base64String: string): MediaFile {
    // Non-null assertions keep the existing behaviour: a non-matching string
    // throws a TypeError here, which callers currently swallow.
    // eslint-disable-next-line no-useless-escape
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)!;
    if (matches.length !== 3) {
      throw new Error('Invalid base64 string');
    }

    const base64FileContent = matches[2]!;
    // matches array contains file type in base64 format - image/jpeg and base64 stringified data
    const fileExtension =
      matches[1]!.match(/\/(.*?)$/)![1] === 'octet-stream'
        ? 'png'
        : matches[1]!.match(/\/(.*?)$/)![1];

    const fileNameWithExtension = `image-${nanoid()}.${fileExtension}`;

    this.lastMediaId += 1;

    return { id: this.lastMediaId, fileContent: base64FileContent, fileNameWithExtension };
  }

  createDocumentRelationships(
    fileName = 'document',
    type: string,
    target: string,
    targetMode = 'External',
  ): number {
    let relationshipObject = this.relationships.find(
      (relationship) => relationship.fileName === fileName,
    );
    let lastRelsId = 1;
    if (relationshipObject) {
      lastRelsId = relationshipObject.lastRelsId + 1;
      relationshipObject.lastRelsId = lastRelsId;
    } else {
      relationshipObject = { fileName, lastRelsId, rels: [] };
      this.relationships.push(relationshipObject);
    }
    let relationshipType: string | undefined;
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
      type: relationshipType as string,
      target,
      targetMode,
    });

    return lastRelsId;
  }

  async generateHeaderXML(vTree: unknown) {
    const { id, xml } = await this.generateSectionXML(vTree, 'header');
    return { headerId: id, headerXML: xml };
  }

  async generateFooterXML(vTree: unknown) {
    const { id, xml } = await this.generateSectionXML(vTree, 'footer');
    return { footerId: id, footerXML: xml };
  }
}

export default DocxDocument;
