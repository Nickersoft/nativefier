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
exports.saveAppArgs = exports.createMainWindow = exports.APP_ARGS_FILE_PATH = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
const electron_window_state_1 = __importDefault(require("electron-window-state"));
const loglevel_1 = __importDefault(require("loglevel"));
const helpers_1 = require("../helpers/helpers");
const windowEvents_1 = require("../helpers/windowEvents");
const windowHelpers_1 = require("../helpers/windowHelpers");
const contextMenu_1 = require("./contextMenu");
const menu_1 = require("./menu");
const model_1 = require("../../../shared/src/options/model");
exports.APP_ARGS_FILE_PATH = path.join(__dirname, '..', 'nativefier.json');
/**
 * @param {{}} nativefierOptions AppArgs from nativefier.json
 * @param {function} setDockBadge
 */
async function createMainWindow(nativefierOptions, setDockBadge) {
    var _a;
    const options = { ...nativefierOptions };
    const mainWindowState = (0, electron_window_state_1.default)({
        defaultWidth: options.width || 1280,
        defaultHeight: options.height || 800,
    });
    const mainWindow = new electron_1.BrowserWindow({
        frame: !options.hideWindowFrame,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: options.minWidth,
        minHeight: options.minHeight,
        maxWidth: options.maxWidth,
        maxHeight: options.maxHeight,
        x: options.x,
        y: options.y,
        autoHideMenuBar: !options.showMenuBar,
        icon: (0, helpers_1.getAppIcon)(),
        fullscreen: options.fullScreen,
        // Whether the window should always stay on top of other windows. Default is false.
        alwaysOnTop: options.alwaysOnTop,
        titleBarStyle: (_a = options.titleBarStyle) !== null && _a !== void 0 ? _a : 'default',
        show: options.tray !== 'start-in-tray',
        backgroundColor: options.backgroundColor,
        ...(0, windowHelpers_1.getDefaultWindowOptions)((0, model_1.outputOptionsToWindowOptions)(options)),
    });
    mainWindowState.manage(mainWindow);
    // after first run, no longer force maximize to be true
    if (options.maximize) {
        mainWindow.maximize();
        options.maximize = undefined;
        saveAppArgs(options);
    }
    if (options.tray === 'start-in-tray') {
        mainWindow.hide();
    }
    const windowOptions = (0, model_1.outputOptionsToWindowOptions)(options);
    (0, menu_1.createMenu)(options, mainWindow);
    createContextMenu(options, mainWindow);
    (0, windowEvents_1.setupNativefierWindow)(windowOptions, mainWindow);
    // .on('new-window', ...) is deprected in favor of setWindowOpenHandler(...)
    // We can't quite cut over to that yet for a few reasons:
    // 1. Our version of Electron does not yet support a parameter to
    //    setWindowOpenHandler that contains `disposition', which we need.
    //    See https://github.com/electron/electron/issues/28380
    // 2. setWindowOpenHandler doesn't support newGuest as well
    // Though at this point, 'new-window' bugs seem to be coming up and downstream
    // users are being pointed to use setWindowOpenHandler.
    // E.g., https://github.com/electron/electron/issues/28374
    // Note it is important to add these handlers only to the *main* window,
    // else we run into weird behavior like opening tabs twice
    mainWindow.webContents.on('new-window', (event, url, frameName, disposition) => {
        (0, windowEvents_1.onNewWindow)(windowOptions, windowEvents_1.setupNativefierWindow, event, url, frameName, disposition).catch((err) => loglevel_1.default.error('onNewWindow ERROR', err));
    });
    // @ts-expect-error new-tab isn't in the type definition, but it does exist
    mainWindow.on('new-tab', () => {
        (0, windowHelpers_1.createNewTab)(windowOptions, windowEvents_1.setupNativefierWindow, options.targetUrl, true, mainWindow);
    });
    if (options.counter) {
        setupCounter(options, mainWindow, setDockBadge);
    }
    else {
        setupNotificationBadge(options, mainWindow, setDockBadge);
    }
    electron_1.ipcMain.on('notification-click', () => {
        loglevel_1.default.debug('ipcMain.notification-click');
        mainWindow.show();
    });
    setupSessionInteraction(options, mainWindow);
    if (options.clearCache) {
        await (0, windowHelpers_1.clearCache)(mainWindow);
    }
    if (options.targetUrl) {
        await mainWindow.loadURL(options.targetUrl);
    }
    setupCloseEvent(options, mainWindow);
    return mainWindow;
}
exports.createMainWindow = createMainWindow;
function createContextMenu(options, window) {
    if (!options.disableContextMenu) {
        (0, contextMenu_1.initContextMenu)(options, window);
    }
}
function saveAppArgs(newAppArgs) {
    try {
        fs.writeFileSync(exports.APP_ARGS_FILE_PATH, JSON.stringify(newAppArgs, null, 2));
    }
    catch (err) {
        loglevel_1.default.warn(`WARNING: Ignored nativefier.json rewrital (${err.message})`);
    }
}
exports.saveAppArgs = saveAppArgs;
function setupCloseEvent(options, window) {
    window.on('close', (event) => {
        var _a, _b;
        loglevel_1.default.debug('mainWindow.close', event);
        if (window.isFullScreen()) {
            if ((0, helpers_1.nativeTabsSupported)()) {
                window.moveTabToNewWindow();
            }
            window.setFullScreen(false);
            window.once('leave-full-screen', (event) => {
                var _a, _b;
                return (0, windowHelpers_1.hideWindow)(window, event, (_a = options.fastQuit) !== null && _a !== void 0 ? _a : false, (_b = options.tray) !== null && _b !== void 0 ? _b : 'false');
            });
        }
        (0, windowHelpers_1.hideWindow)(window, event, (_a = options.fastQuit) !== null && _a !== void 0 ? _a : false, (_b = options.tray) !== null && _b !== void 0 ? _b : 'false');
        if (options.clearCache) {
            (0, windowHelpers_1.clearCache)(window).catch((err) => loglevel_1.default.error('clearCache ERROR', err));
        }
    });
}
function setupCounter(options, window, setDockBadge) {
    window.on('page-title-updated', (event, title) => {
        loglevel_1.default.debug('mainWindow.page-title-updated', { event, title });
        const counterValue = (0, helpers_1.getCounterValue)(title);
        if (counterValue) {
            setDockBadge(counterValue, options.bounce);
        }
        else {
            setDockBadge('');
        }
    });
}
function setupNotificationBadge(options, window, setDockBadge) {
    electron_1.ipcMain.on('notification', () => {
        loglevel_1.default.debug('ipcMain.notification');
        if (!(0, helpers_1.isOSX)() || window.isFocused()) {
            return;
        }
        setDockBadge('•', options.bounce);
    });
    window.on('focus', () => {
        loglevel_1.default.debug('mainWindow.focus');
        setDockBadge('');
    });
}
function setupSessionInteraction(options, window) {
    // See API.md / "Accessing The Electron Session"
    electron_1.ipcMain.on('session-interaction', (event, request) => {
        loglevel_1.default.debug('ipcMain.session-interaction', { event, request });
        const result = { id: request.id };
        let awaitingPromise = false;
        try {
            if (request.func !== undefined) {
                // If no funcArgs provided, we'll just use an empty array
                if (request.funcArgs === undefined || request.funcArgs === null) {
                    request.funcArgs = [];
                }
                // If funcArgs isn't an array, we'll be nice and make it a single item array
                if (typeof request.funcArgs[Symbol.iterator] !== 'function') {
                    request.funcArgs = [request.funcArgs];
                }
                // Call func with funcArgs
                // @ts-expect-error accessing a func by string name
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                result.value = window.webContents.session[request.func](...request.funcArgs);
                if (result.value !== undefined && result.value instanceof Promise) {
                    // This is a promise. We'll resolve it here otherwise it will blow up trying to serialize it in the reply
                    result.value
                        .then((trueResultValue) => {
                        result.value = trueResultValue;
                        loglevel_1.default.debug('ipcMain.session-interaction:result', result);
                        event.reply('session-interaction-reply', result);
                    })
                        .catch((err) => loglevel_1.default.error('session-interaction ERROR', request, err));
                    awaitingPromise = true;
                }
            }
            else if (request.property !== undefined) {
                if (request.propertyValue !== undefined) {
                    // Set the property
                    // @ts-expect-error setting a property by string name
                    window.webContents.session[request.property] =
                        request.propertyValue;
                }
                // Get the property value
                // @ts-expect-error accessing a property by string name
                result.value = window.webContents.session[request.property];
            }
            else {
                // Why even send the event if you're going to do this? You're just wasting time! ;)
                throw new Error('Received neither a func nor a property in the request. Unable to process.');
            }
            // If we are awaiting a promise, that will return the reply instead, else
            if (!awaitingPromise) {
                loglevel_1.default.debug('session-interaction:result', result);
                event.reply('session-interaction-reply', result);
            }
        }
        catch (err) {
            loglevel_1.default.error('session-interaction:error', err, event, request);
            result.error = err;
            result.value = undefined; // Clear out the value in case serializing the value is what got us into this mess in the first place
            event.reply('session-interaction-reply', result);
        }
    });
}
//# sourceMappingURL=mainWindow.js.map