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
exports.getLatestSafariVersion = void 0;
const axios_1 = __importDefault(require("axios"));
const log = __importStar(require("loglevel"));
const constants_1 = require("../../constants");
const SAFARI_VERSIONS_HISTORY_URL = 'https://en.wikipedia.org/wiki/Safari_version_history';
async function getLatestSafariVersion(url = SAFARI_VERSIONS_HISTORY_URL) {
    try {
        log.debug('Grabbing apple version data from', url);
        const response = await axios_1.default.get(url, { timeout: 5000 });
        if (response.status !== 200) {
            throw new Error(`Bad request: Status code ${response.status}`);
        }
        // This would be easier with an HTML parser, but we're not going to include an extra dependency for something that dumb
        const rawData = response.data;
        const majorVersions = [
            ...rawData.matchAll(/class="mw-headline" id="Safari_[0-9]*">Safari ([0-9]*)</g),
        ].map((match) => match[1]);
        const majorVersion = parseInt(majorVersions[majorVersions.length - 1]);
        const majorVersionTable = rawData
            .split('>Release history<')[2]
            .split('<table')
            .filter((table) => table.includes(`Safari ${majorVersion}.x`))[0];
        const versionRows = majorVersionTable.split('<tbody')[1].split('<tr');
        let version = undefined;
        let webkitVersion = undefined;
        for (const versionRow of versionRows.reverse()) {
            const versionMatch = [
                ...versionRow.matchAll(/>\s*(([0-9]*\.){2}[0-9])\s*</g),
            ];
            if (versionMatch.length > 0 && !version) {
                version = versionMatch[0][1];
            }
            const webkitVersionMatch = [
                ...versionRow.matchAll(/>\s*(([0-9]*\.){3,4}[0-9])\s*</g),
            ];
            if (webkitVersionMatch.length > 0 && !webkitVersion) {
                webkitVersion = webkitVersionMatch[0][1];
            }
            if (version && webkitVersion) {
                break;
            }
        }
        if (version && webkitVersion) {
            return {
                majorVersion,
                version,
                webkitVersion,
            };
        }
        return constants_1.DEFAULT_SAFARI_VERSION;
    }
    catch (err) {
        log.error('getLatestSafariVersion ERROR', err);
        log.debug('Falling back to default Safari version', constants_1.DEFAULT_SAFARI_VERSION);
        return constants_1.DEFAULT_SAFARI_VERSION;
    }
}
exports.getLatestSafariVersion = getLatestSafariVersion;
//# sourceMappingURL=inferSafariVersion.js.map