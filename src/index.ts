/* eslint-disable no-useless-escape */
import JSZip from 'jszip';
import addFilesToContainer from './html-to-docx';

// Inline elements: whitespace between two of them is a word separator and
// must survive minification, e.g. `<b>a</b> <i>b</i>`.
const inlineTags = new Set([
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'cite',
  'code',
  'data',
  'del',
  'dfn',
  'em',
  'font',
  'i',
  'img',
  'ins',
  'kbd',
  'mark',
  'q',
  's',
  'samp',
  'small',
  'span',
  'strike',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'var',
]);

// Name of the tag starting at `index` (`<b ...>` or `</b>`), lower-cased.
const tagNameAt = (html: string, index: number) =>
  /^<\/?([a-zA-Z][\w-]*)/.exec(html.slice(index, index + 64))?.[1]?.toLowerCase();

const minifyHTMLString = (htmlString: unknown): string | null => {
  try {
    if (typeof htmlString === 'string' || htmlString instanceof String) {
      const minifiedHTMLString = String(htmlString)
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\r\n/g, ' ')
        .replace(/[\t]+\</g, '<')
        // Whitespace between tags is dropped, except between two inline
        // elements, where it is collapsed to a single space.
        .replace(/\>[\t ]+\</g, (match: string, offset: number, html: string) => {
          const before = tagNameAt(html, html.lastIndexOf('<', offset));
          const after = tagNameAt(html, offset + match.length - 1);
          return before && after && inlineTags.has(before) && inlineTags.has(after) ? '> <' : '><';
        })
        .replace(/\>[\t ]+$/g, '>');

      // Runs of whitespace inside text collapse to one space, as in a browser;
      // otherwise the source's line breaks and indentation show up as gaps.
      // The content of <pre> is left as it is.
      return minifiedHTMLString
        .split(/(<pre[\s>][\s\S]*?<\/pre>)/i)
        .map((part, index) => (index % 2 ? part : part.replace(/[\t ]{2,}/g, ' ')))
        .join('');
    }

    throw new Error('invalid html string');
  } catch {
    return null;
  }
};

/**
 * Converts an HTML string to a DOCX document.
 *
 * @param htmlString - HTML for the document body.
 * @param headerHTMLString - HTML for the header; defaults to `<p></p>` when `documentOptions.header` is `true`.
 * @param documentOptions - Page, metadata, font, numbering and header/footer options.
 * @param footerHTMLString - HTML for the footer; defaults to `<p></p>` when `documentOptions.footer` is `true`.
 * @returns A `Buffer` in Node.js, or a `Blob` where `Buffer` is unavailable.
 */
async function generateContainer(
  htmlString: string,
  headerHTMLString?: string | null,
  documentOptions: generateContainer.DocumentOptions = {},
  footerHTMLString?: string | null,
): Promise<Buffer | Blob> {
  if (typeof htmlString !== 'string' && !((htmlString as unknown) instanceof String)) {
    throw new TypeError('HTMLtoDOCX: htmlString must be a string');
  }
  const zip = new JSZip();

  let contentHTML: string | null = htmlString;
  let headerHTML = headerHTMLString;
  let footerHTML = footerHTMLString;
  if (htmlString) {
    contentHTML = minifyHTMLString(contentHTML);
  }
  if (headerHTMLString) {
    headerHTML = minifyHTMLString(headerHTML);
  }
  if (footerHTMLString) {
    footerHTML = minifyHTMLString(footerHTML);
  }

  await addFilesToContainer(zip, contentHTML, documentOptions, headerHTML, footerHTML);

  const buffer = await zip.generateAsync({ type: 'arraybuffer' });
  if (Object.prototype.hasOwnProperty.call(globalThis, 'Buffer')) {
    return Buffer.from(new Uint8Array(buffer));
  }
  if (Object.prototype.hasOwnProperty.call(globalThis, 'Blob')) {
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  }
  throw new Error(
    'Add blob support using a polyfill eg https://github.com/bjornstar/blob-polyfill',
  );
}

// The public option types are declared on a namespace merged into the
// function. CommonJS declarations use `export =` (require() returns the
// function), so the types must hang off it there, e.g.
// `HTMLtoDOCX.DocumentOptions`. ESM consumers can also import them by name.
// The namespace is type-only and emits no JavaScript.
declare namespace generateContainer {
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
    table?: {
      row?: {
        /** Prevent table rows from breaking across pages. Defaults to `false`. */
        cantSplit?: boolean;
        /**
         * Repeat the rows of the table's `<thead>` at the top of every page the
         * table spans. Defaults to `false`.
         */
        repeatTableHeader?: boolean;
      };
    };
    pageNumber?: boolean;
    skipFirstHeaderFooter?: boolean;
    lineNumber?: boolean;
    lineNumberOptions?: Partial<LineNumberOptions>;
    numbering?: { defaultOrderedListStyleType?: string };
    decodeUnicode?: boolean;
    lang?: string;
  }
}

export default generateContainer;

export type Orientation = generateContainer.Orientation;
export type PageMargins = generateContainer.PageMargins;
export type HeaderFooterType = generateContainer.HeaderFooterType;
export type Length = generateContainer.Length;
export type LineNumberOptions = generateContainer.LineNumberOptions;
export type DocumentOptions = generateContainer.DocumentOptions;
