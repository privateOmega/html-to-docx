/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
/* eslint-disable no-param-reassign */
/* eslint-disable no-case-declarations */
/* eslint-disable no-plusplus */
/* eslint-disable no-else-return */
import { fragment } from 'xmlbuilder2';
import namespaces from '../../namespaces';
import { pixelRegex, percentageRegex, pixelToTWIP } from '../../utils/unit-conversion';
// FIXME: remove the cyclic dependency
// eslint-disable-next-line import/no-cycle
import { buildImage, buildList } from '../render-document-file';
import { vNodeHasChildren } from '../../utils/vnode';
import { attr } from '../../utils/xml';
import type DocxDocument from '../../docx-document';
import { isVNode, asVNode } from './shared';
import type { VNodeType, BorderSpec, RowSpanMap, ColumnIndex, BuilderAttributes } from './shared';
import { fixupRowHeight, fixupColumnWidth, cssBorderParser } from './fixups';
import { buildShading, buildBorder, modifiedStyleAttributesBuilder } from './formatting';
import { buildHorizontalAlignment, buildParagraph } from './paragraph';

export const buildTableRowHeight = (tableRowHeight: number) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'trHeight')
    .att('@w', 'val', attr(tableRowHeight))
    .att('@w', 'hRule', attr('atLeast'))
    .up();

export const buildVerticalAlignment = (verticalAlignment: string) => {
  if (verticalAlignment.toLowerCase() === 'middle') {
    verticalAlignment = 'center';
  }

  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'vAlign')
    .att('@w', 'val', attr(verticalAlignment))
    .up();
};

export const buildVerticalMerge = (verticalMerge: string = 'continue') =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'vMerge')
    .att('@w', 'val', attr(verticalMerge))
    .up();

export const buildGridSpanFragment = (spanValue: number) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'gridSpan')
    .att('@w', 'val', attr(spanValue))
    .up();

export const buildTableCellSpacing = (cellSpacing = 0) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'tblCellSpacing')
    .att('@w', 'w', attr(cellSpacing))
    .att('@w', 'type', attr('dxa'))
    .up();

export const buildTableCellBorders = (tableCellBorder: BorderSpec) => {
  const tableCellBordersFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'tcBorders',
  );

  const { color, stroke, ...borders } = tableCellBorder;
  Object.keys(borders).forEach((border) => {
    if (tableCellBorder[border]) {
      const borderFragment = buildBorder(border, tableCellBorder[border], 0, color, stroke);
      tableCellBordersFragment.import(borderFragment);
    }
  });

  tableCellBordersFragment.up();

  return tableCellBordersFragment;
};

/**
 * Builds <w:tcW> for a CSS width. Absolute units become twips (dxa);
 * percentages use fiftieths of a percent (5000 = 100%), the unit every Word
 * version understands; `auto` is kept. Other values (em, unitless, …) return
 * null so the cell sizes automatically.
 */
export const buildTableCellWidth = (tableCellWidth: number | string) => {
  const widthString = String(tableCellWidth).trim();
  let width: number;
  let type: string;
  const twips = fixupColumnWidth(tableCellWidth);
  if (twips !== undefined) {
    width = twips;
    type = 'dxa';
  } else if (percentageRegex.test(widthString)) {
    width = Math.round(Number(widthString.match(percentageRegex)![1]) * 50);
    type = 'pct';
  } else if (widthString === 'auto') {
    width = 0;
    type = 'auto';
  } else {
    return null;
  }
  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'tcW')
    .att('@w', 'w', attr(width))
    .att('@w', 'type', attr(type))
    .up();
};

