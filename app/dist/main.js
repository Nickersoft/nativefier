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
require("source-map-support/register");
const fs_1 = __importDefault(require("fs"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
const electron_dl_1 = __importDefault(require("electron-dl"));
const log = __importStar(require("loglevel"));
const loginWindow_1 = require("./components/loginWindow");
const mainWindow_1 = require("./components/mainWindow");
const trayIcon_1 = require("./components/trayIcon");
const helpers_1 = require("./helpers/helpers");
const inferFlash_1 = require("./helpers/inferFlash");
const windowEvents_1 = require("./helpers/windowEvents");
const model_1 = require("../../shared/src/options/model");
// Entrypoint for Squirrel, a windows update framework. See https://github.com/nativefier/nativefier/pull/744
if (require('electron-squirrel-startup')) {
    electron_1.app.exit();
}
if (process.argv.indexOf('--verbose') > -1) {
    log.setLevel('DEBUG');
    process.traceDeprecation = true;
    process.traceProcessWarnings = true;
}
let mainWindow;
const appArgs = JSON.parse(fs_1.default.readFileSync(mainWindow_1.APP_ARGS_FILE_PATH, 'utf8'));
log.debug('appArgs', appArgs);
// Do this relatively early so that we can start storing appData with the app
if (appArgs.portable) {
    log.debug('App was built as portable; setting appData and userData to the app folder: ', path.resolve(path.join(__dirname, '..', 'appData')));
    electron_1.app.setPath('appData', path.join(__dirname, '..', 'appData'));
    electron_1.app.setPath('userData', path.join(__dirname, '..', 'appData'));
}
if (!appArgs.userAgentHonest) {
    if (appArgs.userAgent) {
        electron_1.app.userAgentFallback = appArgs.userAgent;
    }
    else {
        electron_1.app.userAgentFallback = (0, helpers_1.removeUserAgentSpecifics)(electron_1.app.userAgentFallback, electron_1.app.getName(), electron_1.app.getVersion());
    }
}
// Take in a URL on the command line as an override
if (process.argv.length > 1) {
    const maybeUrl = process.argv[1];
    try {
        new URL(maybeUrl);
        appArgs.targetUrl = maybeUrl;
        log.info('Loading override URL passed as argument:', maybeUrl);
    }
    catch (err) {
        log.error('Not loading override URL passed as argument, because failed to parse:', maybeUrl, err);
    }
}
// Nativefier is a browser, and an old browser is an insecure / badly-performant one.
// Given our builder/app design, we currently don't have an easy way to offer
// upgrades from the app themselves (like browsers do).
// As a workaround, we ask for a manual upgrade & re-build if the build is old.
// The period in days is chosen to be not too small to be exceedingly annoying,
// but not too large to be exceedingly insecure.
const OLD_BUILD_WARNING_THRESHOLD_DAYS = 90;
const OLD_BUILD_WARNING_THRESHOLD_MS = OLD_BUILD_WARNING_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
const fileDownloadOptions = { ...appArgs.fileDownloadOptions };
(0, electron_dl_1.default)(fileDownloadOptions);
if (appArgs.processEnvs) {
    // This is compatibility if just a string was passed.
    if (typeof appArgs.processEnvs === 'string') {
        process.env.processEnvs = appArgs.processEnvs;
    }
    else {
        Object.keys(appArgs.processEnvs)
            .filter((key) => key !== undefined)
            .forEach((key) => {
            // @ts-expect-error TS will complain this could be undefined, but we filtered those out
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            process.env[key] = appArgs.processEnvs[key];
        });
    }
}
if (typeof appArgs.flashPluginDir === 'string') {
    electron_1.app.commandLine.appendSwitch('ppapi-flash-path', appArgs.flashPluginDir);
}
else if (appArgs.flashPluginDir) {
    const flashPath = (0, inferFlash_1.inferFlashPath)();
    electron_1.app.commandLine.appendSwitch('ppapi-flash-path', flashPath);
}
if (appArgs.ignoreCertificate) {
    electron_1.app.commandLine.appendSwitch('ignore-certificate-errors');
}
if (appArgs.disableGpu) {
    electron_1.app.disableHardwareAcceleration();
}
if (appArgs.ignoreGpuBlacklist) {
    electron_1.app.commandLine.appendSwitch('ignore-gpu-blacklist');
}
if (appArgs.enableEs3Apis) {
    electron_1.app.commandLine.appendSwitch('enable-es3-apis');
}
if (appArgs.diskCacheSize) {
    electron_1.app.commandLine.appendSwitch('disk-cache-size', appArgs.diskCacheSize.toString());
}
if (appArgs.basicAuthUsername) {
    electron_1.app.commandLine.appendSwitch('basic-auth-username', appArgs.basicAuthUsername);
}
if (appArgs.basicAuthPassword) {
    electron_1.app.commandLine.appendSwitch('basic-auth-password', appArgs.basicAuthPassword);
}
if (appArgs.lang) {
    const langParts = appArgs.lang.split(',');
    // Convert locales to languages, because for some reason locales don't work. Stupid Chromium
    const langPartsParsed = Array.from(
    // Convert to set to dedupe in case something like "en-GB,en-US" was passed
    new Set(langParts.map((l) => l.split('-')[0])));
    const langFlag = langPartsParsed.join(',');
    log.debug('Setting --lang flag to', langFlag);
    electron_1.app.commandLine.appendSwitch('--lang', langFlag);
}
let currentBadgeCount = 0;
const setDockBadge = (0, helpers_1.isOSX)()
    ? (count, bounce = false) => {
        if (count !== undefined) {
            electron_1.app.dock.setBadge(count.toString());
            if (bounce && count > currentBadgeCount)
                electron_1.app.dock.bounce();
            currentBadgeCount = typeof count === 'number' ? count : 0;
        }
    }
    : () => undefined;
electron_1.app.on('window-all-closed', () => {
    log.debug('app.window-all-closed');
    if (!(0, helpers_1.isOSX)() || appArgs.fastQuit) {
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', () => {
    log.debug('app.before-quit');
    // not fired when the close button on the window is clicked
    if ((0, helpers_1.isOSX)()) {
        // need to force a quit as a workaround here to simulate the osx app hiding behaviour
        // Somehow sokution at https://github.com/atom/electron/issues/444#issuecomment-76492576 does not work,
        // e.prevent default appears to persist
        // might cause issues in the future as before-quit and will-quit events are not called
        electron_1.app.exit(0);
    }
});
electron_1.app.on('will-quit', (event) => {
    log.debug('app.will-quit', event);
});
electron_1.app.on('quit', (event, exitCode) => {
    log.debug('app.quit', { event, exitCode });
});
electron_1.app.on('will-finish-launching', () => {
    log.debug('app.will-finish-launching');
});
if (appArgs.widevine) {
    // @ts-expect-error This event only appears on the widevine version of electron, which we'd see at runtime
    electron_1.app.on('widevine-ready', (version, lastVersion) => {
        log.debug('app.widevine-ready', { version, lastVersion });
        onReady().catch((err) => log.error('onReady ERROR', err));
    });
    electron_1.app.on(
    // @ts-expect-error This event only appears on the widevine version of electron, which we'd see at runtime
    'widevine-update-pending', (currentVersion, pendingVersion) => {
        log.debug('app.widevine-update-pending', {
            currentVersion,
            pendingVersion,
        });
    });
    // @ts-expect-error This event only appears on the widevine version of electron, which we'd see at runtime
    electron_1.app.on('widevine-error', (error) => {
        log.error('app.widevine-error', error);
    });
}
else {
    electron_1.app.on('ready', () => {
        log.debug('ready');
        onReady().catch((err) => log.error('onReady ERROR', err));
    });
}
electron_1.app.on('activate', (event, hasVisibleWindows) => {
    log.debug('app.activate', { event, hasVisibleWindows });
    if ((0, helpers_1.isOSX)()) {
        // this is called when the dock is clicked
        if (!hasVisibleWindows) {
            mainWindow.show();
        }
    }
});
// quit if singleInstance mode and there's already another instance running
const shouldQuit = appArgs.singleInstance && !electron_1.app.requestSingleInstanceLock();
if (shouldQuit) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', () => {
        log.debug('app.second-instance');
        if (mainWindow) {
            if (!mainWindow.isVisible()) {
                // try
                mainWindow.show();
            }
            if (mainWindow.isMinimized()) {
                // minimized
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });
}
electron_1.app.on('new-window-for-tab', () => {
    log.debug('app.new-window-for-tab');
    if (mainWindow) {
        mainWindow.emit('new-tab');
    }
});
electron_1.app.on('login', (event, webContents, request, authInfo, callback) => {
    log.debug('app.login', { event, request });
    // for http authentication
    event.preventDefault();
    if (appArgs.basicAuthUsername && appArgs.basicAuthPassword) {
        callback(appArgs.basicAuthUsername, appArgs.basicAuthPassword);
    }
    else {
        (0, loginWindow_1.createLoginWindow)(callback, mainWindow).catch((err) => log.error('createLoginWindow ERROR', err));
    }
});
async function onReady() {
    // Warning: `mainWindow` below is the *global* unique `mainWindow`, created at init time
    mainWindow = await (0, mainWindow_1.createMainWindow)(appArgs, setDockBadge);
    (0, trayIcon_1.createTrayIcon)(appArgs, mainWindow);
    // Register global shortcuts
    if (appArgs.globalShortcuts) {
        appArgs.globalShortcuts.forEach((shortcut) => {
            electron_1.globalShortcut.register(shortcut.key, () => {
                shortcut.inputEvents.forEach((inputEvent) => {
                    // @ts-expect-error without including electron in our models, these will never match
                    mainWindow.webContents.sendInputEvent(inputEvent);
                });
            });
        });
        if ((0, helpers_1.isOSX)() && appArgs.accessibilityPrompt) {
            const mediaKeys = [
                'MediaPlayPause',
                'MediaNextTrack',
                'MediaPreviousTrack',
                'MediaStop',
            ];
            const globalShortcutsKeys = appArgs.globalShortcuts.map((g) => g.key);
            const mediaKeyWasSet = globalShortcutsKeys.find((g) => mediaKeys.includes(g));
            if (mediaKeyWasSet &&
                !electron_1.systemPreferences.isTrustedAccessibilityClient(false)) {
                // Since we're trying to set global keyboard shortcuts for media keys, we need to prompt
                // the user for permission on Mac.
                // For reference:
                // https://www.electronjs.org/docs/api/global-shortcut?q=MediaPlayPause#globalshortcutregisteraccelerator-callback
                const accessibilityPromptResult = electron_1.dialog.showMessageBoxSync(mainWindow, {
                    type: 'question',
                    message: 'Accessibility Permissions Needed',
                    buttons: ['Yes', 'No', 'No and never ask again'],
                    defaultId: 0,
                    detail: `${appArgs.name} would like to use one or more of your keyboard's media keys (start, stop, next track, or previous track) to control it.\n\n` +
                        `Would you like Mac OS to ask for your permission to do so?\n\n` +
                        `If so, you will need to restart ${appArgs.name} after granting permissions for these keyboard shortcuts to begin working.`,
                });
                switch (accessibilityPromptResult) {
                    // User clicked Yes, prompt for accessibility
                    case 0:
                        electron_1.systemPreferences.isTrustedAccessibilityClient(true);
                        break;
                    // User cliecked Never Ask Me Again, save that info
                    case 2:
                        appArgs.accessibilityPrompt = false;
                        (0, mainWindow_1.saveAppArgs)(appArgs);
                        break;
                    // User clicked No
                    default:
                        break;
                }
            }
        }
    }
    if (!appArgs.disableOldBuildWarning &&
        new Date().getTime() - appArgs.buildDate > OLD_BUILD_WARNING_THRESHOLD_MS) {
        const oldBuildWarningText = appArgs.oldBuildWarningText ||
            'This app was built a long time ago. Nativefier uses the Chrome browser (through Electron), and it is insecure to keep using an old version of it. Please upgrade Nativefier and rebuild this app.';
        electron_1.dialog
            .showMessageBox(mainWindow, {
            type: 'warning',
            message: 'Old build detected',
            detail: oldBuildWarningText,
        })
            .catch((err) => log.error('dialog.showMessageBox ERROR', err));
    }
}
electron_1.app.on('accessibility-support-changed', (event, accessibilitySupportEnabled) => {
    log.debug('app.accessibility-support-changed', {
        event,
        accessibilitySupportEnabled,
    });
});
electron_1.app.on('activity-was-continued', (event, type, userInfo) => {
    log.debug('app.activity-was-continued', { event, type, userInfo });
});
electron_1.app.on('browser-window-blur', (event, window) => {
    log.debug('app.browser-window-blur', { event, window });
});
electron_1.app.on('browser-window-created', (event, window) => {
    log.debug('app.browser-window-created', { event, window });
    (0, windowEvents_1.setupNativefierWindow)((0, model_1.outputOptionsToWindowOptions)(appArgs), window);
});
electron_1.app.on('browser-window-focus', (event, window) => {
    log.debug('app.browser-window-focus', { event, window });
});
//# sourceMappingURL=main.js.map