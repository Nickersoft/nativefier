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
exports.generateMenu = exports.createMenu = void 0;
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const log = __importStar(require("loglevel"));
const helpers_1 = require("../helpers/helpers");
const windowHelpers_1 = require("../helpers/windowHelpers");
function createMenu(options, mainWindow) {
    log.debug('createMenu', { options, mainWindow });
    const menuTemplate = generateMenu(options, mainWindow);
    injectBookmarks(menuTemplate);
    const menu = electron_1.Menu.buildFromTemplate(menuTemplate);
    electron_1.Menu.setApplicationMenu(menu);
}
exports.createMenu = createMenu;
function generateMenu(options, mainWindow) {
    const { nativefierVersion, zoom, disableDevTools } = options;
    const zoomResetLabel = !zoom || zoom === 1.0
        ? 'Reset Zoom'
        : `Reset Zoom (to ${(zoom * 100).toFixed(1)}%, set at build time)`;
    const editMenu = {
        label: '&Edit',
        submenu: [
            {
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo',
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                role: 'redo',
            },
            {
                type: 'separator',
            },
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                role: 'cut',
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                role: 'copy',
            },
            {
                label: 'Copy Current URL',
                accelerator: 'CmdOrCtrl+L',
                click: () => electron_1.clipboard.writeText((0, windowHelpers_1.getCurrentURL)()),
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                role: 'paste',
            },
            {
                label: 'Paste and Match Style',
                accelerator: 'CmdOrCtrl+Shift+V',
                role: 'pasteAndMatchStyle',
            },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectAll',
            },
            {
                label: 'Clear App Data',
                click: (item, focusedWindow) => {
                    log.debug('Clear App Data.click', {
                        item,
                        focusedWindow,
                        mainWindow,
                    });
                    if (!focusedWindow) {
                        focusedWindow = mainWindow;
                    }
                    (0, windowHelpers_1.clearAppData)(focusedWindow).catch((err) => log.error('clearAppData ERROR', err));
                },
            },
        ],
    };
    const viewMenu = {
        label: '&View',
        submenu: [
            {
                label: 'Back',
                accelerator: (0, helpers_1.isOSX)() ? 'CmdOrAlt+Left' : 'Alt+Left',
                click: windowHelpers_1.goBack,
            },
            {
                label: 'BackAdditionalShortcut',
                visible: false,
                acceleratorWorksWhenHidden: true,
                accelerator: 'CmdOrCtrl+[',
                click: windowHelpers_1.goBack,
            },
            {
                label: 'Forward',
                accelerator: (0, helpers_1.isOSX)() ? 'Cmd+Right' : 'Alt+Right',
                click: windowHelpers_1.goForward,
            },
            {
                label: 'ForwardAdditionalShortcut',
                visible: false,
                acceleratorWorksWhenHidden: true,
                accelerator: 'CmdOrCtrl+]',
                click: windowHelpers_1.goForward,
            },
            {
                label: 'Reload',
                role: 'reload',
            },
            {
                type: 'separator',
            },
            {
                label: 'Toggle Full Screen',
                accelerator: (0, helpers_1.isOSX)() ? 'Ctrl+Cmd+F' : 'F11',
                enabled: mainWindow.isFullScreenable() || (0, helpers_1.isOSX)(),
                visible: mainWindow.isFullScreenable() || (0, helpers_1.isOSX)(),
                click: (item, focusedWindow) => {
                    log.debug('Toggle Full Screen.click()', {
                        item,
                        focusedWindow,
                        isFullScreen: focusedWindow === null || focusedWindow === void 0 ? void 0 : focusedWindow.isFullScreen(),
                        isFullScreenable: focusedWindow === null || focusedWindow === void 0 ? void 0 : focusedWindow.isFullScreenable(),
                    });
                    if (!focusedWindow) {
                        focusedWindow = mainWindow;
                    }
                    if (focusedWindow.isFullScreenable()) {
                        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                    }
                    else if ((0, helpers_1.isOSX)()) {
                        focusedWindow.setSimpleFullScreen(!focusedWindow.isSimpleFullScreen());
                    }
                },
            },
            {
                label: 'Zoom In',
                accelerator: 'CmdOrCtrl+=',
                click: windowHelpers_1.zoomIn,
            },
            {
                label: 'ZoomInAdditionalShortcut',
                visible: false,
                acceleratorWorksWhenHidden: true,
                accelerator: 'CmdOrCtrl+numadd',
                click: windowHelpers_1.zoomIn,
            },
            {
                label: 'Zoom Out',
                accelerator: 'CmdOrCtrl+-',
                click: windowHelpers_1.zoomOut,
            },
            {
                label: 'ZoomOutAdditionalShortcut',
                visible: false,
                acceleratorWorksWhenHidden: true,
                accelerator: 'CmdOrCtrl+numsub',
                click: windowHelpers_1.zoomOut,
            },
            {
                label: zoomResetLabel,
                accelerator: 'CmdOrCtrl+0',
                click: () => (0, windowHelpers_1.zoomReset)(options),
            },
            {
                label: 'ZoomResetAdditionalShortcut',
                visible: false,
                acceleratorWorksWhenHidden: true,
                accelerator: 'CmdOrCtrl+num0',
                click: () => (0, windowHelpers_1.zoomReset)(options),
            },
        ],
    };
    if (!disableDevTools) {
        viewMenu.submenu.push({
            type: 'separator',
        }, {
            label: 'Toggle Developer Tools',
            accelerator: (0, helpers_1.isOSX)() ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
            click: (item, focusedWindow) => {
                log.debug('Toggle Developer Tools.click()', { item, focusedWindow });
                if (!focusedWindow) {
                    focusedWindow = mainWindow;
                }
                focusedWindow.webContents.toggleDevTools();
            },
        });
    }
    const windowMenu = {
        label: '&Window',
        role: 'window',
        submenu: [
            {
                label: 'Minimize',
                accelerator: 'CmdOrCtrl+M',
                role: 'minimize',
            },
            {
                label: 'Close',
                accelerator: 'CmdOrCtrl+W',
                role: 'close',
            },
        ],
    };
    const helpMenu = {
        label: '&Help',
        role: 'help',
        submenu: [
            {
                label: `Built with Nativefier v${nativefierVersion}`,
                click: () => {
                    (0, helpers_1.openExternal)('https://github.com/nativefier/nativefier').catch((err) => log.error('Built with Nativefier v${nativefierVersion}.click ERROR', err));
                },
            },
            {
                label: 'Report an Issue',
                click: () => {
                    (0, helpers_1.openExternal)('https://github.com/nativefier/nativefier/issues').catch((err) => log.error('Report an Issue.click ERROR', err));
                },
            },
        ],
    };
    let menuTemplate;
    if ((0, helpers_1.isOSX)()) {
        const electronMenu = {
            label: 'E&lectron',
            submenu: [
                {
                    label: 'Services',
                    role: 'services',
                    submenu: [],
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Hide App',
                    accelerator: 'Cmd+H',
                    role: 'hide',
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Cmd+Shift+H',
                    role: 'hideOthers',
                },
                {
                    label: 'Show All',
                    role: 'unhide',
                },
                {
                    type: 'separator',
                },
                {
                    label: 'Quit',
                    accelerator: 'Cmd+Q',
                    role: 'quit',
                },
            ],
        };
        windowMenu.submenu.push({
            type: 'separator',
        }, {
            label: 'Bring All to Front',
            role: 'front',
        });
        menuTemplate = [electronMenu, editMenu, viewMenu, windowMenu, helpMenu];
    }
    else {
        menuTemplate = [editMenu, viewMenu, windowMenu, helpMenu];
    }
    return menuTemplate;
}
exports.generateMenu = generateMenu;
function injectBookmarks(menuTemplate) {
    const bookmarkConfigPath = path_1.default.join(__dirname, '..', 'bookmarks.json');
    if (!fs.existsSync(bookmarkConfigPath)) {
        return;
    }
    try {
        const bookmarksMenuConfig = JSON.parse(fs.readFileSync(bookmarkConfigPath, 'utf-8'));
        const submenu = bookmarksMenuConfig.bookmarks.map((bookmark) => {
            switch (bookmark.type) {
                case 'link':
                    if (!('title' in bookmark && 'url' in bookmark)) {
                        throw new Error('All links in the bookmarks menu must have a title and url.');
                    }
                    try {
                        new URL(bookmark.url);
                    }
                    catch (_a) {
                        throw new Error('Bookmark URL "' + bookmark.url + '"is invalid.');
                    }
                    return {
                        label: bookmark.title,
                        click: () => {
                            var _a;
                            (_a = (0, windowHelpers_1.goToURL)(bookmark.url)) === null || _a === void 0 ? void 0 : _a.catch((err) => log.error(`${bookmark.title}.click ERROR`, err));
                        },
                        accelerator: 'shortcut' in bookmark ? bookmark.shortcut : undefined,
                    };
                case 'separator':
                    return {
                        type: 'separator',
                    };
                default:
                    throw new Error('A bookmarks menu entry has an invalid type; type must be one of "link", "separator".');
            }
        });
        const bookmarksMenu = {
            label: bookmarksMenuConfig.menuLabel,
            submenu,
        };
        // Insert custom bookmarks menu between menus "View" and "Window"
        menuTemplate.splice(menuTemplate.length - 2, 0, bookmarksMenu);
    }
    catch (err) {
        log.error('Failed to load & parse bookmarks configuration JSON file.', err);
    }
}
//# sourceMappingURL=menu.js.map