export const buildTableCellProperties = (attributes: BuilderAttributes) => {
  const tableCellPropertiesFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'tcPr',
  );
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      switch (key) {
        case 'backgroundColor':
          const shadingFragment = buildShading(attributes[key]!);
          tableCellPropertiesFragment.import(shadingFragment);
          // eslint-disable-next-line no-param-reassign
          delete attributes.backgroundColor;
          break;
        case 'verticalAlign':
          const verticalAlignmentFragment = buildVerticalAlignment(attributes[key]!);
          tableCellPropertiesFragment.import(verticalAlignmentFragment);
          // eslint-disable-next-line no-param-reassign
          delete attributes.verticalAlign;
          break;
        case 'colSpan':
          // A span of one column (or none, for continued row-span cells) is the default.
          if (Number(attributes[key]) > 1) {
            tableCellPropertiesFragment.import(buildGridSpanFragment(attributes[key]!));
          }
          // eslint-disable-next-line no-param-reassign
          delete attributes.colSpan;
          break;
        case 'tableCellBorder':
          const tableCellBorderFragment = buildTableCellBorders(attributes[key]!);
          tableCellPropertiesFragment.import(tableCellBorderFragment);
          // eslint-disable-next-line no-param-reassign
          delete attributes.tableCellBorder;
          break;
        case 'rowSpan':
          const verticalMergeFragment = buildVerticalMerge(attributes[key] as string | undefined);
          tableCellPropertiesFragment.import(verticalMergeFragment);

          delete attributes.rowSpan;
          break;
        case 'width':
          const widthFragment = buildTableCellWidth(attributes[key]!);
          if (widthFragment) {
            tableCellPropertiesFragment.import(widthFragment);
          }
          delete attributes.width;
          break;
      }
    });
  }
  tableCellPropertiesFragment.up();

  return tableCellPropertiesFragment;
};

export const fixupTableCellBorder = (vNode: VNodeType, attributes: BuilderAttributes) => {
  if (Object.prototype.hasOwnProperty.call(vNode.properties.style, 'border')) {
    if (vNode.properties.style.border === 'none' || vNode.properties.style.border === 0) {
      attributes.tableCellBorder = {};
    } else {
      // eslint-disable-next-line no-use-before-define
      const [borderSize, borderStroke, borderColor] = cssBorderParser(
        vNode.properties.style.border,
      );

      attributes.tableCellBorder = {
        top: borderSize,
        left: borderSize,
        bottom: borderSize,
        right: borderSize,
        color: borderColor,
        stroke: borderStroke,
      };
    }
  }
  if (vNode.properties.style['border-top'] && vNode.properties.style['border-top'] === '0') {
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      top: 0,
    };
  } else if (vNode.properties.style['border-top'] && vNode.properties.style['border-top'] !== '0') {
    // eslint-disable-next-line no-use-before-define
    const [borderSize, borderStroke, borderColor] = cssBorderParser(
      vNode.properties.style['border-top'],
    );
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      top: borderSize,
      color: borderColor,
      stroke: borderStroke,
    };
  }
  if (vNode.properties.style['border-left'] && vNode.properties.style['border-left'] === '0') {
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      left: 0,
    };
  } else if (
    vNode.properties.style['border-left'] &&
    vNode.properties.style['border-left'] !== '0'
  ) {
    // eslint-disable-next-line no-use-before-define
    const [borderSize, borderStroke, borderColor] = cssBorderParser(
      vNode.properties.style['border-left'],
    );
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      left: borderSize,
      color: borderColor,
      stroke: borderStroke,
    };
  }
  if (vNode.properties.style['border-bottom'] && vNode.properties.style['border-bottom'] === '0') {
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      bottom: 0,
    };
  } else if (
    vNode.properties.style['border-bottom'] &&
    vNode.properties.style['border-bottom'] !== '0'
  ) {
    // eslint-disable-next-line no-use-before-define
    const [borderSize, borderStroke, borderColor] = cssBorderParser(
      vNode.properties.style['border-bottom'],
    );
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      bottom: borderSize,
      color: borderColor,
      stroke: borderStroke,
    };
  }
  if (vNode.properties.style['border-right'] && vNode.properties.style['border-right'] === '0') {
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      right: 0,
    };
  } else if (
    vNode.properties.style['border-right'] &&
    vNode.properties.style['border-right'] !== '0'
  ) {
    // eslint-disable-next-line no-use-before-define
    const [borderSize, borderStroke, borderColor] = cssBorderParser(
      vNode.properties.style['border-right'],
    );
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      right: borderSize,
      color: borderColor,
      stroke: borderStroke,
    };
  }
};

