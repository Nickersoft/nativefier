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
exports.normalizePlatform = exports.getOptions = void 0;
const fs = __importStar(require("fs"));
const axios_1 = __importDefault(require("axios"));
const debug = __importStar(require("debug"));
const log = __importStar(require("loglevel"));
// package.json is `require`d to let tsc strip the `src` folder by determining
// baseUrl=src. A static import would prevent that and cause an ugly extra `src` folder in `lib`
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const packageJson = require('../../package.json');
const constants_1 = require("../constants");
const inferOs_1 = require("../infer/inferOs");
const asyncConfig_1 = require("./asyncConfig");
const normalizeUrl_1 = require("./normalizeUrl");
const parseUtils_1 = require("../utils/parseUtils");
const SEMVER_VERSION_NUMBER_REGEX = /\d+\.\d+\.\d+[-_\w\d.]*/;
/**
 * Process and validate raw user arguments
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function getOptions(rawOptions) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13;
    const options = {
        packager: {
            appCopyright: rawOptions.appCopyright,
            appVersion: rawOptions.appVersion,
            arch: (_a = rawOptions.arch) !== null && _a !== void 0 ? _a : (0, inferOs_1.inferArch)(),
            asar: (_c = (_b = rawOptions.asar) !== null && _b !== void 0 ? _b : rawOptions.conceal) !== null && _c !== void 0 ? _c : false,
            buildVersion: rawOptions.buildVersion,
            darwinDarkModeSupport: (_d = rawOptions.darwinDarkModeSupport) !== null && _d !== void 0 ? _d : false,
            dir: constants_1.PLACEHOLDER_APP_DIR,
            electronVersion: (_e = rawOptions.electronVersion) !== null && _e !== void 0 ? _e : constants_1.DEFAULT_ELECTRON_VERSION,
            icon: rawOptions.icon,
            name: typeof rawOptions.name === 'string' ? rawOptions.name : '',
            out: (_f = rawOptions.out) !== null && _f !== void 0 ? _f : process.cwd(),
            overwrite: rawOptions.overwrite,
            quiet: (_g = rawOptions.quiet) !== null && _g !== void 0 ? _g : false,
            platform: rawOptions.platform,
            portable: (_h = rawOptions.portable) !== null && _h !== void 0 ? _h : false,
            targetUrl: rawOptions.targetUrl === undefined
                ? '' // We'll plug this in later via upgrade
                : (0, normalizeUrl_1.normalizeUrl)(rawOptions.targetUrl),
            tmpdir: false,
            upgrade: rawOptions.upgrade !== undefined ? true : false,
            upgradeFrom: (_j = rawOptions.upgradeFrom) !== null && _j !== void 0 ? _j : (rawOptions.upgrade || undefined),
            win32metadata: (_k = rawOptions.win32metadata) !== null && _k !== void 0 ? _k : {
                ProductName: rawOptions.name,
                InternalName: rawOptions.name,
                FileDescription: rawOptions.name,
            },
        },
        nativefier: {
            accessibilityPrompt: true,
            alwaysOnTop: (_l = rawOptions.alwaysOnTop) !== null && _l !== void 0 ? _l : false,
            backgroundColor: rawOptions.backgroundColor,
            basicAuthPassword: rawOptions.basicAuthPassword,
            basicAuthUsername: rawOptions.basicAuthUsername,
            blockExternalUrls: (_m = rawOptions.blockExternalUrls) !== null && _m !== void 0 ? _m : false,
            bookmarksMenu: rawOptions.bookmarksMenu,
            bounce: (_o = rawOptions.bounce) !== null && _o !== void 0 ? _o : false,
            browserwindowOptions: rawOptions.browserwindowOptions,
            clearCache: (_p = rawOptions.clearCache) !== null && _p !== void 0 ? _p : false,
            counter: (_q = rawOptions.counter) !== null && _q !== void 0 ? _q : false,
            crashReporter: rawOptions.crashReporter,
            disableContextMenu: (_r = rawOptions.disableContextMenu) !== null && _r !== void 0 ? _r : false,
            disableDevTools: (_s = rawOptions.disableDevTools) !== null && _s !== void 0 ? _s : false,
            disableGpu: (_t = rawOptions.disableGpu) !== null && _t !== void 0 ? _t : false,
            diskCacheSize: rawOptions.diskCacheSize,
            disableOldBuildWarning: (_u = rawOptions.disableOldBuildWarningYesiknowitisinsecure) !== null && _u !== void 0 ? _u : false,
            enableEs3Apis: (_v = rawOptions.enableEs3Apis) !== null && _v !== void 0 ? _v : false,
            fastQuit: (_w = rawOptions.fastQuit) !== null && _w !== void 0 ? _w : false,
            fileDownloadOptions: rawOptions.fileDownloadOptions,
            flashPluginDir: rawOptions.flashPath,
            fullScreen: (_x = rawOptions.fullScreen) !== null && _x !== void 0 ? _x : false,
            globalShortcuts: undefined,
            hideWindowFrame: (_y = rawOptions.hideWindowFrame) !== null && _y !== void 0 ? _y : false,
            ignoreCertificate: (_z = rawOptions.ignoreCertificate) !== null && _z !== void 0 ? _z : false,
            ignoreGpuBlacklist: (_0 = rawOptions.ignoreGpuBlacklist) !== null && _0 !== void 0 ? _0 : false,
            inject: (_1 = rawOptions.inject) !== null && _1 !== void 0 ? _1 : [],
            insecure: (_2 = rawOptions.insecure) !== null && _2 !== void 0 ? _2 : false,
            internalUrls: rawOptions.internalUrls,
            lang: rawOptions.lang,
            maximize: (_3 = rawOptions.maximize) !== null && _3 !== void 0 ? _3 : false,
            nativefierVersion: packageJson.version,
            quiet: (_4 = rawOptions.quiet) !== null && _4 !== void 0 ? _4 : false,
            processEnvs: rawOptions.processEnvs,
            proxyRules: rawOptions.proxyRules,
            showMenuBar: (_5 = rawOptions.showMenuBar) !== null && _5 !== void 0 ? _5 : false,
            singleInstance: (_6 = rawOptions.singleInstance) !== null && _6 !== void 0 ? _6 : false,
            titleBarStyle: rawOptions.titleBarStyle,
            tray: (_7 = rawOptions.tray) !== null && _7 !== void 0 ? _7 : 'false',
            userAgent: rawOptions.userAgent,
            userAgentHonest: (_8 = rawOptions.userAgentHonest) !== null && _8 !== void 0 ? _8 : false,
            verbose: (_9 = rawOptions.verbose) !== null && _9 !== void 0 ? _9 : false,
            versionString: rawOptions.versionString,
            width: (_10 = rawOptions.width) !== null && _10 !== void 0 ? _10 : 1280,
            height: (_11 = rawOptions.height) !== null && _11 !== void 0 ? _11 : 800,
            minWidth: rawOptions.minWidth,
            minHeight: rawOptions.minHeight,
            maxWidth: rawOptions.maxWidth,
            maxHeight: rawOptions.maxHeight,
            widevine: (_12 = rawOptions.widevine) !== null && _12 !== void 0 ? _12 : false,
            x: rawOptions.x,
            y: rawOptions.y,
            zoom: (_13 = rawOptions.zoom) !== null && _13 !== void 0 ? _13 : 1.0,
        },
    };
    if (options.nativefier.verbose) {
        log.setLevel('trace');
        try {
            debug.enable('electron-packager');
        }
        catch (err) {
            log.error('Failed to enable electron-packager debug output. This should not happen,', 'and suggests their internals changed. Please report an issue.', err);
        }
        log.debug('Running in verbose mode! This will produce a mountain of logs and', 'is recommended only for troubleshooting or if you like Shakespeare.');
    }
    else {
        log.setLevel(options.nativefier.quiet ? 'silent' : 'info');
    }
    let requestedElectronBefore16 = false;
    if (options.packager.electronVersion) {
        const requestedVersion = options.packager.electronVersion;
        if (!SEMVER_VERSION_NUMBER_REGEX.exec(requestedVersion)) {
            throw `Invalid Electron version number "${requestedVersion}". Aborting.`;
        }
        const requestedMajorVersion = parseInt(requestedVersion.split('.')[0], 10);
        if (requestedMajorVersion < constants_1.ELECTRON_MAJOR_VERSION) {
            log.warn(`\nATTENTION: Using **old** Electron version ${requestedVersion} as requested.`, "\nIt's untested, bugs and horror will happen, you're on your own.", `\nSimply abort & re-run without passing the version flag to default to ${constants_1.DEFAULT_ELECTRON_VERSION}`);
        }
        if (requestedMajorVersion < 16) {
            requestedElectronBefore16 = true;
        }
    }
    if (options.nativefier.widevine) {
        const widevineSuffix = requestedElectronBefore16 ? '-wvvmp' : '+wvcus';
        log.debug(`Using widevine release suffix "${widevineSuffix}"`);
        const widevineElectronVersion = `${options.packager.electronVersion}${widevineSuffix}`;
        try {
            await axios_1.default.get(`https://github.com/castlabs/electron-releases/releases/tag/v${widevineElectronVersion}`);
        }
        catch {
            throw new Error(`\nERROR: castLabs Electron version "${widevineElectronVersion}" does not exist. \nVerify versions at https://github.com/castlabs/electron-releases/releases. \nAborting.`);
        }
        options.packager.electronVersion = widevineElectronVersion;
        process.env.ELECTRON_MIRROR =
            'https://github.com/castlabs/electron-releases/releases/download/';
        log.warn(`\nATTENTION: Using the **unofficial** Electron from castLabs`, "\nIt implements Google's Widevine Content Decryption Module (CDM) for DRM-enabled playback.", `\nSimply abort & re-run without passing the widevine flag to default to ${options.packager.electronVersion !== undefined
            ? options.packager.electronVersion
            : constants_1.DEFAULT_ELECTRON_VERSION}`);
    }
    if (options.nativefier.flashPluginDir) {
        options.nativefier.insecure = true;
    }
    if (options.nativefier.userAgentHonest && options.nativefier.userAgent) {
        options.nativefier.userAgent = undefined;
        log.warn(`\nATTENTION: user-agent AND user-agent-honest/honest were provided. In this case, honesty wins. user-agent will be ignored`);
    }
    options.packager.platform = normalizePlatform(options.packager.platform);
    if (options.nativefier.maxWidth &&
        options.nativefier.width &&
        options.nativefier.width > options.nativefier.maxWidth) {
        options.nativefier.width = options.nativefier.maxWidth;
    }
    if (options.nativefier.maxHeight &&
        options.nativefier.height &&
        options.nativefier.height > options.nativefier.maxHeight) {
        options.nativefier.height = options.nativefier.maxHeight;
    }
    if (options.packager.portable) {
        log.info('Building app as portable.', 'SECURITY WARNING: all data accumulated in the app folder after running it', '(including login information, cache, cookies) will be saved', 'in the app folder. If this app is then shared with others,', 'THEY WILL HAVE THAT ACCUMULATED DATA, POTENTIALLY INCLUDING ACCESS', 'TO ANY ACCOUNTS YOU LOGGED INTO.');
    }
    if (rawOptions.globalShortcuts) {
        if (typeof rawOptions.globalShortcuts === 'string') {
            // This is a file we got over the command line
            log.debug('Using global shortcuts file at', rawOptions.globalShortcuts);
            const globalShortcuts = (0, parseUtils_1.parseJson)(fs.readFileSync(rawOptions.globalShortcuts).toString());
            options.nativefier.globalShortcuts = globalShortcuts;
        }
        else {
            // This is an object we got from an existing config in an upgrade
            log.debug('Using global shortcuts object', rawOptions.globalShortcuts);
            options.nativefier.globalShortcuts = rawOptions.globalShortcuts;
        }
    }
    await (0, asyncConfig_1.asyncConfig)(options);
    return options;
}
exports.getOptions = getOptions;
function normalizePlatform(platform) {
    if (!platform) {
        return (0, inferOs_1.inferPlatform)();
    }
    if (platform.toLowerCase() === 'windows') {
        return 'win32';
    }
    if (['osx', 'mac', 'macos'].includes(platform.toLowerCase())) {
        return 'darwin';
    }
    return platform.toLowerCase();
}
exports.normalizePlatform = normalizePlatform;
//# sourceMappingURL=optionsMain.js.map