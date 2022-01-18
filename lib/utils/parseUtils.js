"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJson = exports.parseBooleanOrString = exports.parseBoolean = void 0;
const log = __importStar(require("loglevel"));
const helpers_1 = require("../helpers/helpers");
function parseBoolean(val, _default) {
    if (val === undefined) {
        return _default;
    }
    try {
        if (typeof val === 'boolean') {
            return val;
        }
        val = String(val);
        switch (val.toLocaleLowerCase()) {
            case 'true':
            case '1':
            case 'yes':
                return true;
            case 'false':
            case '0':
            case 'no':
                return false;
            default:
                return _default;
        }
    }
    catch {
        return _default;
    }
}
exports.parseBoolean = parseBoolean;
function parseBooleanOrString(val) {
    switch (val) {
        case 'true':
            return true;
        case 'false':
            return false;
        default:
            return val;
    }
}
exports.parseBooleanOrString = parseBooleanOrString;
function parseJson(val) {
    if (!val)
        return undefined;
    try {
        return JSON.parse(val);
    }
    catch (err) {
        const windowsShellHint = (0, helpers_1.isWindows)()
            ? `\n   In particular, Windows cmd doesn't have single quotes, so you have to use only double-quotes plus escaping: "{\\"someKey\\": \\"someValue\\"}"`
            : '';
        log.error(`Unable to parse JSON value: ${val}\n` +
            `JSON should look like {"someString": "someValue", "someBoolean": true, "someArray": [1,2,3]}.\n` +
            ` - Only double quotes are allowed, single quotes are not.\n` +
            ` - Learn how your shell behaves and escapes characters.${windowsShellHint}\n` +
            ` - If unsure, validate your JSON using an online service.`);
        throw err;
    }
}
exports.parseJson = parseJson;
//# sourceMappingURL=parseUtils.js.map