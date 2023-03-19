/* eslint-disable no-useless-escape */
import JSZip from 'jszip';

import addFilesToContainer from './html-to-docx';
import { DocumentOptions } from './interface';

const minifyHTMLString = (htmlString: string) => {
  try {
    if (typeof htmlString === 'string' || (htmlString as any) instanceof String) {
      const minifiedHTMLString = htmlString
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\r\n/g, ' ')
        .replace(/[\t]+\</g, '<')
        .replace(/\>[\t ]+\</g, '><')
        .replace(/\>[\t ]+$/g, '>');

      return minifiedHTMLString;
    }

    throw new Error('invalid html string');
  } catch (error) {
    return null;
  }
};

/**
 * @param htmlString <String> clean html string equivalent of document content.
 * @param headerHTMLString <String> clean html string equivalent of header. Defaults to <p></p> if header flag is true.
 * @param documentOptions <DocumentOptions>
 * @param footerHTMLString <String> clean html string equivalent of footer. Defaults to <p></p> if footer flag is true.
 */
async function generateContainer(
  htmlString: string,
  headerHTMLString: string,
  documentOptions: DocumentOptions = {},
  footerHTMLString: string
) {
  const zip = new JSZip();

  let contentHTML = htmlString;
  let headerHTML = headerHTMLString;
  let footerHTML = footerHTMLString;
  if (htmlString) {
    contentHTML = minifyHTMLString(contentHTML) as string;
  }
  if (headerHTMLString) {
    headerHTML = minifyHTMLString(headerHTML) as string;
  }
  if (footerHTMLString) {
    footerHTML = minifyHTMLString(footerHTML) as string;
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
    'Add blob support using a polyfill eg https://github.com/bjornstar/blob-polyfill'
  );
}

export default generateContainer;
