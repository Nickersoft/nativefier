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
exports.removeUserAgentSpecifics = exports.openExternal = exports.nativeTabsSupported = exports.linkIsInternal = exports.isWindows = exports.isLinux = exports.isOSX = exports.getCSSToInject = exports.getCounterValue = exports.getAppIcon = exports.debugLog = exports.INJECT_DIR = void 0;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
const log = __importStar(require("loglevel"));
exports.INJECT_DIR = path.join(__dirname, '..', 'inject');
/**
 * Helper to print debug messages from the main process in the browser window
 */
function debugLog(browserWindow, message) {
    // Need a delay, as it takes time for the preloaded js to be loaded by the window
    setTimeout(() => {
        browserWindow.webContents.send('debug', message);
    }, 3000);
    log.debug(message);
}
exports.debugLog = debugLog;
/**
 * Helper to determine domain-ish equality for many cases, the trivial ones
 * and the trickier ones, e.g. `blog.foo.com` and `shop.foo.com`,
 * in a way that is "good enough", and doesn't need a list of SLDs.
 * See chat at https://github.com/nativefier/nativefier/pull/1171#pullrequestreview-649132523
 */
function domainify(url) {
    // So here's what we're doing here:
    // Get the hostname from the url
    const hostname = new URL(url).hostname;
    // Drop the first section if the domain
    const domain = hostname.split('.').slice(1).join('.');
    // Check the length, if it's too short, the hostname was probably the domain
    // Or if the domain doesn't have a . in it we went too far
    if (domain.length < 6 || domain.split('.').length === 0) {
        return hostname;
    }
    // This SHOULD be the domain, but nothing is 100% guaranteed
    return domain;
}
function getAppIcon() {
    // Prefer ICO under Windows, see
    // https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions
    // https://www.electronjs.org/docs/api/native-image#supported-formats
    if (isWindows()) {
        const ico = path.join(__dirname, '..', 'icon.ico');
        if (fs.existsSync(ico)) {
            return ico;
        }
    }
    const png = path.join(__dirname, '..', 'icon.png');
    if (fs.existsSync(png)) {
        return png;
    }
}
exports.getAppIcon = getAppIcon;
function getCounterValue(title) {
    const itemCountRegex = /[([{]([\d.,]*)\+?[}\])]/;
    const match = itemCountRegex.exec(title);
    return match ? match[1] : undefined;
}
exports.getCounterValue = getCounterValue;
function getCSSToInject() {
    let cssToInject = '';
    const cssFiles = fs
        .readdirSync(exports.INJECT_DIR, { withFileTypes: true })
        .filter((injectFile) => injectFile.isFile() && injectFile.name.endsWith('.css'))
        .map((cssFileStat) => path.resolve(path.join(exports.INJECT_DIR, cssFileStat.name)));
    for (const cssFile of cssFiles) {
        log.debug('Injecting CSS file', cssFile);
        const cssFileData = fs.readFileSync(cssFile);
        cssToInject += `/* ${cssFile} */\n\n ${cssFileData.toString()}\n\n`;
    }
    return cssToInject;
}
exports.getCSSToInject = getCSSToInject;
function isOSX() {
    return os.platform() === 'darwin';
}
exports.isOSX = isOSX;
function isLinux() {
    return os.platform() === 'linux';
}
exports.isLinux = isLinux;
function isWindows() {
    return os.platform() === 'win32';
}
exports.isWindows = isWindows;
function isInternalLoginPage(url) {
    // Making changes? Remember to update the tests in helpers.test.ts and in API.md
    const internalLoginPagesArray = [
        'amazon\\.[a-zA-Z\\.]*/[a-zA-Z\\/]*signin',
        `facebook\\.[a-zA-Z\\.]*\\/login`,
        'github\\.[a-zA-Z\\.]*\\/(?:login|session)',
        'accounts\\.google\\.[a-zA-Z\\.]*',
        'mail\\.google\\.[a-zA-Z\\.]*\\/accounts/SetOSID',
        'linkedin\\.[a-zA-Z\\.]*/uas/login',
        'login\\.live\\.[a-zA-Z\\.]*',
        'login\\.microsoftonline\\.[a-zA-Z\\.]*',
        'okta\\.[a-zA-Z\\.]*',
        'twitter\\.[a-zA-Z\\.]*/oauth/authenticate',
        'appleid\\.apple\\.com/auth/authorize',
        '(?:id|auth)\\.atlassian\\.[a-zA-Z]+', // Atlassian
    ];
    // Making changes? Remember to update the tests in helpers.test.ts and in API.md
    const regex = RegExp(internalLoginPagesArray.join('|'));
    return regex.test(url);
}
function linkIsInternal(currentUrl, newUrl, internalUrlRegex) {
    log.debug('linkIsInternal', { currentUrl, newUrl, internalUrlRegex });
    if (newUrl.split('#')[0] === 'about:blank') {
        return true;
    }
    if (isInternalLoginPage(newUrl)) {
        return true;
    }
    if (internalUrlRegex) {
        const regex = RegExp(internalUrlRegex);
        if (regex.test(newUrl)) {
            return true;
        }
    }
    try {
        // Consider as "same domain-ish", without TLD/SLD list:
        // 1. app.foo.com and foo.com
        // 2. www.foo.com and foo.com
        // 3. www.foo.com and app.foo.com
        // Only use the tld and the main domain for domain-ish test
        // Enables domain-ish equality for blog.foo.com and shop.foo.com
        return domainify(currentUrl) === domainify(newUrl);
    }
    catch (err) {
        log.error('Failed to parse domains as determining if link is internal. From:', currentUrl, 'To:', newUrl, err);
        return false;
    }
}
exports.linkIsInternal = linkIsInternal;
function nativeTabsSupported() {
    return isOSX();
}
exports.nativeTabsSupported = nativeTabsSupported;
function openExternal(url, options) {
    log.debug('openExternal', { url, options });
    return electron_1.shell.openExternal(url, options);
}
exports.openExternal = openExternal;
function removeUserAgentSpecifics(userAgentFallback, appName, appVersion) {
    // Electron userAgentFallback is the user agent used if none is specified when creating a window.
    // For our purposes, it's useful because its format is similar enough to a real Chrome's user agent to not need
    // to infer the userAgent. userAgentFallback normally looks like this:
    // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) app-nativefier-804458/1.0.0 Chrome/89.0.4389.128 Electron/12.0.7 Safari/537.36
    // We just need to strip out the appName/1.0.0 and Electron/electronVersion
    return userAgentFallback
        .replace(`Electron/${process.versions.electron} `, '')
        .replace(`${appName}/${appVersion} `, ' ');
}
exports.removeUserAgentSpecifics = removeUserAgentSpecifics;
//# sourceMappingURL=helpers.js.map