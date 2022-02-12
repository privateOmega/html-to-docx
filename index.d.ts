declare module 'html-to-docx'
{
    interface Margins
    {
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

    interface Row
    {
        /**
         * cantSplit <?Boolean> flag to allow table row to split across pages. Defaults to false.
         */
        cantSplit?: boolean;
    }

    interface Table
    {
        row?: Row;
    }

    export interface DocumentOptions
    {
        /**
         * orientation <"portrait"|"landscape"> defines the general orientation of the document. Defaults to portrait.
         */
        orientation?: "portrait" | "landscape";

        margins?: Margins

        /**
         * title <?String> title of the document.
         */
        title?: string;

        /**
         * subject <?String> subject of the document.
         */
        subject?: string;

        /**
         * creator <?String> creator of the document. Defaults to html-to-docx
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
        headerType?: "default" | "first" | "even";

        /**
         * header <?Boolean> flag to enable header. Defaults to false.
         */
        header?: boolean;

        /**
         * footerType <"default"|"first"|"even"> type of footer. Defaults to default.
         */
        footerType?: "default" | "first" | "even";

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
    }

    /**
     * @param htmlString <String> clean html string equivalent of document content.
     * @param headerHTMLString <String> clean html string equivalent of header. Defaults to <p></p> if header flag is true.
     * @param documentOptions <DocumentOptions>
     * @param footerHTMLString <String> clean html string equivalent of footer. Defaults to <p></p> if footer flag is true.
     * @constructor
     * @private
     */
   export default function HTMLtoDOCX(htmlString: string, headerHTMLString: string, documentOptions: DocumentOptions, footerHTMLString?: string): Promise<Buffer | Blob>;
}
