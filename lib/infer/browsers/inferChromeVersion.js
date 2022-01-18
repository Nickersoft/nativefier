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
exports.getChromeVersionForElectronVersion = void 0;
const axios_1 = __importDefault(require("axios"));
const log = __importStar(require("loglevel"));
const constants_1 = require("../../constants");
const ELECTRON_VERSIONS_URL = 'https://atom.io/download/atom-shell/index.json';
async function getChromeVersionForElectronVersion(electronVersion, url = ELECTRON_VERSIONS_URL) {
    if (!electronVersion || electronVersion === constants_1.DEFAULT_ELECTRON_VERSION) {
        // Exit quickly for the scenario that we already know about
        return constants_1.DEFAULT_CHROME_VERSION;
    }
    try {
        log.debug('Grabbing electron<->chrome versions file from', url);
        const response = await axios_1.default.get(url, { timeout: 5000 });
        if (response.status !== 200) {
            throw new Error(`Bad request: Status code ${response.status}`);
        }
        const electronReleases = response.data;
        const electronVersionToChromeVersion = {};
        for (const release of electronReleases) {
            electronVersionToChromeVersion[release.version] = release.chrome;
        }
        if (!(electronVersion in electronVersionToChromeVersion)) {
            throw new Error(`Electron version '${electronVersion}' not found in retrieved version list!`);
        }
        const chromeVersion = electronVersionToChromeVersion[electronVersion];
        log.debug(`Associated electron v${electronVersion} to chrome v${chromeVersion}`);
        return chromeVersion;
    }
    catch (err) {
        log.error('getChromeVersionForElectronVersion ERROR', err);
        log.debug('Falling back to default Chrome version', constants_1.DEFAULT_CHROME_VERSION);
        return constants_1.DEFAULT_CHROME_VERSION;
    }
}
exports.getChromeVersionForElectronVersion = getChromeVersionForElectronVersion;
//# sourceMappingURL=inferChromeVersion.js.map