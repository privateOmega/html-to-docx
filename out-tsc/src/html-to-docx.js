"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFilesToContainer = void 0;
var xmlbuilder2_1 = require("xmlbuilder2");
var schemas_1 = require("./schemas");
var docx_document_1 = __importDefault(require("./docx-document"));
var helpers_1 = require("./helpers");
var unit_conversion_1 = require("./utils/unit-conversion");
var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');
var convertHTML = require('html-to-vdom')({
    VNode: VNode,
    VText: VText,
});
var defaultDocumentOptions = {
    orientation: 'portrait',
    margins: {
        top: 1440,
        right: 1800,
        bottom: 1440,
        left: 1800,
        header: 720,
        footer: 720,
        gutter: 0,
    },
    title: '',
    subject: '',
    creator: 'html-to-docx',
    keywords: ['html-to-docx'],
    description: '',
    lastModifiedBy: 'html-to-docx',
    revision: 1,
    createdAt: new Date(),
    modifiedAt: new Date(),
    headerType: 'default',
    header: false,
    footerType: 'default',
    footer: false,
    font: 'Times New Roman',
    fontSize: 22,
    complexScriptFontSize: 22,
    table: {
        row: {
            cantSplit: false,
        },
    },
    pageNumber: false,
    skipFirstHeaderFooter: false,
};
var mergeOptions = function (options, patch) { return (__assign(__assign({}, options), patch)); };
var fixupFontSize = function (fontSize) {
    var normalizedFontSize;
    if (unit_conversion_1.pointRegex.test(fontSize)) {
        var matchedParts = fontSize.match(unit_conversion_1.pointRegex);
        normalizedFontSize = unit_conversion_1.pointToHIP(matchedParts[1]);
    }
    else if (fontSize) {
        normalizedFontSize = fontSize;
    }
    else {
        normalizedFontSize = null;
    }
    return normalizedFontSize;
};
var fixupMargins = function (margins) {
    var normalizedMargins = {};
    if (typeof margins === 'object' && margins !== null) {
        Object.keys(margins).forEach(function (key) {
            if (unit_conversion_1.pixelRegex.test(margins[key])) {
                var matchedParts = margins[key].match(unit_conversion_1.pixelRegex);
                normalizedMargins[key] = unit_conversion_1.pixelToTWIP(matchedParts[1]);
            }
            else if (unit_conversion_1.cmRegex.test(margins[key])) {
                var matchedParts = margins[key].match(unit_conversion_1.cmRegex);
                normalizedMargins[key] = unit_conversion_1.cmToTWIP(matchedParts[1]);
            }
            else if (unit_conversion_1.inchRegex.test(margins[key])) {
                var matchedParts = margins[key].match(unit_conversion_1.inchRegex);
                normalizedMargins[key] = unit_conversion_1.inchToTWIP(matchedParts[1]);
            }
            else if (margins[key]) {
                normalizedMargins[key] = margins[key];
            }
            else {
                normalizedMargins[key] = defaultDocumentOptions.margins[key];
            }
        });
    }
    else {
        normalizedMargins = null;
    }
    return normalizedMargins;
};
var normalizeDocumentOptions = function (documentOptions) {
    var normalizedDocumentOptions = __assign({}, documentOptions);
    Object.keys(documentOptions).forEach(function (key) {
        switch (key) {
            case 'margins':
                normalizedDocumentOptions.margins = fixupMargins(documentOptions[key]);
                break;
            case 'fontSize':
            case 'complexScriptFontSize':
                normalizedDocumentOptions[key] = fixupFontSize(documentOptions[key]);
                break;
        }
    });
    return normalizedDocumentOptions;
};
function addFilesToContainer(zip, htmlString, suppliedDocumentOptions, headerHTMLString, footerHTMLString) {
    var normalizedDocumentOptions = normalizeDocumentOptions(suppliedDocumentOptions);
    var documentOptions = mergeOptions(defaultDocumentOptions, normalizedDocumentOptions);
    if (documentOptions.header && !headerHTMLString) {
        headerHTMLString = '<p></p>';
    }
    if (documentOptions.footer && !footerHTMLString) {
        footerHTMLString = '<p></p>';
    }
    var docxDocument = new docx_document_1.default(__assign({ zip: zip, htmlString: htmlString }, documentOptions));
    docxDocument.documentXML = helpers_1.renderDocumentFile(docxDocument);
    zip
        .folder('_rels')
        .file('.rels', xmlbuilder2_1.create({ encoding: 'UTF-8', standalone: true }, schemas_1.relsXML).toString({ prettyPrint: true }), { createFolders: false });
    zip.folder('docProps').file('core.xml', docxDocument.generateCoreXML(), {
        createFolders: false,
    });
    if (docxDocument.header && headerHTMLString) {
        var vTree = convertHTML(headerHTMLString);
        docxDocument.relationshipFilename = 'header1';
        var _a = docxDocument.generateHeaderXML(vTree), headerId = _a.headerId, headerXML = _a.headerXML;
        docxDocument.relationshipFilename = 'document';
        var relationshipId = docxDocument.createDocumentRelationships(docxDocument.relationshipFilename, 'header', "header" + headerId + ".xml", 'Internal');
        zip.folder('word').file("header" + headerId + ".xml", headerXML.toString({ prettyPrint: true }), {
            createFolders: false,
        });
        docxDocument.headerObjects.push({ headerId: headerId, relationshipId: relationshipId, type: docxDocument.headerType });
    }
    if (docxDocument.footer && footerHTMLString) {
        var vTree = convertHTML(footerHTMLString);
        docxDocument.relationshipFilename = 'footer1';
        var _b = docxDocument.generateFooterXML(vTree), footerId = _b.footerId, footerXML = _b.footerXML;
        docxDocument.relationshipFilename = 'document';
        var relationshipId = docxDocument.createDocumentRelationships(docxDocument.relationshipFilename, 'footer', "footer" + footerId + ".xml", 'Internal');
        zip.folder('word').file("footer" + footerId + ".xml", footerXML.toString({ prettyPrint: true }), {
            createFolders: false,
        });
        docxDocument.footerObjects.push({ footerId: footerId, relationshipId: relationshipId, type: docxDocument.footerType });
    }
    zip
        .folder('word')
        .file('document.xml', docxDocument.generateDocumentXML(), {
        createFolders: false,
    })
        .file('fontTable.xml', docxDocument.generateFontTableXML(), {
        createFolders: false,
    })
        .file('styles.xml', docxDocument.generateStylesXML(), {
        createFolders: false,
    })
        .file('numbering.xml', docxDocument.generateNumberingXML(), {
        createFolders: false,
    })
        .file('settings.xml', docxDocument.generateSettingsXML(), {
        createFolders: false,
    })
        .file('webSettings.xml', docxDocument.generateWebSettingsXML(), {
        createFolders: false,
    });
    var relationshipXMLs = docxDocument.generateRelsXML();
    if (relationshipXMLs && Array.isArray(relationshipXMLs)) {
        relationshipXMLs.forEach(function (_a) {
            var fileName = _a.fileName, xmlString = _a.xmlString;
            zip.folder('word').folder('_rels').file(fileName + ".xml.rels", xmlString, {
                createFolders: false,
            });
        });
    }
    zip.file('[Content_Types].xml', docxDocument.generateContentTypesXML(), { createFolders: false });
    return zip;
}
exports.addFilesToContainer = addFilesToContainer;
//# sourceMappingURL=html-to-docx.js.map