export const buildTableCell = async (
  vNode: VNodeType,
  attributes: BuilderAttributes,
  rowSpanMap: RowSpanMap,
  columnIndex: ColumnIndex,
  docxDocumentInstance: DocxDocument,
) => {
  const tableCellFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'tc');

  let modifiedAttributes = { ...attributes };
  if (isVNode(vNode) && vNode.properties) {
    if (vNode.properties.rowSpan) {
      rowSpanMap.set(columnIndex.index, { rowSpan: vNode.properties.rowSpan - 1, colSpan: 0 });
      modifiedAttributes.rowSpan = 'restart';
    } else {
      const previousSpanObject = rowSpanMap.get(columnIndex.index);
      rowSpanMap.set(
        columnIndex.index,
        // eslint-disable-next-line prefer-object-spread
        Object.assign({}, previousSpanObject, {
          rowSpan: 0,
          colSpan: (previousSpanObject && previousSpanObject.colSpan) || 0,
        }),
      );
    }
    if (
      vNode.properties.colSpan ||
      (vNode.properties.style && vNode.properties.style['column-span'])
    ) {
      modifiedAttributes.colSpan =
        vNode.properties.colSpan ||
        (vNode.properties.style && vNode.properties.style['column-span']);
      const previousSpanObject = rowSpanMap.get(columnIndex.index);
      rowSpanMap.set(
        columnIndex.index,
        // eslint-disable-next-line prefer-object-spread
        Object.assign({}, previousSpanObject, {
          colSpan: parseInt(modifiedAttributes.colSpan as unknown as string) || 0,
        }),
      );
      columnIndex.index += parseInt(modifiedAttributes.colSpan as unknown as string) - 1;
    }
    if (vNode.properties.style) {
      modifiedAttributes = {
        ...modifiedAttributes,
        ...modifiedStyleAttributesBuilder(docxDocumentInstance, vNode, attributes),
      };

      fixupTableCellBorder(vNode, modifiedAttributes);
    }
  }
  const tableCellPropertiesFragment = buildTableCellProperties(modifiedAttributes);
  tableCellFragment.import(tableCellPropertiesFragment);
  if (vNodeHasChildren(vNode)) {
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = asVNode(vNode.children[index]!);
      if (isVNode(childVNode) && childVNode.tagName === 'img') {
        const imageFragment = await buildImage(
          docxDocumentInstance,
          childVNode,
          modifiedAttributes.maximumWidth,
        );
        if (imageFragment) {
          tableCellFragment.import(imageFragment);
        }
      } else if (isVNode(childVNode) && childVNode.tagName === 'figure') {
        if (vNodeHasChildren(childVNode)) {
          // eslint-disable-next-line no-plusplus
          for (let iteratorIndex = 0; iteratorIndex < childVNode.children.length; iteratorIndex++) {
            const grandChildVNode = asVNode(childVNode.children[iteratorIndex]!);
            if (grandChildVNode.tagName === 'img') {
              const imageFragment = await buildImage(
                docxDocumentInstance,
                grandChildVNode,
                modifiedAttributes.maximumWidth,
              );
              if (imageFragment) {
                tableCellFragment.import(imageFragment);
              }
            }
          }
        }
      } else if (isVNode(childVNode) && ['ul', 'ol'].includes(childVNode.tagName)) {
        // render list in table
        if (vNodeHasChildren(childVNode)) {
          await buildList(childVNode, docxDocumentInstance, tableCellFragment);
        }
      } else {
        const paragraphFragment = await buildParagraph(
          childVNode,
          modifiedAttributes,
          docxDocumentInstance,
        );

        tableCellFragment.import(paragraphFragment);
      }
    }
  } else {
    // TODO: Figure out why building with buildParagraph() isn't working
    const paragraphFragment = fragment({ namespaceAlias: { w: namespaces.w } })
      .ele('@w', 'p')
      .up();
    tableCellFragment.import(paragraphFragment);
  }
  tableCellFragment.up();

  return tableCellFragment;
};

