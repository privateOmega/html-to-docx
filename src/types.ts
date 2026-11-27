/** Page orientation of the document section. */
export type Orientation = 'portrait' | 'landscape';

/** Page margins, in TWIP. */
export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
  header: number;
  footer: number;
  gutter: number;
}

/** Which pages a header or footer applies to. */
export type HeaderFooterType = 'default' | 'first' | 'even';

/** A length in TWIP, or a string with a unit: `px`, `cm` or `in`. */
export type Length = number | string;

export interface LineNumberOptions {
  /** Start of the numbering - 1. Defaults to `0`. */
  start: number;
  /** Number every n-th line. Defaults to `1`. */
  countBy: number;
  restart: 'continuous' | 'newPage' | 'newSection';
}

/**
 * Options accepted by `HTMLtoDOCX`. Every option is optional; see the README
 * for defaults.
 */
export interface DocumentOptions {
  orientation?: Orientation;
  pageSize?: { width?: Length; height?: Length };
  margins?: Partial<Record<keyof PageMargins, Length>>;
  title?: string;
  subject?: string;
  creator?: string;
  keywords?: string[];
  description?: string;
  lastModifiedBy?: string;
  revision?: number;
  createdAt?: Date;
  modifiedAt?: Date;
  headerType?: HeaderFooterType;
  header?: boolean;
  footerType?: HeaderFooterType;
  footer?: boolean;
  font?: string;
  /** Font size in half-points (HIP), or a string in `pt`. */
  fontSize?: number | string;
  /** Complex-script font size in half-points (HIP), or a string in `pt`. */
  complexScriptFontSize?: number | string;
  table?: { row?: { cantSplit?: boolean } };
  pageNumber?: boolean;
  skipFirstHeaderFooter?: boolean;
  lineNumber?: boolean;
  lineNumberOptions?: Partial<LineNumberOptions>;
  numbering?: { defaultOrderedListStyleType?: string };
  decodeUnicode?: boolean;
  lang?: string;
}

/** A relationship entry in a `.rels` part. */
export interface Relationship {
  relationshipId: number;
  type: string;
  target: string;
  targetMode: string;
}

/** The relationships belonging to one part (document, header1, ...). */
export interface RelationshipFile {
  fileName: string;
  lastRelsId: number;
  rels: Relationship[];
}

/** A header or footer part and how the document references it. */
export interface SectionReference {
  relationshipId: number;
  type: HeaderFooterType;
}

export interface HeaderObject extends SectionReference {
  headerId: number;
}

export interface FooterObject extends SectionReference {
  footerId: number;
}

/** Properties of the `<ol>` / `<ul>` VNode a numbering definition was created from. */
export interface NumberingProperties {
  attributes?: Record<string, string>;
  style?: Record<string, string>;
}

export interface NumberingObject {
  numberingId: number;
  type: 'ol' | 'ul';
  properties: NumberingProperties;
}

export interface MediaFile {
  id: number;
  fileContent: string;
  fileNameWithExtension: string;
}
