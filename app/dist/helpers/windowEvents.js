"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupNativefierWindow = exports.onWillPreventUnload = exports.onWillNavigate = exports.onNewWindowHelper = exports.onNewWindow = void 0;
const electron_1 = require("electron");
const loglevel_1 = __importDefault(require("loglevel"));
const helpers_1 = require("./helpers");
const windowHelpers_1 = require("./windowHelpers");
function onNewWindow(options, setupWindow, event, urlToGo, frameName, disposition, parent) {
    loglevel_1.default.debug('onNewWindow', {
        event,
        urlToGo,
        frameName,
        disposition,
        parent,
    });
    const preventDefault = (newGuest) => {
        loglevel_1.default.debug('onNewWindow.preventDefault', { newGuest, event });
        event.preventDefault();
        if (newGuest) {
            event.newGuest = newGuest;
        }
    };
    return onNewWindowHelper(options, setupWindow, urlToGo, disposition, preventDefault, parent);
}
exports.onNewWindow = onNewWindow;
function onNewWindowHelper(options, setupWindow, urlToGo, disposition, preventDefault, parent) {
    loglevel_1.default.debug('onNewWindowHelper', {
        options,
        urlToGo,
        disposition,
        preventDefault,
        parent,
    });
    try {
        if (!(0, helpers_1.linkIsInternal)(options.targetUrl, urlToGo, options.internalUrls)) {
            preventDefault();
            if (options.blockExternalUrls) {
                return new Promise((resolve) => {
                    (0, windowHelpers_1.blockExternalURL)(urlToGo)
                        .then(() => resolve())
                        .catch((err) => {
                        throw err;
                    });
                });
            }
            else {
                return (0, helpers_1.openExternal)(urlToGo);
            }
        }
        // Normally the following would be:
        // if (urlToGo.startsWith('about:blank'))...
        // But due to a bug we resolved in https://github.com/nativefier/nativefier/issues/1197
        // Some sites use about:blank#something to use as placeholder windows to fill
        // with content via JavaScript. So we'll stay specific for now...
        else if (['about:blank', 'about:blank#blocked'].includes(urlToGo)) {
            return Promise.resolve(preventDefault((0, windowHelpers_1.createAboutBlankWindow)(options, setupWindow, parent)));
        }
        else if ((0, helpers_1.nativeTabsSupported)()) {
            return Promise.resolve(preventDefault((0, windowHelpers_1.createNewTab)(options, setupWindow, urlToGo, disposition === 'foreground-tab', parent)));
        }
        return Promise.resolve(undefined);
    }
    catch (err) {
        return Promise.reject(err);
    }
}
exports.onNewWindowHelper = onNewWindowHelper;
function onWillNavigate(options, event, urlToGo) {
    loglevel_1.default.debug('onWillNavigate', { options, event, urlToGo });
    if (!(0, helpers_1.linkIsInternal)(options.targetUrl, urlToGo, options.internalUrls)) {
        event.preventDefault();
        if (options.blockExternalUrls) {
            return new Promise((resolve) => {
                (0, windowHelpers_1.blockExternalURL)(urlToGo)
                    .then(() => resolve())
                    .catch((err) => {
                    throw err;
                });
            });
        }
        else {
            return (0, helpers_1.openExternal)(urlToGo);
        }
    }
    return Promise.resolve(undefined);
}
exports.onWillNavigate = onWillNavigate;
function onWillPreventUnload(event) {
    var _a;
    loglevel_1.default.debug('onWillPreventUnload', event);
    const webContents = event.sender;
    if (!webContents) {
        return;
    }
    const browserWindow = (_a = electron_1.BrowserWindow.fromWebContents(webContents)) !== null && _a !== void 0 ? _a : electron_1.BrowserWindow.getFocusedWindow();
    if (browserWindow) {
        const choice = electron_1.dialog.showMessageBoxSync(browserWindow, {
            type: 'question',
            buttons: ['Proceed', 'Stay'],
            message: 'You may have unsaved changes, are you sure you want to proceed?',
            title: 'Changes you made may not be saved.',
            defaultId: 0,
            cancelId: 1,
        });
        if (choice === 0) {
            event.preventDefault();
        }
    }
}
exports.onWillPreventUnload = onWillPreventUnload;
function setupNativefierWindow(options, window) {
    if (options.proxyRules) {
        (0, windowHelpers_1.setProxyRules)(window, options.proxyRules);
    }
    (0, windowHelpers_1.injectCSS)(window);
    window.webContents.on('will-navigate', (event, url) => {
        onWillNavigate(options, event, url).catch((err) => {
            loglevel_1.default.error('window.webContents.on.will-navigate ERROR', err);
            event.preventDefault();
        });
    });
    window.webContents.on('will-prevent-unload', onWillPreventUnload);
    (0, windowHelpers_1.sendParamsOnDidFinishLoad)(options, window);
}
exports.setupNativefierWindow = setupNativefierWindow;
//# sourceMappingURL=windowEvents.js.map