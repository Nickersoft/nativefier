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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestFirefoxVersion = void 0;
const axios_1 = __importDefault(require("axios"));
const log = __importStar(require("loglevel"));
const constants_1 = require("../../constants");
const FIREFOX_VERSIONS_URL = 'https://product-details.mozilla.org/1.0/firefox_versions.json';
async function getLatestFirefoxVersion(url = FIREFOX_VERSIONS_URL) {
    try {
        log.debug('Grabbing Firefox version data from', url);
        const response = await axios_1.default.get(url, { timeout: 5000 });
        if (response.status !== 200) {
            throw new Error(`Bad request: Status code ${response.status}`);
        }
        const firefoxVersions = response.data;
        log.debug(`Got latest Firefox version ${firefoxVersions.LATEST_FIREFOX_VERSION}`);
        return firefoxVersions.LATEST_FIREFOX_VERSION;
    }
    catch (err) {
        log.error('getLatestFirefoxVersion ERROR', err);
        log.debug('Falling back to default Firefox version', constants_1.DEFAULT_FIREFOX_VERSION);
        return constants_1.DEFAULT_FIREFOX_VERSION;
    }
}
exports.getLatestFirefoxVersion = getLatestFirefoxVersion;
//# sourceMappingURL=inferFirefoxVersion.js.map