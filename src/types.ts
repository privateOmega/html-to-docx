import type generateContainer from './index';

// Public option types are declared on the generateContainer namespace in
// src/index.ts (see the comment there); these aliases keep internal imports short.
export type Orientation = generateContainer.Orientation;
export type PageMargins = generateContainer.PageMargins;
export type HeaderFooterType = generateContainer.HeaderFooterType;
export type Length = generateContainer.Length;
export type LineNumberOptions = generateContainer.LineNumberOptions;
export type DocumentOptions = generateContainer.DocumentOptions;

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
