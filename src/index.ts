/* eslint-disable no-useless-escape */
import JSZip from 'jszip';
import addFilesToContainer from './html-to-docx';

const minifyHTMLString = (htmlString: unknown): string | null => {
  try {
    if (typeof htmlString === 'string' || htmlString instanceof String) {
      const minifiedHTMLString = String(htmlString)
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\r\n/g, ' ')
        .replace(/[\t]+\</g, '<')
        .replace(/\>[\t ]+\</g, '><')
        .replace(/\>[\t ]+$/g, '>');

      return minifiedHTMLString;
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
  if (Object.prototype.hasOwnProperty.call(global, 'Buffer')) {
    return Buffer.from(new Uint8Array(buffer));
  }
  if (Object.prototype.hasOwnProperty.call(global, 'Blob')) {
    // eslint-disable-next-line no-undef
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
    table?: { row?: { cantSplit?: boolean } };
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