export const buildRowSpanCell = (
  rowSpanMap: RowSpanMap,
  columnIndex: ColumnIndex,
  attributes: BuilderAttributes,
) => {
  const rowSpanCellFragments = [];
  let spanObject = rowSpanMap.get(columnIndex.index);
  while (spanObject && spanObject.rowSpan) {
    const rowSpanCellFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'tc');

    const tableCellPropertiesFragment = buildTableCellProperties({
      ...attributes,
      rowSpan: 'continue',
      colSpan: spanObject.colSpan ? spanObject.colSpan : 0,
    });
    rowSpanCellFragment.import(tableCellPropertiesFragment);

    const paragraphFragment = fragment({ namespaceAlias: { w: namespaces.w } })
      .ele('@w', 'p')
      .up();
    rowSpanCellFragment.import(paragraphFragment);
    rowSpanCellFragment.up();

    rowSpanCellFragments.push(rowSpanCellFragment);

    if (spanObject.rowSpan - 1 === 0) {
      rowSpanMap.delete(columnIndex.index);
    } else {
      rowSpanMap.set(columnIndex.index, {
        rowSpan: spanObject.rowSpan - 1,
        colSpan: spanObject.colSpan || 0,
      });
    }
    columnIndex.index += spanObject.colSpan || 1;
    spanObject = rowSpanMap.get(columnIndex.index);
  }

  return rowSpanCellFragments;
};

export const buildTableRowProperties = (attributes: BuilderAttributes) => {
  const tableRowPropertiesFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'trPr',
  );
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      switch (key) {
        case 'tableRowHeight':
          const tableRowHeightFragment = buildTableRowHeight(attributes[key]!);
          tableRowPropertiesFragment.import(tableRowHeightFragment);
          // eslint-disable-next-line no-param-reassign
          delete attributes.tableRowHeight;
          break;
        case 'rowCantSplit':
          if (attributes.rowCantSplit) {
            const cantSplitFragment = fragment({ namespaceAlias: { w: namespaces.w } })
              .ele('@w', 'cantSplit')
              .up();
            tableRowPropertiesFragment.import(cantSplitFragment);
            // eslint-disable-next-line no-param-reassign
            delete attributes.rowCantSplit;
          }
          break;
        case 'tableHeaderRow':
          if (attributes.tableHeaderRow) {
            tableRowPropertiesFragment.import(
              fragment({ namespaceAlias: { w: namespaces.w } })
                .ele('@w', 'tblHeader')
                .up(),
            );
            // eslint-disable-next-line no-param-reassign
            delete attributes.tableHeaderRow;
          }
          break;
      }
    });
  }
  tableRowPropertiesFragment.up();
  return tableRowPropertiesFragment;
};

