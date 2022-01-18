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
exports.useOldAppOptions = exports.findUpgradeApp = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const log = __importStar(require("loglevel"));
const fsHelpers_1 = require("../fsHelpers");
const plistInfoXMLHelpers_1 = require("./plistInfoXMLHelpers");
const executableHelpers_1 = require("./executableHelpers");
const parseUtils_1 = require("../../utils/parseUtils");
function findUpgradeAppResourcesDir(searchDir) {
    searchDir = (0, fsHelpers_1.dirExists)(searchDir) ? searchDir : path.dirname(searchDir);
    log.debug(`Searching for nativfier.json in ${searchDir}`);
    const children = fs.readdirSync(searchDir, { withFileTypes: true });
    if ((0, fsHelpers_1.fileExists)(path.join(searchDir, 'nativefier.json'))) {
        // Found 'nativefier.json', so this must be it!
        return path.resolve(searchDir);
    }
    const childDirectories = children.filter((c) => c.isDirectory());
    for (const childDir of childDirectories) {
        // We must go deeper!
        const result = findUpgradeAppResourcesDir(path.join(searchDir, childDir.name, 'nativefier.json'));
        if (result !== null) {
            return path.resolve(result);
        }
    }
    // Didn't find it down here
    return null;
}
function getAppRoot(appResourcesDir, options) {
    var _a;
    switch (options.platform) {
        case 'darwin':
            return path.resolve(path.join(appResourcesDir, '..', '..', '..', '..'));
        case 'linux':
        case 'win32':
            return path.resolve(path.join(appResourcesDir, '..', '..'));
        default:
            throw new Error(`Could not find the app root for platform: ${(_a = options.platform) !== null && _a !== void 0 ? _a : 'undefined'}`);
    }
}
function getIconPath(appResourcesDir) {
    const icnsPath = path.join(appResourcesDir, '..', 'electron.icns');
    if ((0, fsHelpers_1.fileExists)(icnsPath)) {
        log.debug(`Found icon at: ${icnsPath}`);
        return path.resolve(icnsPath);
    }
    const icoPath = path.join(appResourcesDir, 'icon.ico');
    if ((0, fsHelpers_1.fileExists)(icoPath)) {
        log.debug(`Found icon at: ${icoPath}`);
        return path.resolve(icoPath);
    }
    const pngPath = path.join(appResourcesDir, 'icon.png');
    if ((0, fsHelpers_1.fileExists)(pngPath)) {
        log.debug(`Found icon at: ${pngPath}`);
        return path.resolve(pngPath);
    }
    log.debug('Could not find icon file.');
    return undefined;
}
function getInfoPListOptions(appResourcesDir, priorOptions) {
    if (!(0, fsHelpers_1.fileExists)(path.join(appResourcesDir, '..', '..', 'Info.plist'))) {
        // Not a darwin/mas app, so this is irrelevant
        return priorOptions;
    }
    const newOptions = { ...priorOptions };
    const infoPlistXML = fs
        .readFileSync(path.join(appResourcesDir, '..', '..', 'Info.plist'))
        .toString();
    if (newOptions.appCopyright === undefined) {
        // https://github.com/electron/electron-packager/blob/0d3f84374e9ab3741b171610735ebc6be3e5e75f/src/mac.js#L230-L232
        newOptions.appCopyright = (0, plistInfoXMLHelpers_1.extractString)(infoPlistXML, 'NSHumanReadableCopyright');
        log.debug(`Extracted app copyright from Info.plist: ${newOptions.appCopyright}`);
    }
    if (newOptions.appVersion === undefined) {
        // https://github.com/electron/electron-packager/blob/0d3f84374e9ab3741b171610735ebc6be3e5e75f/src/mac.js#L214-L216
        // This could also be the buildVersion, but since they end up in the same place, that SHOULDN'T matter
        const bundleVersion = (0, plistInfoXMLHelpers_1.extractString)(infoPlistXML, 'CFBundleVersion');
        newOptions.appVersion =
            bundleVersion === undefined || bundleVersion === '1.0.0' // If it's 1.0.0, that's just the default
                ? undefined
                : bundleVersion;
        (newOptions.darwinDarkModeSupport =
            newOptions.darwinDarkModeSupport === undefined
                ? undefined
                : newOptions.darwinDarkModeSupport === false),
            log.debug(`Extracted app version from Info.plist: ${newOptions.appVersion}`);
    }
    if (newOptions.darwinDarkModeSupport === undefined) {
        // https://github.com/electron/electron-packager/blob/0d3f84374e9ab3741b171610735ebc6be3e5e75f/src/mac.js#L234-L236
        newOptions.darwinDarkModeSupport = (0, plistInfoXMLHelpers_1.extractBoolean)(infoPlistXML, 'NSRequiresAquaSystemAppearance');
        log.debug(`Extracted Darwin dark mode support from Info.plist: ${newOptions.darwinDarkModeSupport ? 'Yes' : 'No'}`);
    }
    return newOptions;
}
function getInjectPaths(appResourcesDir) {
    const injectDir = path.join(appResourcesDir, 'inject');
    if (!(0, fsHelpers_1.dirExists)(injectDir)) {
        return undefined;
    }
    const injectPaths = fs
        .readdirSync(injectDir, { withFileTypes: true })
        .filter((fd) => fd.isFile() &&
        (fd.name.toLowerCase().endsWith('.css') ||
            fd.name.toLowerCase().endsWith('.js')))
        .map((fd) => path.resolve(path.join(injectDir, fd.name)));
    log.debug(`CSS/JS Inject paths: ${injectPaths.join(', ')}`);
    return injectPaths;
}
function isAsar(appResourcesDir) {
    const asar = (0, fsHelpers_1.fileExists)(path.join(appResourcesDir, '..', 'electron.asar'));
    log.debug(`Is this app an ASAR? ${asar ? 'Yes' : 'No'}`);
    return asar;
}
function findUpgradeApp(upgradeFrom) {
    const searchDir = (0, fsHelpers_1.dirExists)(upgradeFrom)
        ? upgradeFrom
        : path.dirname(upgradeFrom);
    log.debug(`Looking for old options file in ${searchDir}`);
    const appResourcesDir = findUpgradeAppResourcesDir(searchDir);
    if (appResourcesDir === null) {
        log.debug(`No nativefier.json file found in ${searchDir}`);
        return null;
    }
    const nativefierJSONPath = path.join(appResourcesDir, 'nativefier.json');
    log.debug(`Loading ${nativefierJSONPath}`);
    let options = (0, parseUtils_1.parseJson)(fs.readFileSync(nativefierJSONPath, 'utf8'));
    if (!options) {
        throw new Error(`Could not read Nativefier options from ${nativefierJSONPath}`);
    }
    options.electronVersion = undefined;
    options = {
        ...options,
        ...(0, executableHelpers_1.getOptionsFromExecutable)(appResourcesDir, options),
    };
    const appRoot = getAppRoot(appResourcesDir, options);
    return {
        appResourcesDir,
        appRoot,
        options: {
            ...options,
            ...getInfoPListOptions(appResourcesDir, options),
            asar: options.asar !== undefined ? options.asar : isAsar(appResourcesDir),
            icon: getIconPath(appResourcesDir),
            inject: getInjectPaths(appResourcesDir),
        },
    };
}
exports.findUpgradeApp = findUpgradeApp;
function useOldAppOptions(rawOptions, oldApp) {
    if (rawOptions.targetUrl !== undefined && (0, fsHelpers_1.dirExists)(rawOptions.targetUrl)) {
        // You got your ouput dir in my targetUrl!
        rawOptions.out = rawOptions.targetUrl;
    }
    log.debug('oldApp', oldApp);
    const combinedOptions = { ...rawOptions, ...oldApp.options };
    log.debug('Combined options', combinedOptions);
    return combinedOptions;
}
exports.useOldAppOptions = useOldAppOptions;
//# sourceMappingURL=upgrade.js.map