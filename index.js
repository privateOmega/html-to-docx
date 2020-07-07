/* eslint-disable no-param-reassign */
import JSZip from 'jszip';
import { addFilesToContainer } from './src/html-to-docx';

const { minify } = require('html-minifier');
const libtidy = require('libtidy-updated');

const minifyHTMLString = (htmlString) => {
  if (typeof htmlString === 'string' || htmlString instanceof String) {
    try {
      const minifiedHTMLString = minify(htmlString, {
        caseSensitive: true,
        collapseWhitespace: true,
        html5: false,
        keepClosingSlash: true,
      });

      return minifiedHTMLString;
    } catch (error) {
      return null;
    }
  } else {
    return null;
  }
};

const tidyHTMLString = async (htmlString) => {
  if (typeof htmlString === 'string' || htmlString instanceof String) {
    try {
      const libTidyOutput = await libtidy.tidyBuffer(htmlString, {
        doctype: 'omit',
        bare: true,
        'coerce-endtags': true,
        'drop-empty-elements': true,
        'drop-empty-paras': true,
        'drop-proprietary-attributes': true,
        'hide-comments': true,
        'merge-spans': true,
        'output-html': true,
        'show-body-only': true,
      });

      return libTidyOutput.output.toString();
    } catch (error) {
      throw new Error('Incorrect/Unsupported HTML string');
    }
  }

  return null;
};

async function generateContainer(htmlString, headerHTMLString, documentOptions = {}) {
  const zip = new JSZip();

  let contentHTML = htmlString;
  let headerHTML = headerHTMLString;
  if (htmlString) {
    contentHTML = await tidyHTMLString(contentHTML);
    contentHTML = minifyHTMLString(contentHTML);
  }
  if (headerHTMLString) {
    headerHTML = await tidyHTMLString(headerHTML);
    headerHTML = minifyHTMLString(headerHTML);
  }

  addFilesToContainer(zip, contentHTML, documentOptions, headerHTML);

  const buffer = await zip.generateAsync({ type: 'arraybuffer' });
  if (Object.prototype.hasOwnProperty.call(global, 'Blob')) {
    // eslint-disable-next-line no-undef
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  }
  if (Object.prototype.hasOwnProperty.call(global, 'Buffer')) {
    return Buffer.from(new Uint8Array(buffer));
  }
  throw new Error(
    'Add blob support using a polyfill eg https://github.com/bjornstar/blob-polyfill'
  );
}

export default generateContainer;