export const buildTableRow = async (
  vNode: VNodeType,
  attributes: BuilderAttributes,
  rowSpanMap: RowSpanMap,
  docxDocumentInstance: DocxDocument,
) => {
  const tableRowFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'tr');
  const modifiedAttributes = { ...attributes };
  if (isVNode(vNode) && vNode.properties) {
    // FIXME: find a better way to get row height from cell style
    if (
      (vNode.properties.style && vNode.properties.style.height) ||
      (vNode.children[0] &&
        isVNode(vNode.children[0]) &&
        vNode.children[0].properties.style &&
        vNode.children[0].properties.style.height)
    ) {
      modifiedAttributes.tableRowHeight = fixupRowHeight(
        (vNode.properties.style && vNode.properties.style.height) ||
          (vNode.children[0] &&
          isVNode(vNode.children[0]) &&
          vNode.children[0].properties.style &&
          vNode.children[0].properties.style.height
            ? vNode.children[0].properties.style.height
            : undefined),
      );
    }
    if (vNode.properties.style) {
      fixupTableCellBorder(vNode, modifiedAttributes);
    }
  }

  const tableRowPropertiesFragment = buildTableRowProperties(modifiedAttributes);
  tableRowFragment.import(tableRowPropertiesFragment);

  const columnIndex = { index: 0 };
  let cellCount = 0;

  if (vNodeHasChildren(vNode)) {
    const tableColumns = vNode.children.filter((childVNode) =>
      ['td', 'th'].includes(asVNode(childVNode).tagName),
    ) as VNodeType[];
    const maximumColumnWidth = docxDocumentInstance.availableDocumentSpace / tableColumns.length;

    // eslint-disable-next-line no-restricted-syntax
    for (const column of tableColumns) {
      const rowSpanCellFragments = buildRowSpanCell(rowSpanMap, columnIndex, modifiedAttributes);
      if (Array.isArray(rowSpanCellFragments)) {
        for (let iteratorIndex = 0; iteratorIndex < rowSpanCellFragments.length; iteratorIndex++) {
          const rowSpanCellFragment = rowSpanCellFragments[iteratorIndex];

          tableRowFragment.import(rowSpanCellFragment);
          cellCount++;
        }
      }
      const tableCellFragment = await buildTableCell(
        column,
        { ...modifiedAttributes, maximumWidth: maximumColumnWidth },
        rowSpanMap,
        columnIndex,
        docxDocumentInstance,
      );
      columnIndex.index++;

      tableRowFragment.import(tableCellFragment);
      cellCount++;
    }
  }

  if (columnIndex.index < rowSpanMap.size) {
    const rowSpanCellFragments = buildRowSpanCell(rowSpanMap, columnIndex, modifiedAttributes);
    if (Array.isArray(rowSpanCellFragments)) {
      for (let iteratorIndex = 0; iteratorIndex < rowSpanCellFragments.length; iteratorIndex++) {
        const rowSpanCellFragment = rowSpanCellFragments[iteratorIndex];

        tableRowFragment.import(rowSpanCellFragment);
        cellCount++;
      }
    }
  }

  tableRowFragment.up();

  // A row without cells (e.g. an empty <tr>) is invalid in Word; leave it out.
  return cellCount ? tableRowFragment : null;
};

export const buildTableGridCol = (gridWidth: number) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'gridCol')
    .att('@w', 'w', attr(String(gridWidth)));

// Width of a column in twips from a CSS/HTML width, or null when it has none
// (or one we cannot resolve, like `auto`). Percentages are of the table width.
const columnWidthInTWIP = (width: unknown, tableWidth: number): number | null => {
  if (width === undefined || width === null || width === '') {
    return null;
  }
  // An HTML width attribute without a unit is in pixels.
  const widthString = /^\d+(\.\d+)?$/.test(String(width).trim()) ? `${width}px` : String(width);
  const twips = fixupColumnWidth(widthString);
  if (twips !== undefined) {
    return twips;
  }
  const percentage = widthString.trim().match(percentageRegex);
  return percentage ? (Number(percentage[1]) / 100) * tableWidth : null;
};

const elementWidth = (vNode: VNodeType) =>
  (vNode.properties.style && vNode.properties.style.width) ||
  (vNode.properties.attributes && vNode.properties.attributes.width);

const columnSpan = (vNode: VNodeType, attributeName: string) =>
  Math.max(
    parseInt(
      vNode.properties[attributeName] ||
        (vNode.properties.attributes && vNode.properties.attributes[attributeName.toLowerCase()]) ||
        (vNode.properties.style && vNode.properties.style['column-span']) ||
        '1',
      10,
    ) || 1,
    1,
  );

