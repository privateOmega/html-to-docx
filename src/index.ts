/* eslint-disable no-useless-escape */
import JSZip from 'jszip';
import addFilesToContainer from './html-to-docx';
import type { DocumentOptions } from './types';

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
  documentOptions: DocumentOptions = {},
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

export default generateContainer;

export type {
  DocumentOptions,
  HeaderFooterType,
  Length,
  LineNumberOptions,
  Orientation,
  PageMargins,
} from './types';
