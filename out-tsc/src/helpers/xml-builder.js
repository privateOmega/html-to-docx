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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixupLineHeight = exports.buildDrawing = exports.buildUnderline = exports.buildItalics = exports.buildBold = exports.buildTextElement = exports.buildIndentation = exports.buildLineBreak = exports.buildNumberingInstances = exports.buildTable = exports.buildParagraph = void 0;
var xmlbuilder2_1 = require("xmlbuilder2");
var namespaces_1 = __importDefault(require("./namespaces"));
var color_conversion_1 = require("../utils/color-conversion");
var unit_conversion_1 = require("../utils/unit-conversion");
var render_document_file_1 = require("./render-document-file");
var isVNode = require('virtual-dom/vnode/is-vnode');
var isVText = require('virtual-dom/vnode/is-vtext');
var colorNames = require('color-name');
var VText = require('virtual-dom/vnode/vtext');
var fixupColorCode = function (colorCodeString) {
    if (Object.prototype.hasOwnProperty.call(colorNames, colorCodeString.toLowerCase())) {
        var _a = colorNames[colorCodeString.toLowerCase()], red = _a[0], green = _a[1], blue = _a[2];
        return color_conversion_1.rgbToHex(red, green, blue);
    }
    else if (color_conversion_1.rgbRegex.test(colorCodeString)) {
        var matchedParts = colorCodeString.match(color_conversion_1.rgbRegex);
        var red = matchedParts[1];
        var green = matchedParts[2];
        var blue = matchedParts[3];
        return color_conversion_1.rgbToHex(red, green, blue);
    }
    else if (color_conversion_1.hslRegex.test(colorCodeString)) {
        var matchedParts = colorCodeString.match(color_conversion_1.hslRegex);
        var hue = matchedParts[1];
        var saturation = matchedParts[2];
        var luminosity = matchedParts[3];
        return color_conversion_1.hslToHex(hue, saturation, luminosity);
    }
    else if (color_conversion_1.hexRegex.test(colorCodeString)) {
        var matchedParts = colorCodeString.match(color_conversion_1.hexRegex);
        return matchedParts[1];
    }
    else if (color_conversion_1.hex3Regex.test(colorCodeString)) {
        var matchedParts = colorCodeString.match(color_conversion_1.hex3Regex);
        var red = matchedParts[1];
        var green = matchedParts[2];
        var blue = matchedParts[3];
        return color_conversion_1.hex3ToHex(red, green, blue);
    }
    else {
        return '000000';
    }
};
var buildRunStyleFragment = function (type) {
    if (type === void 0) { type = 'Hyperlink'; }
    var runStyleFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'rStyle')
        .att('@w', 'val', type)
        .up();
    return runStyleFragment;
};
var buildTableRowHeight = function (tableRowHeight) {
    var tableRowHeightFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'trHeight')
        .att('@w', 'val', tableRowHeight)
        .att('@w', 'hRule', 'atLeast')
        .up();
    return tableRowHeightFragment;
};
var buildVerticalAlignment = function (verticalAlignment) {
    if (verticalAlignment.toLowerCase() === 'middle') {
        verticalAlignment = 'center';
    }
    var verticalAlignmentFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'vAlign')
        .att('@w', 'val', verticalAlignment)
        .up();
    return verticalAlignmentFragment;
};
var buildVerticalMerge = function (verticalMerge) {
    if (verticalMerge === void 0) { verticalMerge = 'continue'; }
    var verticalMergeFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'vMerge')
        .att('@w', 'val', verticalMerge)
        .up();
    return verticalMergeFragment;
};
var buildColor = function (colorCode) {
    var colorFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'color')
        .att('@w', 'val', colorCode)
        .up();
    return colorFragment;
};
var buildFontSize = function (fontSize) {
    var fontSizeFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'sz')
        .att('@w', 'val', fontSize)
        .up();
    return fontSizeFragment;
};
var buildShading = function (colorCode) {
    var shadingFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'shd')
        .att('@w', 'val', 'clear')
        .att('@w', 'fill', colorCode)
        .up();
    return shadingFragment;
};
var buildHighlight = function (color) {
    if (color === void 0) { color = 'yellow'; }
    var highlightFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'highlight')
        .att('@w', 'val', color)
        .up();
    return highlightFragment;
};
var buildVertAlign = function (type) {
    if (type === void 0) { type = 'baseline'; }
    var vertAlignFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'vertAlign')
        .att('@w', 'val', type)
        .up();
    return vertAlignFragment;
};
var buildStrike = function () {
    var strikeFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'strike')
        .att('@w', 'val', "true")
        .up();
    return strikeFragment;
};
var buildBold = function () {
    var boldFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'b')
        .up();
    return boldFragment;
};
exports.buildBold = buildBold;
var buildItalics = function () {
    var italicsFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'i')
        .up();
    return italicsFragment;
};
exports.buildItalics = buildItalics;
var buildUnderline = function (type) {
    if (type === void 0) { type = 'single'; }
    var underlineFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'u')
        .att('@w', 'val', type)
        .up();
    return underlineFragment;
};
exports.buildUnderline = buildUnderline;
var buildLineBreak = function (type) {
    if (type === void 0) { type = 'textWrapping'; }
    var lineBreakFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'br')
        .att('@w', 'type', type)
        .up();
    return lineBreakFragment;
};
exports.buildLineBreak = buildLineBreak;
var buildBorder = function (borderSide, borderSize, borderSpacing, borderColor, borderStroke) {
    if (borderSide === void 0) { borderSide = 'top'; }
    if (borderSize === void 0) { borderSize = 0; }
    if (borderSpacing === void 0) { borderSpacing = 0; }
    if (borderColor === void 0) { borderColor = fixupColorCode('black'); }
    if (borderStroke === void 0) { borderStroke = 'single'; }
    var borderFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', borderSide)
        .att('@w', 'val', borderStroke)
        .att('@w', 'sz', borderSize.toString())
        .att('@w', 'space', borderSpacing.toString())
        .att('@w', 'color', borderColor)
        .up();
    return borderFragment;
};
var buildTextElement = function (text) {
    var textFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 't')
        .att('@xml', 'space', 'preserve')
        .txt(text)
        .up();
    return textFragment;
};
exports.buildTextElement = buildTextElement;
var buildRunProperties = function (attributes) {
    var runPropertiesFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'rPr');
    if (attributes && attributes.constructor === Object) {
        Object.keys(attributes).forEach(function (key) {
            switch (key) {
                case 'strong':
                    var boldFragment = buildBold();
                    runPropertiesFragment.import(boldFragment);
                    break;
                case 'i':
                    var italicsFragment = buildItalics();
                    runPropertiesFragment.import(italicsFragment);
                    break;
                case 'u':
                    var underlineFragment = buildUnderline();
                    runPropertiesFragment.import(underlineFragment);
                    break;
                case 'color':
                    var colorFragment = buildColor(attributes[key]);
                    runPropertiesFragment.import(colorFragment);
                    break;
                case 'backgroundColor':
                    var shadingFragment = buildShading(attributes[key]);
                    runPropertiesFragment.import(shadingFragment);
                    break;
                case 'fontSize':
                    var fontSizeFragment = buildFontSize(attributes[key]);
                    runPropertiesFragment.import(fontSizeFragment);
                    break;
                case 'hyperlink':
                    var hyperlinkStyleFragment = buildRunStyleFragment('Hyperlink');
                    runPropertiesFragment.import(hyperlinkStyleFragment);
                    break;
            }
        });
    }
    runPropertiesFragment.up();
    return runPropertiesFragment;
};
var buildTextFormatting = function (vNode) {
    switch (vNode.tagName) {
        case 'strong':
        case 'b':
            var boldFragment = buildBold();
            return boldFragment;
        case 'em':
        case 'i':
            var italicsFragment = buildItalics();
            return italicsFragment;
        case 'ins':
        case 'u':
            var underlineFragment = buildUnderline();
            return underlineFragment;
        case 'strike':
        case 'del':
        case 's':
            var strikeFragment = buildStrike();
            return strikeFragment;
        case 'sub':
            var subscriptFragment = buildVertAlign('subscript');
            return subscriptFragment;
        case 'sup':
            var superscriptFragment = buildVertAlign('superscript');
            return superscriptFragment;
        case 'mark':
            var highlightFragment = buildHighlight();
            return highlightFragment;
    }
};
var buildRun = function (vNode, attributes) {
    var runFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'r');
    var runPropertiesFragment = buildRunProperties(attributes);
    if (isVNode(vNode) &&
        [
            'span',
            'strong',
            'b',
            'em',
            'i',
            'u',
            'ins',
            'strike',
            'del',
            's',
            'sub',
            'sup',
            'mark',
            'blockquote',
        ].includes(vNode.tagName)) {
        var textArray = [];
        var vNodes = [vNode];
        while (vNodes.length) {
            var tempVNode = vNodes.shift();
            if (isVText(tempVNode)) {
                textArray.push(tempVNode.text);
            }
            if (isVNode(tempVNode) &&
                ['strong', 'b', 'em', 'i', 'u', 'ins', 'strike', 'del', 's', 'sub', 'sup', 'mark'].includes(tempVNode.tagName)) {
                var formattingFragment = buildTextFormatting(tempVNode);
                runPropertiesFragment.import(formattingFragment);
            }
            if (tempVNode.children && tempVNode.children.length) {
                vNodes = tempVNode.children.slice().concat(vNodes);
            }
        }
        if (textArray.length) {
            var combinedString = textArray.join('');
            vNode = new VText(combinedString);
        }
    }
    runFragment.import(runPropertiesFragment);
    if (isVText(vNode)) {
        var textFragment = buildTextElement(vNode.text);
        runFragment.import(textFragment);
    }
    else if (attributes && attributes.type === 'picture') {
        var type = attributes.type, inlineOrAnchored = attributes.inlineOrAnchored, otherAttributes = __rest(attributes, ["type", "inlineOrAnchored"]);
        var imageFragment = buildDrawing(inlineOrAnchored, type, otherAttributes);
        runFragment.import(imageFragment);
    }
    else if (isVNode(vNode) && vNode.tagName === 'br') {
        var lineBreakFragment = buildLineBreak();
        runFragment.import(lineBreakFragment);
    }
    runFragment.up();
    return runFragment;
};
var fixupLineHeight = function (lineHeight, fontSize) {
    if (!isNaN(lineHeight)) {
        if (fontSize) {
            var actualLineHeight = +lineHeight * fontSize;
            return unit_conversion_1.HIPToTWIP(actualLineHeight);
        }
        else {
            return +lineHeight * 240;
        }
    }
    else {
        return 240;
    }
};
exports.fixupLineHeight = fixupLineHeight;
var fixupFontSize = function (fontSizeString) {
    if (unit_conversion_1.pointRegex.test(fontSizeString)) {
        var matchedParts = fontSizeString.match(unit_conversion_1.pointRegex);
        return unit_conversion_1.pointToHIP(matchedParts[1]);
    }
    else if (unit_conversion_1.pixelRegex.test(fontSizeString)) {
        var matchedParts = fontSizeString.match(unit_conversion_1.pixelRegex);
        return unit_conversion_1.pixelToHIP(matchedParts[1]);
    }
};
var fixupRowHeight = function (rowHeightString) {
    if (unit_conversion_1.pointRegex.test(rowHeightString)) {
        var matchedParts = rowHeightString.match(unit_conversion_1.pointRegex);
        return unit_conversion_1.pointToTWIP(matchedParts[1]);
    }
    else if (unit_conversion_1.pixelRegex.test(rowHeightString)) {
        var matchedParts = rowHeightString.match(unit_conversion_1.pixelRegex);
        return unit_conversion_1.pixelToTWIP(matchedParts[1]);
    }
};
var buildRunOrRuns = function (vNode, attributes) {
    if (isVNode(vNode) && vNode.tagName === 'span') {
        var runFragments = [];
        for (var index = 0; index < vNode.children.length; index++) {
            var childVNode = vNode.children[index];
            var modifiedAttributes = __assign({}, attributes);
            if (isVNode(vNode) && vNode.properties && vNode.properties.style) {
                if (vNode.properties.style.color &&
                    !['transparent', 'auto'].includes(vNode.properties.style.color)) {
                    modifiedAttributes.color = fixupColorCode(vNode.properties.style.color);
                }
                if (vNode.properties.style['background-color'] &&
                    !['transparent', 'auto'].includes(vNode.properties.style['background-color'])) {
                    modifiedAttributes.backgroundColor = fixupColorCode(vNode.properties.style['background-color']);
                }
                if (vNode.properties.style['font-size']) {
                    modifiedAttributes.fontSize = fixupFontSize(vNode.properties.style['font-size']);
                }
            }
            runFragments.push(buildRun(childVNode, modifiedAttributes));
        }
        return runFragments;
    }
    else {
        var runFragment = buildRun(vNode, attributes);
        return runFragment;
    }
};
var buildRunOrHyperLink = function (vNode, attributes, docxDocumentInstance) {
    if (isVNode(vNode) && vNode.tagName === 'a') {
        var relationshipId = docxDocumentInstance.createDocumentRelationships(docxDocumentInstance.relationshipFilename, 'hyperlink', vNode.properties && vNode.properties.href ? vNode.properties.href : '');
        var hyperlinkFragment = xmlbuilder2_1.fragment({
            namespaceAlias: { w: namespaces_1.default.w, r: namespaces_1.default.r },
        })
            .ele('@w', 'hyperlink')
            .att('@r', 'id', "rId" + relationshipId);
        var modifiedAttributes = __assign({}, attributes);
        modifiedAttributes.hyperlink = true;
        var runFragments_1 = buildRunOrRuns(vNode.children[0], modifiedAttributes);
        if (Array.isArray(runFragments_1)) {
            for (var index = 0; index < runFragments_1.length; index++) {
                var runFragment = runFragments_1[index];
                hyperlinkFragment.import(runFragment);
            }
        }
        else {
            hyperlinkFragment.import(runFragments_1);
        }
        hyperlinkFragment.up();
        return hyperlinkFragment;
    }
    var runFragments = buildRunOrRuns(vNode, attributes);
    return runFragments;
};
var buildNumberingProperties = function (levelId, numberingId) {
    var numberingPropertiesFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'numPr')
        .ele('@w', 'ilvl')
        .att('@w', 'val', String(levelId))
        .up()
        .ele('@w', 'numId')
        .att('@w', 'val', String(numberingId))
        .up()
        .up();
    return numberingPropertiesFragment;
};
var buildNumberingInstances = function () {
    var numberingInstancesFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'num')
        .ele('@w', 'abstractNumId')
        .up()
        .up();
    return numberingInstancesFragment;
};
exports.buildNumberingInstances = buildNumberingInstances;
var buildSpacing = function (lineSpacing, beforeSpacing, afterSpacing) {
    var spacingFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'spacing');
    if (lineSpacing) {
        spacingFragment.att('@w', 'line', lineSpacing);
    }
    if (beforeSpacing) {
        spacingFragment.att('@w', 'before', beforeSpacing);
    }
    if (afterSpacing) {
        spacingFragment.att('@w', 'after', afterSpacing);
    }
    spacingFragment.att('@w', 'lineRule', 'exact').up();
    return spacingFragment;
};
var buildIndentation = function (left) {
    if (left === void 0) { left = 720; }
    var indentationFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'ind')
        .att('@w', 'left', left.toString())
        .up();
    return indentationFragment;
};
exports.buildIndentation = buildIndentation;
var buildHorizontalAlignment = function (horizontalAlignment) {
    if (horizontalAlignment === 'justify') {
        horizontalAlignment = 'both';
    }
    var horizontalAlignmentFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'jc')
        .att('@w', 'val', horizontalAlignment)
        .up();
    return horizontalAlignmentFragment;
};
var buildParagraphBorder = function () {
    var paragraphBorderFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'pBdr');
    var bordersObject = {
        top: {
            size: 0,
            spacing: 3,
            color: 'FFFFFF',
        },
        left: {
            size: 0,
            spacing: 3,
            color: 'FFFFFF',
        },
        bottom: {
            size: 0,
            spacing: 3,
            color: 'FFFFFF',
        },
        right: {
            size: 0,
            spacing: 3,
            color: 'FFFFFF',
        },
    };
    Object.keys(bordersObject).forEach(function (borderName) {
        if (bordersObject[borderName]) {
            var _a = bordersObject[borderName], size = _a.size, spacing = _a.spacing, color = _a.color;
            var borderFragment = buildBorder(borderName, size, spacing, color);
            paragraphBorderFragment.import(borderFragment);
        }
    });
    paragraphBorderFragment.up();
    return paragraphBorderFragment;
};
var buildParagraphProperties = function (attributes) {
    var paragraphPropertiesFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'pPr');
    if (attributes && attributes.constructor === Object) {
        Object.keys(attributes).forEach(function (key) {
            switch (key) {
                case 'numbering':
                    var _a = attributes[key], levelId = _a.levelId, numberingId = _a.numberingId;
                    var numberingPropertiesFragment = buildNumberingProperties(levelId, numberingId);
                    paragraphPropertiesFragment.import(numberingPropertiesFragment);
                    delete attributes.numbering;
                    break;
                case 'textAlign':
                    var horizontalAlignmentFragment = buildHorizontalAlignment(attributes[key]);
                    paragraphPropertiesFragment.import(horizontalAlignmentFragment);
                    delete attributes.textAlign;
                    break;
                case 'backgroundColor':
                    if (attributes.display === 'block') {
                        var shadingFragment = buildShading(attributes[key]);
                        paragraphPropertiesFragment.import(shadingFragment);
                        var paragraphBorderFragment = buildParagraphBorder();
                        paragraphPropertiesFragment.import(paragraphBorderFragment);
                        delete attributes.backgroundColor;
                    }
                    break;
                case 'indentation':
                    var indentationFragment = buildIndentation(attributes[key].left);
                    paragraphPropertiesFragment.import(indentationFragment);
                    delete attributes.indentation;
                    break;
            }
        });
        var spacingFragment = buildSpacing(attributes.lineHeight, attributes.beforeSpacing, attributes.afterSpacing);
        delete attributes.lineHeight;
        delete attributes.beforeSpacing;
        delete attributes.afterSpacing;
        paragraphPropertiesFragment.import(spacingFragment);
    }
    paragraphPropertiesFragment.up();
    return paragraphPropertiesFragment;
};
var computeImageDimensions = function (vNode, attributes) {
    var maximumWidth = attributes.maximumWidth, originalWidth = attributes.originalWidth, originalHeight = attributes.originalHeight;
    var aspectRatio = originalWidth / originalHeight;
    var maximumWidthInEMU = unit_conversion_1.TWIPToEMU(maximumWidth);
    var originalWidthInEMU = unit_conversion_1.pixelToEMU(originalWidth);
    var originalHeightInEMU = unit_conversion_1.pixelToEMU(originalHeight);
    if (originalWidthInEMU > maximumWidthInEMU) {
        originalWidthInEMU = maximumWidthInEMU;
        originalHeightInEMU = Math.round(originalWidthInEMU / aspectRatio);
    }
    var modifiedHeight;
    var modifiedWidth;
    if (vNode.properties && vNode.properties.style) {
        if (vNode.properties.style.width) {
            if (vNode.properties.style.width !== 'auto') {
                if (unit_conversion_1.pixelRegex.test(vNode.properties.style.width)) {
                    modifiedWidth = unit_conversion_1.pixelToEMU(vNode.properties.style.width.match(unit_conversion_1.pixelRegex)[1]);
                }
                else if (unit_conversion_1.percentageRegex.test(vNode.properties.style.width)) {
                    var percentageValue = vNode.properties.style.width.match(unit_conversion_1.percentageRegex)[1];
                    modifiedWidth = Math.round((percentageValue / 100) * originalWidthInEMU);
                }
            }
            else {
                if (vNode.properties.style.height && vNode.properties.style.height === 'auto') {
                    modifiedWidth = originalWidthInEMU;
                    modifiedHeight = originalHeightInEMU;
                }
            }
        }
        if (vNode.properties.style.height) {
            if (vNode.properties.style.height !== 'auto') {
                if (unit_conversion_1.pixelRegex.test(vNode.properties.style.height)) {
                    modifiedHeight = unit_conversion_1.pixelToEMU(vNode.properties.style.height.match(unit_conversion_1.pixelRegex)[1]);
                }
                else if (unit_conversion_1.percentageRegex.test(vNode.properties.style.height)) {
                    var percentageValue = vNode.properties.style.width.match(unit_conversion_1.percentageRegex)[1];
                    modifiedHeight = Math.round((percentageValue / 100) * originalHeightInEMU);
                    if (!modifiedWidth) {
                        modifiedWidth = Math.round(modifiedHeight * aspectRatio);
                    }
                }
            }
            else {
                if (modifiedWidth) {
                    if (!modifiedHeight) {
                        modifiedHeight = Math.round(modifiedWidth / aspectRatio);
                    }
                }
                else {
                    modifiedHeight = originalHeightInEMU;
                    modifiedWidth = originalWidthInEMU;
                }
            }
        }
        if (modifiedWidth && !modifiedHeight) {
            modifiedHeight = Math.round(modifiedWidth / aspectRatio);
        }
        else if (modifiedHeight && !modifiedWidth) {
            modifiedWidth = Math.round(modifiedHeight * aspectRatio);
        }
    }
    else {
        modifiedWidth = originalWidthInEMU;
        modifiedHeight = originalHeightInEMU;
    }
    attributes.width = modifiedWidth;
    attributes.height = modifiedHeight;
};
var buildParagraph = function (vNode, attributes, docxDocumentInstance) {
    var paragraphFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'p');
    var modifiedAttributes = __assign({}, attributes);
    if (isVNode(vNode) && vNode.properties && vNode.properties.style) {
        if (vNode.properties.style.color &&
            !['transparent', 'auto'].includes(vNode.properties.style.color)) {
            modifiedAttributes.color = fixupColorCode(vNode.properties.style.color);
        }
        if (vNode.properties.style['background-color'] &&
            !['transparent', 'auto'].includes(vNode.properties.style['background-color'])) {
            modifiedAttributes.backgroundColor = fixupColorCode(vNode.properties.style['background-color']);
        }
        if (vNode.properties.style['vertical-align'] &&
            ['top', 'middle', 'bottom'].includes(vNode.properties.style['vertical-align'])) {
            modifiedAttributes.verticalAlign = vNode.properties.style['vertical-align'];
        }
        if (vNode.properties.style['text-align'] &&
            ['left', 'right', 'center', 'justify'].includes(vNode.properties.style['text-align'])) {
            modifiedAttributes.textAlign = vNode.properties.style['text-align'];
        }
        if (vNode.properties.style['font-weight'] && vNode.properties.style['font-weight'] === 'bold') {
            modifiedAttributes.strong = vNode.properties.style['font-weight'];
        }
        if (vNode.properties.style['font-size']) {
            modifiedAttributes.fontSize = fixupFontSize(vNode.properties.style['font-size']);
        }
        if (vNode.properties.style['line-height']) {
            modifiedAttributes.lineHeight = fixupLineHeight(vNode.properties.style['line-height'], vNode.properties.style['font-size']
                ? fixupFontSize(vNode.properties.style['font-size'])
                : null);
        }
        if (vNode.properties.style.display) {
            modifiedAttributes.display = vNode.properties.style.display;
        }
    }
    if (isVNode(vNode) && vNode.tagName === 'blockquote') {
        modifiedAttributes.indentation = { left: 284 };
        modifiedAttributes.textAlign = 'justify';
    }
    var paragraphPropertiesFragment = buildParagraphProperties(modifiedAttributes);
    paragraphFragment.import(paragraphPropertiesFragment);
    if (isVNode(vNode) && vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
        if ([
            'span',
            'strong',
            'b',
            'em',
            'i',
            'u',
            'ins',
            'strike',
            'del',
            's',
            'sub',
            'sup',
            'mark',
            'a',
        ].includes(vNode.tagName)) {
            var runOrHyperlinkFragments = buildRunOrHyperLink(vNode, modifiedAttributes, docxDocumentInstance);
            if (Array.isArray(runOrHyperlinkFragments)) {
                for (var iteratorIndex = 0; iteratorIndex < runOrHyperlinkFragments.length; iteratorIndex++) {
                    var runOrHyperlinkFragment = runOrHyperlinkFragments[iteratorIndex];
                    paragraphFragment.import(runOrHyperlinkFragment);
                }
            }
            else {
                paragraphFragment.import(runOrHyperlinkFragments);
            }
        }
        else if (vNode.tagName === 'blockquote') {
            var runFragment = buildRun(vNode, attributes);
            paragraphFragment.import(runFragment);
        }
        else {
            for (var index = 0; index < vNode.children.length; index++) {
                var childVNode = vNode.children[index];
                var runOrHyperlinkFragments = buildRunOrHyperLink(childVNode, modifiedAttributes, docxDocumentInstance);
                if (Array.isArray(runOrHyperlinkFragments)) {
                    for (var iteratorIndex = 0; iteratorIndex < runOrHyperlinkFragments.length; iteratorIndex++) {
                        var runOrHyperlinkFragment = runOrHyperlinkFragments[iteratorIndex];
                        paragraphFragment.import(runOrHyperlinkFragment);
                    }
                }
                else {
                    paragraphFragment.import(runOrHyperlinkFragments);
                }
            }
        }
    }
    else {
        if (isVNode(vNode) && vNode.tagName === 'img') {
            computeImageDimensions(vNode, modifiedAttributes);
        }
        var runFragments = buildRunOrRuns(vNode, modifiedAttributes);
        if (Array.isArray(runFragments)) {
            for (var index = 0; index < runFragments.length; index++) {
                var runFragment = runFragments[index];
                paragraphFragment.import(runFragment);
            }
        }
        else {
            paragraphFragment.import(runFragments);
        }
    }
    paragraphFragment.up();
    return paragraphFragment;
};
exports.buildParagraph = buildParagraph;
var buildGridSpanFragment = function (spanValue) {
    var gridSpanFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'gridSpan')
        .att('@w', 'val', spanValue)
        .up();
    return gridSpanFragment;
};
var buildTableCellSpacing = function (cellSpacing) {
    if (cellSpacing === void 0) { cellSpacing = 0; }
    var tableCellSpacingFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'tblCellSpacing')
        .att('@w', 'w', cellSpacing.toString())
        .att('@w', 'type', 'dxa')
        .up();
    return tableCellSpacingFragment;
};
var buildTableCellBorders = function (tableCellBorder) {
    var tableCellBordersFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'tcBorders');
    var color = tableCellBorder.color, stroke = tableCellBorder.stroke, borders = __rest(tableCellBorder, ["color", "stroke"]);
    Object.keys(borders).forEach(function (border) {
        if (tableCellBorder[border]) {
            var borderFragment = buildBorder(border, tableCellBorder[border], 0, color, stroke);
            tableCellBordersFragment.import(borderFragment);
        }
    });
    tableCellBordersFragment.up();
    return tableCellBordersFragment;
};
var buildTableCellProperties = function (attributes) {
    var tableCellPropertiesFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'tcPr');
    if (attributes && attributes.constructor === Object) {
        Object.keys(attributes).forEach(function (key) {
            switch (key) {
                case 'backgroundColor':
                    var shadingFragment = buildShading(attributes[key]);
                    tableCellPropertiesFragment.import(shadingFragment);
                    delete attributes.backgroundColor;
                    break;
                case 'verticalAlign':
                    var verticalAlignmentFragment = buildVerticalAlignment(attributes[key]);
                    tableCellPropertiesFragment.import(verticalAlignmentFragment);
                    delete attributes.verticalAlign;
                    break;
                case 'colSpan':
                    var gridSpanFragment = buildGridSpanFragment(attributes[key]);
                    tableCellPropertiesFragment.import(gridSpanFragment);
                    delete attributes.colSpan;
                    break;
                case 'tableCellBorder':
                    var tableCellBorderFragment = buildTableCellBorders(attributes[key]);
                    tableCellPropertiesFragment.import(tableCellBorderFragment);
                    delete attributes.tableCellBorder;
                    break;
                case 'rowSpan':
                    var verticalMergeFragment = buildVerticalMerge(attributes[key]);
                    tableCellPropertiesFragment.import(verticalMergeFragment);
                    delete attributes.rowSpan;
                    break;
            }
        });
    }
    tableCellPropertiesFragment.up();
    return tableCellPropertiesFragment;
};
var fixupTableCellBorder = function (vNode, attributes) {
    if (Object.prototype.hasOwnProperty.call(vNode.properties.style, 'border')) {
        if (vNode.properties.style.border === 'none' || vNode.properties.style.border === 0) {
            attributes.tableCellBorder = {};
        }
        else {
            var _a = cssBorderParser(vNode.properties.style.border), borderSize = _a[0], borderStroke = _a[1], borderColor = _a[2];
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
        attributes.tableCellBorder = __assign(__assign({}, attributes.tableCellBorder), { top: 0 });
    }
    else if (vNode.properties.style['border-top'] && vNode.properties.style['border-top'] !== '0') {
        var _b = cssBorderParser(vNode.properties.style['border-top']), borderSize = _b[0], borderStroke = _b[1], borderColor = _b[2];
        attributes.tableCellBorder = __assign(__assign({}, attributes.tableCellBorder), { top: borderSize, color: borderColor, stroke: borderStroke });
    }
    if (vNode.properties.style['border-left'] && vNode.properties.style['border-left'] === '0') {
        attributes.tableCellBorder = __assign(__assign({}, attributes.tableCellBorder), { left: 0 });
    }
    else if (vNode.properties.style['border-left'] &&
        vNode.properties.style['border-left'] !== '0') {
        var _c = cssBorderParser(vNode.properties.style['border-left']), borderSize = _c[0], borderStroke = _c[1], borderColor = _c[2];
        attributes.tableCellBorder = __assign(__assign({}, attributes.tableCellBorder), { left: borderSize, color: borderColor, stroke: borderStroke });
    }
    if (vNode.properties.style['border-bottom'] && vNode.properties.style['border-bottom'] === '0') {
        attributes.tableCellBorder = __assign(__assign({}, attributes.tableCellBorder), { bottom: 0 });
    }
    else if (vNode.properties.style['border-bottom'] &&
        vNode.properties.style['border-bottom'] !== '0') {
        var _d = cssBorderParser(vNode.properties.style['border-bottom']), borderSize = _d[0], borderStroke = _d[1], borderColor = _d[2];
        attributes.tableCellBorder = __assign(__assign({}, attributes.tableCellBorder), { bottom: borderSize, color: borderColor, stroke: borderStroke });
    }
    if (vNode.properties.style['border-right'] && vNode.properties.style['border-right'] === '0') {
        attributes.tableCellBorder = __assign(__assign({}, attributes.tableCellBorder), { right: 0 });
    }
    else if (vNode.properties.style['border-right'] &&
        vNode.properties.style['border-right'] !== '0') {
        var _e = cssBorderParser(vNode.properties.style['border-right']), borderSize = _e[0], borderStroke = _e[1], borderColor = _e[2];
        attributes.tableCellBorder = __assign(__assign({}, attributes.tableCellBorder), { right: borderSize, color: borderColor, stroke: borderStroke });
    }
};
var buildTableCell = function (vNode, attributes, rowSpanMap, columnIndex, docxDocumentInstance) {
    var tableCellFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'tc');
    var modifiedAttributes = __assign({}, attributes);
    if (isVNode(vNode) && vNode.properties) {
        if (vNode.properties.rowSpan) {
            rowSpanMap.set(columnIndex.index, { rowSpan: vNode.properties.rowSpan - 1, colSpan: 0 });
            modifiedAttributes.rowSpan = 'restart';
        }
        else {
            var previousSpanObject = rowSpanMap.get(columnIndex.index);
            rowSpanMap.set(columnIndex.index, Object.assign({}, previousSpanObject, {
                rowSpan: 0,
                colSpan: (previousSpanObject && previousSpanObject.colSpan) || 0,
            }));
        }
        if (vNode.properties.colSpan ||
            (vNode.properties.style && vNode.properties.style['column-span'])) {
            modifiedAttributes.colSpan =
                vNode.properties.colSpan ||
                    (vNode.properties.style && vNode.properties.style['column-span']);
            var previousSpanObject = rowSpanMap.get(columnIndex.index);
            rowSpanMap.set(columnIndex.index, Object.assign({}, previousSpanObject, {
                colSpan: parseInt(modifiedAttributes.colSpan) || 0,
            }));
            columnIndex.index += parseInt(modifiedAttributes.colSpan) - 1;
        }
        if (vNode.properties.style) {
            if (vNode.properties.style.color &&
                !['transparent', 'auto'].includes(vNode.properties.style.color)) {
                modifiedAttributes.color = fixupColorCode(vNode.properties.style.color);
            }
            if (vNode.properties.style['background-color'] &&
                !['transparent', 'auto'].includes(vNode.properties.style['background-color'])) {
                modifiedAttributes.backgroundColor = fixupColorCode(vNode.properties.style['background-color']);
            }
            if (vNode.properties.style['vertical-align'] &&
                ['top', 'middle', 'bottom'].includes(vNode.properties.style['vertical-align'])) {
                modifiedAttributes.verticalAlign = vNode.properties.style['vertical-align'];
            }
            fixupTableCellBorder(vNode, modifiedAttributes);
        }
    }
    var tableCellPropertiesFragment = buildTableCellProperties(modifiedAttributes);
    tableCellFragment.import(tableCellPropertiesFragment);
    if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
        for (var index = 0; index < vNode.children.length; index++) {
            var childVNode = vNode.children[index];
            if (isVNode(childVNode) && childVNode.tagName === 'img') {
                var imageFragment = render_document_file_1.buildImage(docxDocumentInstance, childVNode, modifiedAttributes.maximumWidth);
                if (imageFragment) {
                    tableCellFragment.import(imageFragment);
                }
            }
            else if (isVNode(childVNode) && childVNode.tagName === 'figure') {
                if (childVNode.children &&
                    Array.isArray(childVNode.children) &&
                    childVNode.children.length) {
                    for (var iteratorIndex = 0; iteratorIndex < childVNode.children.length; iteratorIndex++) {
                        var grandChildVNode = childVNode.children[iteratorIndex];
                        if (grandChildVNode.tagName === 'img') {
                            var imageFragment = render_document_file_1.buildImage(docxDocumentInstance, grandChildVNode, modifiedAttributes.maximumWidth);
                            if (imageFragment) {
                                tableCellFragment.import(imageFragment);
                            }
                        }
                    }
                }
            }
            else {
                var paragraphFragment = buildParagraph(childVNode, modifiedAttributes, docxDocumentInstance);
                tableCellFragment.import(paragraphFragment);
            }
        }
    }
    else {
        var paragraphFragment = xmlbuilder2_1.fragment({
            namespaceAlias: { w: namespaces_1.default.w },
        })
            .ele('@w', 'p')
            .up();
        tableCellFragment.import(paragraphFragment);
    }
    tableCellFragment.up();
    return tableCellFragment;
};
var buildRowSpanCell = function (rowSpanMap, columnIndex, attributes) {
    var rowSpanCellFragments = [];
    var spanObject = rowSpanMap.get(columnIndex.index);
    while (spanObject && spanObject.rowSpan) {
        var rowSpanCellFragment = xmlbuilder2_1.fragment({
            namespaceAlias: { w: namespaces_1.default.w },
        }).ele('@w', 'tc');
        var tableCellPropertiesFragment = buildTableCellProperties(__assign(__assign({}, attributes), { rowSpan: 'continue', colSpan: spanObject.colSpan ? spanObject.colSpan : 0 }));
        rowSpanCellFragment.import(tableCellPropertiesFragment);
        var paragraphFragment = xmlbuilder2_1.fragment({
            namespaceAlias: { w: namespaces_1.default.w },
        })
            .ele('@w', 'p')
            .up();
        rowSpanCellFragment.import(paragraphFragment);
        rowSpanCellFragment.up();
        rowSpanCellFragments.push(rowSpanCellFragment);
        if (spanObject.rowSpan - 1 === 0) {
            rowSpanMap.delete(columnIndex.index);
        }
        else {
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
var buildTableRowProperties = function (attributes) {
    var tableRowPropertiesFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'trPr');
    if (attributes && attributes.constructor === Object) {
        Object.keys(attributes).forEach(function (key) {
            switch (key) {
                case 'tableRowHeight':
                    var tableRowHeightFragment = buildTableRowHeight(attributes[key]);
                    tableRowPropertiesFragment.import(tableRowHeightFragment);
                    delete attributes.tableRowHeight;
                    break;
                case 'rowCantSplit':
                    if (attributes.rowCantSplit) {
                        var cantSplitFragment = xmlbuilder2_1.fragment({
                            namespaceAlias: { w: namespaces_1.default.w },
                        })
                            .ele('@w', 'cantSplit')
                            .up();
                        tableRowPropertiesFragment.import(cantSplitFragment);
                        delete attributes.rowCantSplit;
                    }
                    break;
            }
        });
    }
    tableRowPropertiesFragment.up();
    return tableRowPropertiesFragment;
};
var buildTableRow = function (vNode, attributes, rowSpanMap, docxDocumentInstance) {
    var tableRowFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'tr');
    var modifiedAttributes = __assign({}, attributes);
    if (isVNode(vNode) && vNode.properties) {
        if ((vNode.properties.style && vNode.properties.style.height) ||
            (vNode.children[0] &&
                isVNode(vNode.children[0]) &&
                vNode.children[0].properties.style &&
                vNode.children[0].properties.style.height)) {
            modifiedAttributes.tableRowHeight = fixupRowHeight((vNode.properties.style && vNode.properties.style.height) ||
                (vNode.children[0] &&
                    isVNode(vNode.children[0]) &&
                    vNode.children[0].properties.style &&
                    vNode.children[0].properties.style.height
                    ? vNode.children[0].properties.style.height
                    : undefined));
        }
        if (vNode.properties.style) {
            fixupTableCellBorder(vNode, modifiedAttributes);
        }
    }
    var tableRowPropertiesFragment = buildTableRowProperties(modifiedAttributes);
    tableRowFragment.import(tableRowPropertiesFragment);
    var columnIndex = { index: 0 };
    if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
        var tableColumns = vNode.children.filter(function (childVNode) {
            return ['td', 'th'].includes(childVNode.tagName);
        });
        var columnWidth = docxDocumentInstance.availableDocumentSpace / tableColumns.length;
        for (var index = 0; index < vNode.children.length; index++) {
            var childVNode = vNode.children[index];
            if (['td', 'th'].includes(childVNode.tagName)) {
                var rowSpanCellFragments = buildRowSpanCell(rowSpanMap, columnIndex, modifiedAttributes);
                if (Array.isArray(rowSpanCellFragments)) {
                    for (var iteratorIndex = 0; iteratorIndex < rowSpanCellFragments.length; iteratorIndex++) {
                        var rowSpanCellFragment = rowSpanCellFragments[iteratorIndex];
                        tableRowFragment.import(rowSpanCellFragment);
                    }
                }
                var tableCellFragment = buildTableCell(childVNode, __assign(__assign({}, modifiedAttributes), { maximumWidth: columnWidth }), rowSpanMap, columnIndex, docxDocumentInstance);
                columnIndex.index++;
                tableRowFragment.import(tableCellFragment);
            }
        }
    }
    if (columnIndex.index < rowSpanMap.size) {
        var rowSpanCellFragments = buildRowSpanCell(rowSpanMap, columnIndex, modifiedAttributes);
        if (Array.isArray(rowSpanCellFragments)) {
            for (var iteratorIndex = 0; iteratorIndex < rowSpanCellFragments.length; iteratorIndex++) {
                var rowSpanCellFragment = rowSpanCellFragments[iteratorIndex];
                tableRowFragment.import(rowSpanCellFragment);
            }
        }
    }
    tableRowFragment.up();
    return tableRowFragment;
};
var buildTableGridCol = function (gridWidth) {
    var tableGridColFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'gridCol')
        .att('@w', 'w', String(gridWidth));
    return tableGridColFragment;
};
var buildTableGrid = function (vNode, attributes) {
    var tableGridFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'tblGrid');
    if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
        var gridColumns = vNode.children.filter(function (childVNode) { return childVNode.tagName === 'col'; });
        var gridWidth = attributes.maximumWidth / gridColumns.length;
        for (var index = 0; index < gridColumns.length; index++) {
            var tableGridColFragment = buildTableGridCol(gridWidth);
            tableGridFragment.import(tableGridColFragment);
        }
    }
    tableGridFragment.up();
    return tableGridFragment;
};
var buildTableGridFromTableRow = function (vNode, attributes) {
    var tableGridFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'tblGrid');
    if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
        var numberOfGridColumns = vNode.children.reduce(function (accumulator, childVNode) {
            var colSpan = childVNode.properties.colSpan ||
                (childVNode.properties.style && childVNode.properties.style['column-span']);
            return accumulator + (colSpan ? parseInt(colSpan) : 1);
        }, 0);
        var gridWidth = attributes.maximumWidth / numberOfGridColumns;
        for (var index = 0; index < numberOfGridColumns; index++) {
            var tableGridColFragment = buildTableGridCol(gridWidth);
            tableGridFragment.import(tableGridColFragment);
        }
    }
    tableGridFragment.up();
    return tableGridFragment;
};
var buildTableBorders = function (tableBorder) {
    var tableBordersFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'tblBorders');
    var color = tableBorder.color, stroke = tableBorder.stroke, borders = __rest(tableBorder, ["color", "stroke"]);
    Object.keys(borders).forEach(function (border) {
        if (borders[border]) {
            var borderFragment = buildBorder(border, borders[border], 0, color, stroke);
            tableBordersFragment.import(borderFragment);
        }
    });
    tableBordersFragment.up();
    return tableBordersFragment;
};
var buildTableWidth = function (tableWidth) {
    var tableWidthFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', 'tblW')
        .att('@w', 'type', 'dxa')
        .att('@w', 'w', String(tableWidth))
        .up();
    return tableWidthFragment;
};
var buildCellMargin = function (side, margin) {
    var marginFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    })
        .ele('@w', side)
        .att('@w', 'type', 'dxa')
        .att('@w', 'w', String(margin))
        .up();
    return marginFragment;
};
var buildTableCellMargins = function (margin) {
    var tableCellMarFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'tblCellMar');
    ['top', 'bottom'].forEach(function (side) {
        var marginFragment = buildCellMargin(side, margin / 2);
        tableCellMarFragment.import(marginFragment);
    });
    ['left', 'right'].forEach(function (side) {
        var marginFragment = buildCellMargin(side, margin);
        tableCellMarFragment.import(marginFragment);
    });
    return tableCellMarFragment;
};
var buildTableProperties = function (attributes) {
    var tablePropertiesFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'tblPr');
    if (attributes && attributes.constructor === Object) {
        Object.keys(attributes).forEach(function (key) {
            switch (key) {
                case 'tableBorder':
                    var tableBordersFragment = buildTableBorders(attributes[key]);
                    tablePropertiesFragment.import(tableBordersFragment);
                    delete attributes.tableBorder;
                    break;
                case 'tableCellSpacing':
                    var tableCellSpacingFragment = buildTableCellSpacing(attributes[key]);
                    tablePropertiesFragment.import(tableCellSpacingFragment);
                    delete attributes.tableCellSpacing;
                    break;
                case 'width':
                    if (attributes[key]) {
                        var tableWidthFragment = buildTableWidth(attributes[key]);
                        tablePropertiesFragment.import(tableWidthFragment);
                    }
                    delete attributes.width;
                    break;
            }
        });
    }
    var tableCellMarginFragment = buildTableCellMargins(160);
    tablePropertiesFragment.import(tableCellMarginFragment);
    var alignmentFragment = buildHorizontalAlignment('center');
    tablePropertiesFragment.import(alignmentFragment);
    tablePropertiesFragment.up();
    return tablePropertiesFragment;
};
var cssBorderParser = function (borderString) {
    var _a = borderString.split(' '), size = _a[0], stroke = _a[1], color = _a[2];
    if (unit_conversion_1.pointRegex.test(size)) {
        var matchedParts = size.match(unit_conversion_1.pointRegex);
        size = unit_conversion_1.pointToEIP(matchedParts[1]);
    }
    else if (unit_conversion_1.pixelRegex.test(size)) {
        var matchedParts = size.match(unit_conversion_1.pixelRegex);
        size = unit_conversion_1.pixelToEIP(matchedParts[1]);
    }
    stroke = stroke && ['dashed', 'dotted', 'double'].includes(stroke) ? stroke : 'single';
    color = color && fixupColorCode(color).toUpperCase();
    return [size, stroke, color];
};
var buildTable = function (vNode, attributes, docxDocumentInstance) {
    var tableFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'tbl');
    var modifiedAttributes = __assign({}, attributes);
    if (isVNode(vNode) && vNode.properties) {
        var tableAttributes = vNode.properties.attributes || {};
        var tableStyles = vNode.properties.style || {};
        var tableBorders = { top: undefined, left: undefined, right: undefined, stroke: undefined, color: undefined, bottom: undefined, borderSize: undefined, borderStrike: undefined, borderColor: undefined, insideV: undefined, insideH: undefined };
        var tableCellBorders = { top: undefined, left: undefined, right: undefined, bottom: undefined };
        var _a = [2, 'single', '000000'], borderSize = _a[0], borderStrike = _a[1], borderColor = _a[2];
        if (!isNaN(tableAttributes.border)) {
            borderSize = parseInt(tableAttributes.border, 10);
        }
        if (tableStyles.border) {
            var _b = cssBorderParser(tableStyles.border), cssSize = _b[0], cssStroke = _b[1], cssColor = _b[2];
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
        }
        else {
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
        var minimumWidth = void 0;
        var maximumWidth = void 0;
        var width = void 0;
        if (unit_conversion_1.pixelRegex.test(tableStyles['min-width'])) {
            minimumWidth = unit_conversion_1.pixelToTWIP(tableStyles['min-width'].match(unit_conversion_1.pixelRegex)[1]);
        }
        else if (unit_conversion_1.percentageRegex.test(tableStyles['min-width'])) {
            var percentageValue = tableStyles['min-width'].match(unit_conversion_1.percentageRegex)[1];
            minimumWidth = Math.round((percentageValue / 100) * attributes.maximumWidth);
        }
        if (unit_conversion_1.pixelRegex.test(tableStyles['max-width'])) {
            unit_conversion_1.pixelRegex.lastIndex = 0;
            maximumWidth = unit_conversion_1.pixelToTWIP(tableStyles['max-width'].match(unit_conversion_1.pixelRegex)[1]);
        }
        else if (unit_conversion_1.percentageRegex.test(tableStyles['max-width'])) {
            unit_conversion_1.percentageRegex.lastIndex = 0;
            var percentageValue = tableStyles['max-width'].match(unit_conversion_1.percentageRegex)[1];
            maximumWidth = Math.round((percentageValue / 100) * attributes.maximumWidth);
        }
        if (unit_conversion_1.pixelRegex.test(tableStyles.width)) {
            unit_conversion_1.pixelRegex.lastIndex = 0;
            width = unit_conversion_1.pixelToTWIP(tableStyles.width.match(unit_conversion_1.pixelRegex)[1]);
        }
        else if (unit_conversion_1.percentageRegex.test(tableStyles.width)) {
            unit_conversion_1.percentageRegex.lastIndex = 0;
            var percentageValue = tableStyles.width.match(unit_conversion_1.percentageRegex)[1];
            width = Math.round((percentageValue / 100) * attributes.maximumWidth);
        }
        if (width) {
            modifiedAttributes.width = width;
            if (maximumWidth) {
                modifiedAttributes.width = Math.min(modifiedAttributes.width, maximumWidth);
            }
            if (minimumWidth) {
                modifiedAttributes.width = Math.max(modifiedAttributes.width, minimumWidth);
            }
        }
        else if (minimumWidth) {
            modifiedAttributes.width = minimumWidth;
        }
        if (modifiedAttributes.width) {
            modifiedAttributes.width = Math.min(modifiedAttributes.width, attributes.maximumWidth);
        }
    }
    var tablePropertiesFragment = buildTableProperties(modifiedAttributes);
    tableFragment.import(tablePropertiesFragment);
    var rowSpanMap = new Map();
    if (vNode.children && Array.isArray(vNode.children) && vNode.children.length) {
        for (var index = 0; index < vNode.children.length; index++) {
            var childVNode = vNode.children[index];
            if (childVNode.tagName === 'colgroup') {
                var tableGridFragment = buildTableGrid(childVNode, modifiedAttributes);
                tableFragment.import(tableGridFragment);
            }
            else if (childVNode.tagName === 'thead') {
                for (var iteratorIndex = 0; iteratorIndex < childVNode.children.length; iteratorIndex++) {
                    var grandChildVNode = childVNode.children[iteratorIndex];
                    if (grandChildVNode.tagName === 'tr') {
                        if (iteratorIndex === 0) {
                            var tableGridFragment = buildTableGridFromTableRow(grandChildVNode, modifiedAttributes);
                            tableFragment.import(tableGridFragment);
                        }
                        var tableRowFragment = buildTableRow(grandChildVNode, modifiedAttributes, rowSpanMap, docxDocumentInstance);
                        tableFragment.import(tableRowFragment);
                    }
                }
            }
            else if (childVNode.tagName === 'tbody') {
                for (var iteratorIndex = 0; iteratorIndex < childVNode.children.length; iteratorIndex++) {
                    var grandChildVNode = childVNode.children[iteratorIndex];
                    if (grandChildVNode.tagName === 'tr') {
                        if (iteratorIndex === 0) {
                            var tableGridFragment = buildTableGridFromTableRow(grandChildVNode, modifiedAttributes);
                            tableFragment.import(tableGridFragment);
                        }
                        var tableRowFragment = buildTableRow(grandChildVNode, modifiedAttributes, rowSpanMap, docxDocumentInstance);
                        tableFragment.import(tableRowFragment);
                    }
                }
            }
            else if (childVNode.tagName === 'tr') {
                if (index === 0) {
                    var tableGridFragment = buildTableGridFromTableRow(childVNode, modifiedAttributes);
                    tableFragment.import(tableGridFragment);
                }
                var tableRowFragment = buildTableRow(childVNode, modifiedAttributes, rowSpanMap, docxDocumentInstance);
                tableFragment.import(tableRowFragment);
            }
        }
    }
    tableFragment.up();
    return tableFragment;
};
exports.buildTable = buildTable;
var buildPresetGeometry = function () {
    var presetGeometryFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { a: namespaces_1.default.a },
    })
        .ele('@a', 'prstGeom')
        .att('prst', 'rect')
        .up();
    return presetGeometryFragment;
};
var buildExtents = function (_a) {
    var width = _a.width, height = _a.height;
    var extentsFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { a: namespaces_1.default.a },
    })
        .ele('@a', 'ext')
        .att('cx', width)
        .att('cy', height)
        .up();
    return extentsFragment;
};
var buildOffset = function () {
    var offsetFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { a: namespaces_1.default.a },
    })
        .ele('@a', 'off')
        .att('x', '0')
        .att('y', '0')
        .up();
    return offsetFragment;
};
var buildGraphicFrameTransform = function (attributes) {
    var graphicFrameTransformFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { a: namespaces_1.default.a },
    }).ele('@a', 'xfrm');
    var offsetFragment = buildOffset();
    graphicFrameTransformFragment.import(offsetFragment);
    var extentsFragment = buildExtents(attributes);
    graphicFrameTransformFragment.import(extentsFragment);
    graphicFrameTransformFragment.up();
    return graphicFrameTransformFragment;
};
var buildShapeProperties = function (attributes) {
    var shapeProperties = xmlbuilder2_1.fragment({
        namespaceAlias: { pic: namespaces_1.default.pic },
    }).ele('@pic', 'spPr');
    var graphicFrameTransformFragment = buildGraphicFrameTransform(attributes);
    shapeProperties.import(graphicFrameTransformFragment);
    var presetGeometryFragment = buildPresetGeometry();
    shapeProperties.import(presetGeometryFragment);
    shapeProperties.up();
    return shapeProperties;
};
var buildFillRect = function () {
    var fillRectFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { a: namespaces_1.default.a },
    })
        .ele('@a', 'fillRect')
        .up();
    return fillRectFragment;
};
var buildStretch = function () {
    var stretchFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { a: namespaces_1.default.a },
    }).ele('@a', 'stretch');
    var fillRectFragment = buildFillRect();
    stretchFragment.import(fillRectFragment);
    stretchFragment.up();
    return stretchFragment;
};
var buildSrcRectFragment = function () {
    var srcRectFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { a: namespaces_1.default.a },
    })
        .ele('@a', 'srcRect')
        .att('b', '0')
        .att('l', '0')
        .att('r', '0')
        .att('t', '0')
        .up();
    return srcRectFragment;
};
var buildBinaryLargeImageOrPicture = function (relationshipId) {
    var binaryLargeImageOrPictureFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { a: namespaces_1.default.a, r: namespaces_1.default.r },
    })
        .ele('@a', 'blip')
        .att('@r', 'embed', "rId" + relationshipId)
        .att('cstate', 'print');
    binaryLargeImageOrPictureFragment.up();
    return binaryLargeImageOrPictureFragment;
};
var buildBinaryLargeImageOrPictureFill = function (relationshipId) {
    var binaryLargeImageOrPictureFillFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { pic: namespaces_1.default.pic },
    }).ele('@pic', 'blipFill');
    var binaryLargeImageOrPictureFragment = buildBinaryLargeImageOrPicture(relationshipId);
    binaryLargeImageOrPictureFillFragment.import(binaryLargeImageOrPictureFragment);
    var srcRectFragment = buildSrcRectFragment();
    binaryLargeImageOrPictureFillFragment.import(srcRectFragment);
    var stretchFragment = buildStretch();
    binaryLargeImageOrPictureFillFragment.import(stretchFragment);
    binaryLargeImageOrPictureFillFragment.up();
    return binaryLargeImageOrPictureFillFragment;
};
var buildNonVisualPictureDrawingProperties = function () {
    var nonVisualPictureDrawingPropertiesFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { pic: namespaces_1.default.pic },
    }).ele('@pic', 'cNvPicPr');
    nonVisualPictureDrawingPropertiesFragment.up();
    return nonVisualPictureDrawingPropertiesFragment;
};
var buildNonVisualDrawingProperties = function (pictureId, pictureNameWithExtension, pictureDescription) {
    if (pictureDescription === void 0) { pictureDescription = ''; }
    var nonVisualDrawingPropertiesFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { pic: namespaces_1.default.pic },
    })
        .ele('@pic', 'cNvPr')
        .att('id', pictureId)
        .att('name', pictureNameWithExtension)
        .att('descr', pictureDescription);
    nonVisualDrawingPropertiesFragment.up();
    return nonVisualDrawingPropertiesFragment;
};
var buildNonVisualPictureProperties = function (pictureId, pictureNameWithExtension, pictureDescription) {
    var nonVisualPicturePropertiesFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { pic: namespaces_1.default.pic },
    }).ele('@pic', 'nvPicPr');
    var nonVisualDrawingPropertiesFragment = buildNonVisualDrawingProperties(pictureId, pictureNameWithExtension, pictureDescription);
    nonVisualPicturePropertiesFragment.import(nonVisualDrawingPropertiesFragment);
    var nonVisualPictureDrawingPropertiesFragment = buildNonVisualPictureDrawingProperties();
    nonVisualPicturePropertiesFragment.import(nonVisualPictureDrawingPropertiesFragment);
    nonVisualPicturePropertiesFragment.up();
    return nonVisualPicturePropertiesFragment;
};
var buildPicture = function (_a) {
    var id = _a.id, fileNameWithExtension = _a.fileNameWithExtension, description = _a.description, relationshipId = _a.relationshipId, width = _a.width, height = _a.height;
    var pictureFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { pic: namespaces_1.default.pic },
    }).ele('@pic', 'pic');
    var nonVisualPicturePropertiesFragment = buildNonVisualPictureProperties(id, fileNameWithExtension, description);
    pictureFragment.import(nonVisualPicturePropertiesFragment);
    var binaryLargeImageOrPictureFill = buildBinaryLargeImageOrPictureFill(relationshipId);
    pictureFragment.import(binaryLargeImageOrPictureFill);
    var shapeProperties = buildShapeProperties({ width: width, height: height });
    pictureFragment.import(shapeProperties);
    pictureFragment.up();
    return pictureFragment;
};
var buildGraphicData = function (graphicType, attributes) {
    var graphicDataFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { a: namespaces_1.default.a },
    })
        .ele('@a', 'graphicData')
        .att('uri', 'http://schemas.openxmlformats.org/drawingml/2006/picture');
    if (graphicType === 'picture') {
        var pictureFragment = buildPicture(attributes);
        graphicDataFragment.import(pictureFragment);
    }
    graphicDataFragment.up();
    return graphicDataFragment;
};
var buildGraphic = function (graphicType, attributes) {
    var graphicFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { a: namespaces_1.default.a },
    }).ele('@a', 'graphic');
    var graphicDataFragment = buildGraphicData(graphicType, attributes);
    graphicFragment.import(graphicDataFragment);
    graphicFragment.up();
    return graphicFragment;
};
var buildDrawingObjectNonVisualProperties = function (pictureId, pictureName) {
    var drawingObjectNonVisualPropertiesFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { wp: namespaces_1.default.wp },
    })
        .ele('@wp', 'docPr')
        .att('id', pictureId)
        .att('name', pictureName)
        .up();
    return drawingObjectNonVisualPropertiesFragment;
};
var buildWrapSquare = function () {
    var wrapSquareFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { wp: namespaces_1.default.wp },
    })
        .ele('@wp', 'wrapSquare')
        .att('wrapText', 'bothSides')
        .att('distB', '228600')
        .att('distT', '228600')
        .att('distL', '228600')
        .att('distR', '228600')
        .up();
    return wrapSquareFragment;
};
var buildWrapNone = function () {
    var wrapNoneFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { wp: namespaces_1.default.wp },
    })
        .ele('@wp', 'wrapNone')
        .up();
    return wrapNoneFragment;
};
var buildEffectExtentFragment = function () {
    var effectExtentFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { wp: namespaces_1.default.wp },
    })
        .ele('@wp', 'effectExtent')
        .att('b', '0')
        .att('l', '0')
        .att('r', '0')
        .att('t', '0')
        .up();
    return effectExtentFragment;
};
var buildExtent = function (_a) {
    var width = _a.width, height = _a.height;
    var extentFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { wp: namespaces_1.default.wp },
    })
        .ele('@wp', 'extent')
        .att('cx', width)
        .att('cy', height)
        .up();
    return extentFragment;
};
var buildPositionV = function () {
    var positionVFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { wp: namespaces_1.default.wp },
    })
        .ele('@wp', 'positionV')
        .att('relativeFrom', 'paragraph')
        .ele('@wp', 'posOffset')
        .txt('19050')
        .up()
        .up();
    return positionVFragment;
};
var buildPositionH = function () {
    var positionHFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { wp: namespaces_1.default.wp },
    })
        .ele('@wp', 'positionH')
        .att('relativeFrom', 'column')
        .ele('@wp', 'posOffset')
        .txt('19050')
        .up()
        .up();
    return positionHFragment;
};
var buildSimplePos = function () {
    var simplePosFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { wp: namespaces_1.default.wp },
    })
        .ele('@wp', 'simplePos')
        .att('x', '0')
        .att('y', '0')
        .up();
    return simplePosFragment;
};
var buildAnchoredDrawing = function (graphicType, attributes) {
    var anchoredDrawingFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { wp: namespaces_1.default.wp },
    })
        .ele('@wp', 'anchor')
        .att('distB', '0')
        .att('distL', '0')
        .att('distR', '0')
        .att('distT', '0')
        .att('relativeHeight', '0')
        .att('behindDoc', 'false')
        .att('locked', 'true')
        .att('layoutInCell', 'true')
        .att('allowOverlap', 'false')
        .att('simplePos', 'false');
    var simplePosFragment = buildSimplePos();
    anchoredDrawingFragment.import(simplePosFragment);
    var positionHFragment = buildPositionH();
    anchoredDrawingFragment.import(positionHFragment);
    var positionVFragment = buildPositionV();
    anchoredDrawingFragment.import(positionVFragment);
    var extentFragment = buildExtent({ width: attributes.width, height: attributes.height });
    anchoredDrawingFragment.import(extentFragment);
    var effectExtentFragment = buildEffectExtentFragment();
    anchoredDrawingFragment.import(effectExtentFragment);
    var wrapSquareFragment = buildWrapSquare();
    anchoredDrawingFragment.import(wrapSquareFragment);
    var drawingObjectNonVisualPropertiesFragment = buildDrawingObjectNonVisualProperties(attributes.id, attributes.fileNameWithExtension);
    anchoredDrawingFragment.import(drawingObjectNonVisualPropertiesFragment);
    var graphicFragment = buildGraphic(graphicType, attributes);
    anchoredDrawingFragment.import(graphicFragment);
    anchoredDrawingFragment.up();
    return anchoredDrawingFragment;
};
var buildInlineDrawing = function (graphicType, attributes) {
    var inlineDrawingFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { wp: namespaces_1.default.wp },
    })
        .ele('@wp', 'inline')
        .att('distB', '0')
        .att('distL', '0')
        .att('distR', '0')
        .att('distT', '0');
    var extentFragment = buildExtent({ width: attributes.width, height: attributes.height });
    inlineDrawingFragment.import(extentFragment);
    var effectExtentFragment = buildEffectExtentFragment();
    inlineDrawingFragment.import(effectExtentFragment);
    var drawingObjectNonVisualPropertiesFragment = buildDrawingObjectNonVisualProperties(attributes.id, attributes.fileNameWithExtension);
    inlineDrawingFragment.import(drawingObjectNonVisualPropertiesFragment);
    var graphicFragment = buildGraphic(graphicType, attributes);
    inlineDrawingFragment.import(graphicFragment);
    inlineDrawingFragment.up();
    return inlineDrawingFragment;
};
var buildDrawing = function (inlineOrAnchored, graphicType, attributes) {
    if (inlineOrAnchored === void 0) { inlineOrAnchored = false; }
    var drawingFragment = xmlbuilder2_1.fragment({
        namespaceAlias: { w: namespaces_1.default.w },
    }).ele('@w', 'drawing');
    var inlineOrAnchoredDrawingFragment = inlineOrAnchored
        ? buildInlineDrawing(graphicType, attributes)
        : buildAnchoredDrawing(graphicType, attributes);
    drawingFragment.import(inlineOrAnchoredDrawingFragment);
    drawingFragment.up();
    return drawingFragment;
};
exports.buildDrawing = buildDrawing;
//# sourceMappingURL=xml-builder.js.map