/**
 * The column widths of a table: from its <col> elements when it has a
 * <colgroup>, otherwise from the cells of its first row with cells. Columns
 * without a width share what is left of the table width; the result is scaled
 * to fit within `availableWidth`, and up to an explicit table width.
 */
export const computeTableGridWidths = (
  vNode: VNodeType,
  availableWidth: number,
  explicitWidth?: number,
) => {
  const tableWidth = explicitWidth || availableWidth;
  const children = (vNode.children || []).filter(isVNode) as VNodeType[];
  const rows = children.flatMap((child) =>
    ['thead', 'tbody', 'tfoot'].includes(child.tagName)
      ? ((child.children || []).filter(isVNode) as VNodeType[])
      : [child],
  );
  const firstRowCells = rows
    .filter((row) => row.tagName === 'tr')
    .map((row) =>
      ((row.children || []).filter(isVNode) as VNodeType[]).filter((cell) =>
        ['td', 'th'].includes(cell.tagName),
      ),
    )
    .find((cells) => cells.length);
  const columns = children
    .filter((child) => child.tagName === 'colgroup')
    .flatMap((colgroup) =>
      ((colgroup.children || []).filter(isVNode) as VNodeType[]).filter(
        (col) => col.tagName === 'col',
      ),
    );

  // [width or null] per grid column.
  const widths: (number | null)[] = [];
  const sources: [VNodeType, number][] = columns.length
    ? columns.map((col) => [col, columnSpan(col, 'span')])
    : (firstRowCells || []).map((cell) => [cell, columnSpan(cell, 'colSpan')]);
  for (const [source, span] of sources) {
    const width = columnWidthInTWIP(elementWidth(source), tableWidth);
    for (let index = 0; index < span; index++) {
      widths.push(width === null ? null : width / span);
    }
  }
  if (!widths.length) {
    return [];
  }

  const known = widths.reduce<number>((sum, width) => sum + (width ?? 0), 0);
  const unknownCount = widths.filter((width) => width === null).length;
  const remaining = tableWidth - known;
  const shareOfRest = remaining > 0 ? remaining / unknownCount : tableWidth / widths.length;
  let resolved = widths.map((width) => width ?? shareOfRest);

  const total = resolved.reduce((sum, width) => sum + width, 0);
  if (total > availableWidth || (explicitWidth && total < explicitWidth)) {
    const target = Math.min(tableWidth, availableWidth);
    resolved = resolved.map((width) => (width * target) / total);
  }

  return resolved.map((width) => Math.round(width));
};

export const buildTableGrid = (gridWidths: number[]) => {
  const tableGridFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'tblGrid');
  for (const gridWidth of gridWidths) {
    tableGridFragment.import(buildTableGridCol(gridWidth));
  }
  tableGridFragment.up();

  return tableGridFragment;
};

export const buildTableBorders = (tableBorder: BorderSpec) => {
  const tableBordersFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'tblBorders',
  );

  const { color, stroke, ...borders } = tableBorder;

  Object.keys(borders).forEach((border) => {
    if (borders[border]) {
      const borderFragment = buildBorder(border, borders[border], 0, color, stroke);
      tableBordersFragment.import(borderFragment);
    }
  });

  tableBordersFragment.up();

  return tableBordersFragment;
};

export const buildTableWidth = (tableWidth: number | string) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'tblW')
    .att('@w', 'type', attr('dxa'))
    .att('@w', 'w', attr(String(tableWidth)))
    .up();

export const buildCellMargin = (side: string, margin: number) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', side)
    .att('@w', 'type', attr('dxa'))
    .att('@w', 'w', attr(String(margin)))
    .up();

export const buildTableCellMargins = (margin: number) => {
  const tableCellMarFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'tblCellMar',
  );

  ['top', 'bottom'].forEach((side) => {
    const marginFragment = buildCellMargin(side, margin / 2);
    tableCellMarFragment.import(marginFragment);
  });
  ['left', 'right'].forEach((side) => {
    const marginFragment = buildCellMargin(side, margin);
    tableCellMarFragment.import(marginFragment);
  });

  return tableCellMarFragment;
};

