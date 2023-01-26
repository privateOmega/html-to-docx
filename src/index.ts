/* eslint-disable no-useless-escape */
import JSZip from 'jszip';
import addFilesToContainer from './html-to-docx';

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

interface Numbering {
  /**
   * defaultOrderedListStyleType <?[String]> default ordered list style type. Defaults to `decimal`.
   */
  defaultOrderedListStyleType?: string;
}

interface LineNumberOptions {
  /**
   * start <[Number]> start of the numbering - 1. Defaults to `0`.
   */
  start: number;

  /**
   * countBy <[Number]> skip numbering in how many lines in between + 1. Defaults to `1`.
   */
  countBy: number;

  /**
   * restart <"continuous"|"newPage"|"newSection"> numbering restart strategy. Defaults to `continuous`.
   */
  restart: 'continuous' | 'newPage' | 'newSection';
}

interface Margins {
  /**
   * top <Number> distance between the top of the text margins for the main document and the top of the page for all pages in this section in TWIP.
   * Defaults to 1440. Supports equivalent measurement in pixel, cm or inch.
   */
  top: number;

  /**
   * right <Number> distance between the right edge of the page and the right edge of the text extents for this document in TWIP.
   * Defaults to 1800. Supports equivalent measurement in pixel, cm or inch.
   */
  right: number;

  /**
   * bottom <Number> distance between the bottom of text margins for the document and the bottom of the page in TWIP.
   * Defaults to 1440. Supports equivalent measurement in pixel, cm or inch.
   */
  bottom: number;

  /**
   * left <Number> distance between the left edge of the page and the left edge of the text extents for this document in TWIP.
   * Defaults to 1800. Supports equivalent measurement in pixel, cm or inch.
   */
  left: number;

  /**
   * header <Number> distance from the top edge of the page to the top edge of the header in TWIP.
   * Defaults to 720. Supports equivalent measurement in pixel, cm or inch.
   */
  header: number;

  /**
   * footer <Number> distance from the bottom edge of the page to the bottom edge of the footer in TWIP.
   * Defaults to 720. Supports equivalent measurement in pixel, cm or inch.
   */
  footer: number;

  /**
   * gutter <Number> amount of extra space added to the specified margin, above any existing margin values. This setting is typically used when a document is being created for binding in TWIP.
   * Defaults to 0. Supports equivalent measurement in pixel, cm or inch.
   */
  gutter: number;
}

interface Row {
  /**
   * cantSplit <?Boolean> flag to allow table row to split across pages. Defaults to false.
   */
  cantSplit?: boolean;
}

interface Table {
  row?: Row;
}

interface PageSize {
  /**
   * width <[Number]> width of the page for all pages in this section in [TWIP]. Defaults to 12240. Maximum 31680. Supports equivalent measurement in [pixel], [cm] or [inch].
   */
  width: number;

  /**
   * height <[Number]> height of the page for all pages in this section in [TWIP]. Defaults to 15840. Maximum 31680. Supports equivalent measurement in [pixel], [cm] or [inch].
   */
  height: number;
}

export interface DocumentOptions {
  /**
   * orientation <"portrait"|"landscape"> defines the general orientation of the document. Defaults to portrait.
   */
  orientation?: 'portrait' | 'landscape';

  /**
   * pageSize <?Object> Defaults to U.S. letter portrait orientation.
   */
  pageSize?: PageSize;

  margins?: Margins;

  /**
   * title <?String> title of the document.
   */
  title?: string;

  /**
   * subject <?String> subject of the document.
   */
  subject?: string;

  /**
   * creator <?String> creator of the document. Defaults to html-to-docx.
   */
  creator?: string;

  /**
   * keywords <?Array<String>> keywords associated with the document. Defaults to ['html-to-docx'].
   */
  keywords?: string[];

  /**
   * description <?String> description of the document.
   */
  description?: string;

  /**
   * lastModifiedBy <?String> last modifier of the document. Defaults to html-to-docx.
   */
  lastModifiedBy?: string;

  /**
   * revision <?Number> revision of the document. Defaults to 1.
   */
  revision?: number;

  /**
   * createdAt <?Date> time of creation of the document. Defaults to current time.
   */
  createdAt?: Date;

  /**
   * modifiedAt <?Date> time of last modification of the document. Defaults to current time.
   */
  modifiedAt?: Date;

  /**
   * headerType <"default"|"first"|"even"> type of header. Defaults to default.
   */
  headerType?: 'default' | 'first' | 'even';

  /**
   * header <?Boolean> flag to enable header. Defaults to false.
   */
  header?: boolean;

  /**
   * footerType <"default"|"first"|"even"> type of footer. Defaults to default.
   */
  footerType?: 'default' | 'first' | 'even';

  /**
   * footer <?Boolean> flag to enable footer. Defaults to false.
   */
  footer?: boolean;

  /**
   * font <?String> font name to be used. Defaults to Times New Roman.
   */
  font?: string;

  /**
   * fontSize <?Number> size of font in HIP(Half of point). Defaults to 22. Supports equivalent measure in pt.
   */
  fontSize?: number;

  /**
   * complexScriptFontSize <?Number> size of complex script font in HIP(Half of point). Defaults to 22. Supports equivalent measure in pt.
   */
  complexScriptFontSize?: number;

  table?: Table;

  /**
   * pageNumber <?Boolean> flag to enable page number in footer. Defaults to false. Page number works only if footer flag is set as true.
   */
  pageNumber?: boolean;

  /**
   * skipFirstHeaderFooter <?Boolean> flag to skip first page header and footer. Defaults to false.
   */
  skipFirstHeaderFooter?: boolean;

  /**
   * lineNumber <?[Boolean]> flag to enable line numbering. Defaults to `false`.
   */
  lineNumber?: boolean;

  lineNumberOptions?: LineNumberOptions;

  numbering?: Numbering;
}

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
