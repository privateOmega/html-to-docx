"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genericRelsXML = exports.webSettingsXML = exports.settingsXML = exports.fontTableXML = exports.generateStylesXML = exports.generateNumberingXMLTemplate = exports.relsXML = exports.documentRelsXML = exports.generateCoreXML = exports.contentTypesXML = void 0;
var content_types_1 = require("./content-types");
Object.defineProperty(exports, "contentTypesXML", { enumerable: true, get: function () { return __importDefault(content_types_1).default; } });
var core_1 = require("./core");
Object.defineProperty(exports, "generateCoreXML", { enumerable: true, get: function () { return __importDefault(core_1).default; } });
var document_rels_1 = require("./document-rels");
Object.defineProperty(exports, "documentRelsXML", { enumerable: true, get: function () { return __importDefault(document_rels_1).default; } });
var rels_1 = require("./rels");
Object.defineProperty(exports, "relsXML", { enumerable: true, get: function () { return __importDefault(rels_1).default; } });
var numbering_1 = require("./numbering");
Object.defineProperty(exports, "generateNumberingXMLTemplate", { enumerable: true, get: function () { return __importDefault(numbering_1).default; } });
var styles_1 = require("./styles");
Object.defineProperty(exports, "generateStylesXML", { enumerable: true, get: function () { return __importDefault(styles_1).default; } });
var font_table_1 = require("./font-table");
Object.defineProperty(exports, "fontTableXML", { enumerable: true, get: function () { return __importDefault(font_table_1).default; } });
var settings_1 = require("./settings");
Object.defineProperty(exports, "settingsXML", { enumerable: true, get: function () { return __importDefault(settings_1).default; } });
var web_settings_1 = require("./web-settings");
Object.defineProperty(exports, "webSettingsXML", { enumerable: true, get: function () { return __importDefault(web_settings_1).default; } });
var generic_rels_1 = require("./generic-rels");
Object.defineProperty(exports, "genericRelsXML", { enumerable: true, get: function () { return __importDefault(generic_rels_1).default; } });
//# sourceMappingURL=index.js.map