export const buildTableProperties = (attributes: BuilderAttributes) => {
  const tablePropertiesFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'tblPr',
  );

  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      switch (key) {
        case 'tableBorder':
          const tableBordersFragment = buildTableBorders(attributes[key]!);
          tablePropertiesFragment.import(tableBordersFragment);
          // eslint-disable-next-line no-param-reassign
          delete attributes.tableBorder;
          break;
        case 'tableCellSpacing':
          const tableCellSpacingFragment = buildTableCellSpacing(attributes[key]!);
          tablePropertiesFragment.import(tableCellSpacingFragment);
          // eslint-disable-next-line no-param-reassign
          delete attributes.tableCellSpacing;
          break;
        case 'width':
          if (attributes[key]) {
            const tableWidthFragment = buildTableWidth(attributes[key]);
            tablePropertiesFragment.import(tableWidthFragment);
          }
          // eslint-disable-next-line no-param-reassign
          delete attributes.width;
          break;
      }
    });
  }
  const tableCellMarginFragment = buildTableCellMargins(160);
  tablePropertiesFragment.import(tableCellMarginFragment);

  // by default, all tables are center aligned.
  const alignmentFragment = buildHorizontalAlignment('center');
  tablePropertiesFragment.import(alignmentFragment);

  tablePropertiesFragment.up();

  return tablePropertiesFragment;
};

