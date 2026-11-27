/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
/* eslint-disable no-param-reassign */
/* eslint-disable no-case-declarations */
/* eslint-disable no-plusplus */
/* eslint-disable no-else-return */
import isVNodeImpl from 'virtual-dom/vnode/is-vnode.js';
import isVTextImpl from 'virtual-dom/vnode/is-vtext.js';

export type VTree = VirtualDOM.VTree;

export type VNodeType = VirtualDOM.VNode;

export type VTextType = VirtualDOM.VText;

// virtual-dom's guards are typed for VTree but are called here with null and
// other values too; they return false for those at runtime.
export const isVNode = (value: unknown): value is VNodeType => isVNodeImpl(value as VTree);

export const isVText = (value: unknown): value is VTextType => isVTextImpl(value as VTree);
// Element fields are read on children that are VNodes at runtime; VText
// children have no tagName/properties (undefined), as before.

export const asVNode = (vTree: VTree) => vTree as VNodeType;
/** Warns that an image could not be downloaded or read and is left out. */
export const warnImageSkipped = (error: unknown) => {
  // eslint-disable-next-line no-console
  console.warn(`html-to-docx: skipping image that could not be loaded: ${error}`);
};

/** Border widths per side plus shared stroke and color, as built by buildTable. */
export interface BorderSpec {
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  insideV?: number | string;
  insideH?: number | string;
  stroke?: string;
  color?: string;
  [side: string]: number | string | undefined;
}

/** Pending row spans keyed by column index. */
export type RowSpanMap = Map<number, { rowSpan: number; colSpan: number }>;

/** Mutable column cursor shared while building a table row. */
export interface ColumnIndex {
  index: number;
}

/**
 * Styling and layout attributes threaded through the builders. Run-level keys
 * (color, font, fontSize, strong, ...) are also iterated dynamically by
 * buildRunProperties, hence the index signature.
 */
export interface BuilderAttributes {
  // run formatting
  color?: string;
  backgroundColor?: string;
  highlightColor?: string;
  font?: string;
  fontSize?: number;
  strong?: string | boolean;
  hyperlink?: boolean;
  // paragraph formatting
  isParagraph?: boolean;
  paragraphStyle?: string;
  textAlign?: string;
  verticalAlign?: string;
  lineHeight?: number;
  beforeSpacing?: number;
  afterSpacing?: number;
  indentation?: { left?: number; right?: number };
  numbering?: { levelId: number; numberingId: number };
  display?: string;
  // sizing
  width?: number | string;
  height?: number | string;
  maximumWidth?: number;
  // tables
  tableBorder?: BorderSpec;
  tableCellBorder?: BorderSpec;
  tableCellSpacing?: number;
  tableRowHeight?: number;
  rowCantSplit?: boolean;
  rowSpan?: number | string;
  colSpan?: number;
  // images
  type?: string;
  inlineOrAnchored?: boolean;
  relationshipId?: number;
  id?: number;
  fileContent?: string;
  fileNameWithExtension?: string;
  description?: string;
  originalWidth?: number;
  originalHeight?: number;
  [key: string]: unknown;
}
