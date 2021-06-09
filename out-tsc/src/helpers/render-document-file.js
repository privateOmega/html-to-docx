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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertVTreeToXML = exports.buildList = exports.buildImage = void 0;
var xmlbuilder2_1 = require("xmlbuilder2");
var xmlBuilder = __importStar(require("./xml-builder"));
var namespaces_1 = __importDefault(require("./namespaces"));
var unit_conversion_1 = require("../utils/unit-conversion");
var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');
var isVNode = require('virtual-dom/vnode/is-vnode');
var isVText = require('virtual-dom/vnode/is-vtext');
var escape = require('escape-html');
var sizeOf = require('image-size');
var convertHTML = require('html-to-vdom')({
    VNode: VNode,
    VText: VText,
});
var buildImage = function (docxDocumentInstance, vNode, maximumWidth) {
    if (maximumWidth === void 0) { maximumWidth = null; }
    var response = null;
    try {
        response = docxDocumentInstance.createMediaFile(decodeURIComponent(vNode.properties.src));
    }
    catch (error) {
    }
    if (response) {
        docxDocumentInstance.zip
            .folder('word')
            .folder('media')
            .file(response.fileNameWithExtension, Buffer.from(response.fileContent, 'base64'), {
            createFolders: false,
        });
        var documentRelsId = docxDocumentInstance.createDocumentRelationships(docxDocumentInstance.relationshipFilename, 'image', "media/" + response.fileNameWithExtension, 'Internal');
        var imageBuffer = Buffer.from(response.fileContent, 'base64');
        var imageProperties = sizeOf(imageBuffer);
        var imageFragment = xmlBuilder.buildParagraph(vNode, __assign(__assign({ type: 'picture', inlineOrAnchored: true, relationshipId: documentRelsId }, response), { maximumWidth: maximumWidth || docxDocumentInstance.availableDocumentSpace, originalWidth: imageProperties.width, originalHeight: imageProperties.height }), docxDocumentInstance);
        return imageFragment;
    }
};
exports.buildImage = buildImage;
var buildList = function (vNode) {
    var listElements = [];
    var vNodeObjects = [{ node: vNode, level: 0, type: vNode.tagName }];
    var _loop_1 = function () {
        var tempVNodeObject = vNodeObjects.shift();
        if (isVText(tempVNodeObject.node) ||
            (isVNode(tempVNodeObject.node) && !['ul', 'ol', 'li'].includes(tempVNodeObject.node.tagName))) {
            listElements.push({
                node: tempVNodeObject.node,
                level: tempVNodeObject.level,
                type: tempVNodeObject.type,
            });
        }
        if (tempVNodeObject.node.children &&
            tempVNodeObject.node.children.length &&
            ['ul', 'ol', 'li'].includes(tempVNodeObject.node.tagName)) {
            var tempVNodeObjects = tempVNodeObject.node.children.reduce(function (accumulator, childVNode) {
                if (['ul', 'ol'].includes(childVNode.tagName)) {
                    accumulator.push({
                        node: childVNode,
                        level: tempVNodeObject.level + 1,
                        type: childVNode.tagName,
                    });
                }
                else {
                    if (accumulator.length > 0 &&
                        isVNode(accumulator[accumulator.length - 1].node) &&
                        accumulator[accumulator.length - 1].node.tagName.toLowerCase() === 'p') {
                        accumulator[accumulator.length - 1].node.children.push(childVNode);
                    }
                    else {
                        var paragraphVNode = new VNode('p', null, isVText(childVNode)
                            ? [childVNode]
                            :
                                isVNode(childVNode)
                                    ? childVNode.tagName.toLowerCase() === 'li'
                                        ? __spreadArray([], childVNode.children) : [childVNode]
                                    : []);
                        accumulator.push({
                            node: isVNode(childVNode)
                                ?
                                    childVNode.tagName.toLowerCase() === 'li'
                                        ? childVNode
                                        : childVNode.tagName.toLowerCase() !== 'p'
                                            ? paragraphVNode
                                            : childVNode
                                :
                                    paragraphVNode,
                            level: tempVNodeObject.level,
                            type: tempVNodeObject.type,
                        });
                    }
                }
                return accumulator;
            }, []);
            vNodeObjects = tempVNodeObjects.concat(vNodeObjects);
        }
    };
    while (vNodeObjects.length) {
        _loop_1();
    }
    return listElements;
};
exports.buildList = buildList;
function findXMLEquivalent(docxDocumentInstance, vNode, xmlFragment) {
    if (vNode.tagName === 'div' &&
        (vNode.properties.attributes.class === 'page-break' ||
            (vNode.properties.style && vNode.properties.style['page-break-after']))) {
        var paragraphFragment = xmlbuilder2_1.fragment({
            namespaceAlias: { w: namespaces_1.default.w },
        })
            .ele('@w', 'p')
            .ele('@w', 'r')
            .ele('@w', 'br')
            .att('@w', 'type', 'page')
            .up()
            .up()
            .up();
        xmlFragment.import(paragraphFragment);
        return;
    }
    switch (vNode.tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
            var fontSize = unit_conversion_1.pixelToHIP(unit_conversion_1.defaultHeadingSizesInPixel[vNode.tagName]);
            var lineHeight = xmlBuilder.fixupLineHeight(1, fontSize);
            var headingFragment = xmlBuilder.buildParagraph(vNode, {
                fontSize: fontSize,
                lineHeight: Math.max(lineHeight, 240),
                strong: 'bold',
                beforeSpacing: 240,
            }, docxDocumentInstance);
            xmlFragment.import(headingFragment);
            return;
        case 'span':
        case 'strong':
        case 'b':
        case 'em':
        case 'i':
        case 'u':
        case 'ins':
        case 'strike':
        case 'del':
        case 's':
        case 'sub':
        case 'sup':
        case 'mark':
        case 'p':
        case 'a':
        case 'blockquote':
            var paragraphFragment = xmlBuilder.buildParagraph(vNode, {}, docxDocumentInstance);
            xmlFragment.import(paragraphFragment);
            return;
        case 'figure':
            if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
                for (var index = 0; index < vNode.children.length; index++) {
                    var childVNode = vNode.children[index];
                    if (childVNode.tagName === 'table') {
                        var tableFragment_1 = xmlBuilder.buildTable(childVNode, {
                            maximumWidth: docxDocumentInstance.availableDocumentSpace,
                            rowCantSplit: docxDocumentInstance.tableRowCantSplit,
                        }, docxDocumentInstance);
                        xmlFragment.import(tableFragment_1);
                        var emptyParagraphFragment_1 = xmlBuilder.buildParagraph(null, {});
                        xmlFragment.import(emptyParagraphFragment_1);
                    }
                    else if (childVNode.tagName === 'img') {
                        var imageFragment_1 = exports.buildImage(docxDocumentInstance, childVNode);
                        if (imageFragment_1) {
                            xmlFragment.import(imageFragment_1);
                        }
                    }
                }
            }
            return;
        case 'table':
            var tableFragment = xmlBuilder.buildTable(vNode, {
                maximumWidth: docxDocumentInstance.availableDocumentSpace,
                rowCantSplit: docxDocumentInstance.tableRowCantSplit,
            }, docxDocumentInstance);
            xmlFragment.import(tableFragment);
            var emptyParagraphFragment = xmlBuilder.buildParagraph(null, {});
            xmlFragment.import(emptyParagraphFragment);
            return;
        case 'ol':
        case 'ul':
            var listElements = exports.buildList(vNode);
            var numberingId = docxDocumentInstance.createNumbering(listElements);
            for (var index = 0; index < listElements.length; index++) {
                var listElement = listElements[index];
                var paragraphFragment_1 = xmlBuilder.buildParagraph(listElement.node, {
                    numbering: { levelId: listElement.level, numberingId: numberingId },
                }, docxDocumentInstance);
                xmlFragment.import(paragraphFragment_1);
            }
            return;
        case 'img':
            var imageFragment = exports.buildImage(docxDocumentInstance, vNode);
            if (imageFragment) {
                xmlFragment.import(imageFragment);
            }
            return;
        case 'br':
            var linebreakFragment = xmlBuilder.buildParagraph(null, {});
            xmlFragment.import(linebreakFragment);
            return;
        default:
            break;
    }
    if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
        for (var index = 0; index < vNode.children.length; index++) {
            var childVNode = vNode.children[index];
            convertVTreeToXML(docxDocumentInstance, childVNode, xmlFragment);
        }
    }
}
function convertVTreeToXML(docxDocumentInstance, vTree, xmlFragment) {
    if (!vTree) {
        return '';
    }
    if (Array.isArray(vTree) && vTree.length) {
        for (var index = 0; index < vTree.length; index++) {
            var vNode = vTree[index];
            convertVTreeToXML(docxDocumentInstance, vNode, xmlFragment);
        }
    }
    else if (isVNode(vTree)) {
        findXMLEquivalent(docxDocumentInstance, vTree, xmlFragment);
    }
    else if (isVText(vTree)) {
        xmlBuilder.buildTextElement(xmlFragment, escape(String(vTree.text)));
    }
    return xmlFragment;
}
exports.convertVTreeToXML = convertVTreeToXML;
function renderDocumentFile(docxDocumentInstance) {
    var vTree = convertHTML(docxDocumentInstance.htmlString);
    var xmlFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    });
    var populatedXmlFragment = convertVTreeToXML(docxDocumentInstance, vTree, xmlFragment);
    return populatedXmlFragment;
}
exports.default = renderDocumentFile;
//# sourceMappingURL=render-document-file.js.map