export const buildTable = async (
  vNode: VNodeType,
  attributes: BuilderAttributes,
  docxDocumentInstance: DocxDocument,
) => {
  const tableFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'tbl');
  const modifiedAttributes = { ...attributes };
  if (isVNode(vNode) && vNode.properties) {
    const tableAttributes = vNode.properties.attributes || {};
    const tableStyles = vNode.properties.style || {};
    const tableBorders: BorderSpec = {};
    const tableCellBorders: BorderSpec = {};
    let [borderSize, borderStrike, borderColor]: [number | string, string, string] = [
      2,
      'single',
      '000000',
    ];

    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(tableAttributes.border as unknown as number)) {
      borderSize = parseInt(tableAttributes.border!, 10);
    }

    // css style overrides table border properties
    if (tableStyles.border) {
      const [cssSize, cssStroke, cssColor] = cssBorderParser(tableStyles.border);
      borderSize = cssSize || borderSize;
      borderColor = cssColor || borderColor;
      borderStrike = cssStroke || borderStrike;
    }

    tableBorders.top = borderSize;
    tableBorders.bottom = borderSize;
    tableBorders.left = borderSize;
    tableBorders.right = borderSize;
    tableBorders.stroke = borderStrike;
    tableBorders.color = borderColor;

    if (tableStyles['border-collapse'] === 'collapse') {
      tableBorders.insideV = borderSize;
      tableBorders.insideH = borderSize;
    } else {
      tableBorders.insideV = 0;
      tableBorders.insideH = 0;
      tableCellBorders.top = 1;
      tableCellBorders.bottom = 1;
      tableCellBorders.left = 1;
      tableCellBorders.right = 1;
    }

    modifiedAttributes.tableBorder = tableBorders;
    modifiedAttributes.tableCellSpacing = 0;

    if (Object.keys(tableCellBorders).length) {
      modifiedAttributes.tableCellBorder = tableCellBorders;
    }

    let minimumWidth;
    let maximumWidth;
    let width;
    // Calculate minimum width of table
    if (pixelRegex.test(tableStyles['min-width'])) {
      minimumWidth = pixelToTWIP(tableStyles['min-width'].match(pixelRegex)[1]);
    } else if (percentageRegex.test(tableStyles['min-width'])) {
      const percentageValue = tableStyles['min-width'].match(percentageRegex)[1];
      minimumWidth = Math.round((percentageValue / 100) * attributes.maximumWidth!);
    }

    // Calculate maximum width of table
    if (pixelRegex.test(tableStyles['max-width'])) {
      pixelRegex.lastIndex = 0;
      maximumWidth = pixelToTWIP(tableStyles['max-width'].match(pixelRegex)[1]);
    } else if (percentageRegex.test(tableStyles['max-width'])) {
      percentageRegex.lastIndex = 0;
      const percentageValue = tableStyles['max-width'].match(percentageRegex)[1];
      maximumWidth = Math.round((percentageValue / 100) * attributes.maximumWidth!);
    }

    // Calculate specified width of table
    if (pixelRegex.test(tableStyles.width)) {
      pixelRegex.lastIndex = 0;
      width = pixelToTWIP(tableStyles.width.match(pixelRegex)[1]);
    } else if (percentageRegex.test(tableStyles.width)) {
      percentageRegex.lastIndex = 0;
      const percentageValue = tableStyles.width.match(percentageRegex)[1];
      width = Math.round((percentageValue / 100) * attributes.maximumWidth!);
    }

    // If width isn't supplied, we should have min-width as the width.
    if (width) {
      modifiedAttributes.width = width;
      if (maximumWidth) {
        modifiedAttributes.width = Math.min(modifiedAttributes.width, maximumWidth);
      }
      if (minimumWidth) {
        modifiedAttributes.width = Math.max(modifiedAttributes.width, minimumWidth);
      }
    } else if (minimumWidth) {
      modifiedAttributes.width = minimumWidth;
    }
    if (modifiedAttributes.width) {
      modifiedAttributes.width = Math.min(
        modifiedAttributes.width as number,
        attributes.maximumWidth!,
      );
    }
  }
  // Read before buildTableProperties, which consumes the width attribute.
  const gridWidths = computeTableGridWidths(
    vNode,
    attributes.maximumWidth!,
    modifiedAttributes.width as number | undefined,
  );
  const tablePropertiesFragment = buildTableProperties(modifiedAttributes);
  tableFragment.import(tablePropertiesFragment);
  // One grid per table, right after its properties.
  tableFragment.import(buildTableGrid(gridWidths));

  const rowSpanMap: RowSpanMap = new Map();

  if (vNodeHasChildren(vNode)) {
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = asVNode(vNode.children[index]!);
      if (childVNode.tagName === 'thead') {
        for (let iteratorIndex = 0; iteratorIndex < childVNode.children.length; iteratorIndex++) {
          const grandChildVNode = asVNode(childVNode.children[iteratorIndex]!);
          if (grandChildVNode.tagName === 'tr') {
            const tableRowFragment = await buildTableRow(
              grandChildVNode,
              // <thead> rows repeat at the top of each page when enabled.
              modifiedAttributes.repeatTableHeader
                ? { ...modifiedAttributes, tableHeaderRow: true }
                : modifiedAttributes,
              rowSpanMap,
              docxDocumentInstance,
            );
            if (tableRowFragment) {
              if (tableRowFragment) {
                tableFragment.import(tableRowFragment);
              }
            }
          }
        }
      } else if (childVNode.tagName === 'tbody') {
        for (let iteratorIndex = 0; iteratorIndex < childVNode.children.length; iteratorIndex++) {
          const grandChildVNode = asVNode(childVNode.children[iteratorIndex]!);
          if (grandChildVNode.tagName === 'tr') {
            const tableRowFragment = await buildTableRow(
              grandChildVNode,
              modifiedAttributes,
              rowSpanMap,
              docxDocumentInstance,
            );
            if (tableRowFragment) {
              if (tableRowFragment) {
                tableFragment.import(tableRowFragment);
              }
            }
          }
        }
      } else if (childVNode.tagName === 'tr') {
        const tableRowFragment = await buildTableRow(
          childVNode,
          modifiedAttributes,
          rowSpanMap,
          docxDocumentInstance,
        );
        if (tableRowFragment) {
          tableFragment.import(tableRowFragment);
        }
      }
    }
  }
  tableFragment.up();

  return tableFragment;
};
