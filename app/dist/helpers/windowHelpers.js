"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zoomIn = exports.zoomReset = exports.zoomOut = exports.withFocusedWindow = exports.setProxyRules = exports.sendParamsOnDidFinishLoad = exports.injectCSS = exports.hideWindow = exports.goToURL = exports.goForward = exports.goBack = exports.getDefaultWindowOptions = exports.getCurrentURL = exports.createNewWindow = exports.createNewTab = exports.createAboutBlankWindow = exports.clearCache = exports.clearAppData = exports.blockExternalURL = exports.adjustWindowZoom = void 0;
const electron_1 = require("electron");
const loglevel_1 = __importDefault(require("loglevel"));
const path_1 = __importDefault(require("path"));
const helpers_1 = require("./helpers");
const ZOOM_INTERVAL = 0.1;
function adjustWindowZoom(adjustment) {
    withFocusedWindow((focusedWindow) => {
        focusedWindow.webContents.zoomFactor =
            focusedWindow.webContents.zoomFactor + adjustment;
    });
}
exports.adjustWindowZoom = adjustWindowZoom;
function blockExternalURL(url) {
    return new Promise((resolve, reject) => {
        withFocusedWindow((focusedWindow) => {
            electron_1.dialog
                .showMessageBox(focusedWindow, {
                message: `Cannot navigate to external URL: ${url}`,
                type: 'error',
                title: 'Navigation blocked',
            })
                .then((result) => resolve(result))
                .catch((err) => {
                reject(err);
            });
        });
    });
}
exports.blockExternalURL = blockExternalURL;
async function clearAppData(window) {
    const response = await electron_1.dialog.showMessageBox(window, {
        type: 'warning',
        buttons: ['Yes', 'Cancel'],
        defaultId: 1,
        title: 'Clear cache confirmation',
        message: 'This will clear all data (cookies, local storage etc) from this app. Are you sure you wish to proceed?',
    });
    if (response.response !== 0) {
        return;
    }
    await clearCache(window);
}
exports.clearAppData = clearAppData;
async function clearCache(window) {
    const { session } = window.webContents;
    await session.clearStorageData();
    await session.clearCache();
}
exports.clearCache = clearCache;
function createAboutBlankWindow(options, setupWindow, parent) {
    const window = createNewWindow({ ...options, show: false }, setupWindow, 'about:blank', parent);
    window.webContents.once('did-stop-loading', () => {
        if (window.webContents.getURL() === 'about:blank') {
            window.close();
        }
        else {
            window.show();
        }
    });
    return window;
}
exports.createAboutBlankWindow = createAboutBlankWindow;
function createNewTab(options, setupWindow, url, foreground, parent) {
    loglevel_1.default.debug('createNewTab', { url, foreground, parent });
    return withFocusedWindow((focusedWindow) => {
        const newTab = createNewWindow(options, setupWindow, url, parent);
        focusedWindow.addTabbedWindow(newTab);
        if (!foreground) {
            focusedWindow.focus();
        }
        return newTab;
    });
}
exports.createNewTab = createNewTab;
function createNewWindow(options, setupWindow, url, parent) {
    loglevel_1.default.debug('createNewWindow', { url, parent });
    const window = new electron_1.BrowserWindow({
        parent,
        ...getDefaultWindowOptions(options),
    });
    setupWindow(options, window);
    window.loadURL(url).catch((err) => loglevel_1.default.error('window.loadURL ERROR', err));
    return window;
}
exports.createNewWindow = createNewWindow;
function getCurrentURL() {
    return withFocusedWindow((focusedWindow) => focusedWindow.webContents.getURL());
}
exports.getCurrentURL = getCurrentURL;
function getDefaultWindowOptions(options) {
    var _a, _b;
    const browserwindowOptions = {
        ...options.browserwindowOptions,
    };
    // We're going to remove this and merge it separately into DEFAULT_WINDOW_OPTIONS.webPreferences
    // Otherwise the browserwindowOptions.webPreferences object will completely replace the
    // webPreferences specified in the DEFAULT_WINDOW_OPTIONS with itself
    delete browserwindowOptions.webPreferences;
    const webPreferences = {
        ...((_b = (_a = options.browserwindowOptions) === null || _a === void 0 ? void 0 : _a.webPreferences) !== null && _b !== void 0 ? _b : {}),
    };
    const defaultOptions = {
        fullscreenable: true,
        tabbingIdentifier: (0, helpers_1.nativeTabsSupported)() ? options.name : undefined,
        title: options.name,
        webPreferences: {
            javascript: true,
            nodeIntegration: false,
            preload: path_1.default.join(__dirname, 'preload.js'),
            plugins: true,
            webSecurity: !options.insecure,
            zoomFactor: options.zoom,
            // `contextIsolation` was switched to true in Electron 12, which:
            // 1. Breaks access to global variables in `--inject`-ed scripts:
            //    https://github.com/nativefier/nativefier/issues/1269
            // 2. Might break notifications under Windows, although this was refuted:
            //    https://github.com/nativefier/nativefier/issues/1292
            // So, it was flipped to false in https://github.com/nativefier/nativefier/pull/1308
            //
            // If attempting to set it back to `true` (for security),
            // do test exhaustively these two areas, and more.
            contextIsolation: false,
            ...webPreferences,
        },
        ...browserwindowOptions,
    };
    loglevel_1.default.debug('getDefaultWindowOptions', {
        options,
        webPreferences,
        defaultOptions,
    });
    return defaultOptions;
}
exports.getDefaultWindowOptions = getDefaultWindowOptions;
function goBack() {
    loglevel_1.default.debug('onGoBack');
    withFocusedWindow((focusedWindow) => {
        focusedWindow.webContents.goBack();
    });
}
exports.goBack = goBack;
function goForward() {
    loglevel_1.default.debug('onGoForward');
    withFocusedWindow((focusedWindow) => {
        focusedWindow.webContents.goForward();
    });
}
exports.goForward = goForward;
function goToURL(url) {
    return withFocusedWindow((focusedWindow) => focusedWindow.loadURL(url));
}
exports.goToURL = goToURL;
function hideWindow(window, event, fastQuit, tray) {
    if ((0, helpers_1.isOSX)() && !fastQuit) {
        // this is called when exiting from clicking the cross button on the window
        event.preventDefault();
        window.hide();
    }
    else if (!fastQuit && tray !== 'false') {
        event.preventDefault();
        window.hide();
    }
    // will close the window on other platforms
}
exports.hideWindow = hideWindow;
function injectCSS(browserWindow) {
    const cssToInject = (0, helpers_1.getCSSToInject)();
    if (!cssToInject) {
        return;
    }
    browserWindow.webContents.on('did-navigate', () => {
        loglevel_1.default.debug('browserWindow.webContents.did-navigate', browserWindow.webContents.getURL());
        browserWindow.webContents
            .insertCSS(cssToInject)
            .catch((err) => loglevel_1.default.error('browserWindow.webContents.insertCSS', err));
        // We must inject css early enough; so onResponseStarted is a good place.
        browserWindow.webContents.session.webRequest.onResponseStarted({ urls: [] }, // Pass an empty filter list; null will not match _any_ urls
        (details) => {
            loglevel_1.default.debug('onResponseStarted', {
                resourceType: details.resourceType,
                url: details.url,
            });
            injectCSSIntoResponse(details, cssToInject).catch((err) => {
                loglevel_1.default.error('injectCSSIntoResponse ERROR', err);
            });
        });
    });
}
exports.injectCSS = injectCSS;
function injectCSSIntoResponse(details, cssToInject) {
    var _a;
    const contentType = details.responseHeaders && 'content-type' in details.responseHeaders
        ? details.responseHeaders['content-type'][0]
        : undefined;
    loglevel_1.default.debug('injectCSSIntoResponse', { details, cssToInject, contentType });
    // We go with a denylist rather than a whitelist (e.g. only text/html)
    // to avoid "whoops I didn't think this should have been CSS-injected" cases
    const nonInjectableContentTypes = [
        /application\/.*/,
        /font\/.*/,
        /image\/.*/,
    ];
    const nonInjectableResourceTypes = ['image', 'script', 'stylesheet', 'xhr'];
    if ((contentType &&
        ((_a = nonInjectableContentTypes.filter((x) => {
            const matches = x.exec(contentType);
            return matches && (matches === null || matches === void 0 ? void 0 : matches.length) > 0;
        })) === null || _a === void 0 ? void 0 : _a.length) > 0) ||
        nonInjectableResourceTypes.includes(details.resourceType) ||
        !details.webContents) {
        loglevel_1.default.debug(`Skipping CSS injection for:\n${details.url}\nwith resourceType ${details.resourceType} and content-type ${contentType}`);
        return Promise.resolve(undefined);
    }
    loglevel_1.default.debug(`Injecting CSS for:\n${details.url}\nwith resourceType ${details.resourceType} and content-type ${contentType}`);
    return details.webContents.insertCSS(cssToInject);
}
function sendParamsOnDidFinishLoad(options, window) {
    window.webContents.on('did-finish-load', () => {
        loglevel_1.default.debug('sendParamsOnDidFinishLoad.window.webContents.did-finish-load', window.webContents.getURL());
        // In children windows too: Restore pinch-to-zoom, disabled by default in recent Electron.
        // See https://github.com/nativefier/nativefier/issues/379#issuecomment-598612128
        // and https://github.com/electron/electron/pull/12679
        window.webContents
            .setVisualZoomLevelLimits(1, 3)
            .catch((err) => loglevel_1.default.error('webContents.setVisualZoomLevelLimits', err));
        window.webContents.send('params', JSON.stringify(options));
    });
}
exports.sendParamsOnDidFinishLoad = sendParamsOnDidFinishLoad;
function setProxyRules(window, proxyRules) {
    window.webContents.session
        .setProxy({
        proxyRules,
        pacScript: '',
        proxyBypassRules: '',
    })
        .catch((err) => loglevel_1.default.error('session.setProxy ERROR', err));
}
exports.setProxyRules = setProxyRules;
function withFocusedWindow(block) {
    const focusedWindow = electron_1.BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
        return block(focusedWindow);
    }
    return undefined;
}
exports.withFocusedWindow = withFocusedWindow;
function zoomOut() {
    loglevel_1.default.debug('zoomOut');
    adjustWindowZoom(-ZOOM_INTERVAL);
}
exports.zoomOut = zoomOut;
function zoomReset(options) {
    loglevel_1.default.debug('zoomReset');
    withFocusedWindow((focusedWindow) => {
        var _a;
        focusedWindow.webContents.zoomFactor = (_a = options.zoom) !== null && _a !== void 0 ? _a : 1.0;
    });
}
exports.zoomReset = zoomReset;
function zoomIn() {
    loglevel_1.default.debug('zoomIn');
    adjustWindowZoom(ZOOM_INTERVAL);
}
exports.zoomIn = zoomIn;
//# sourceMappingURL=windowHelpers.js.map