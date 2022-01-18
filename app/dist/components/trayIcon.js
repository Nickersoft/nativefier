"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrayIcon = void 0;
const electron_1 = require("electron");
const loglevel_1 = __importDefault(require("loglevel"));
const helpers_1 = require("../helpers/helpers");
function createTrayIcon(nativefierOptions, mainWindow) {
    var _a;
    const options = { ...nativefierOptions };
    if (options.tray && options.tray !== 'false') {
        const iconPath = (0, helpers_1.getAppIcon)();
        if (!iconPath) {
            throw new Error('Icon path not found found to use with tray option.');
        }
        const nimage = electron_1.nativeImage.createFromPath(iconPath);
        const appIcon = new electron_1.Tray(electron_1.nativeImage.createEmpty());
        if ((0, helpers_1.isOSX)()) {
            //sets the icon to the height of the tray.
            appIcon.setImage(nimage.resize({ height: appIcon.getBounds().height - 2 }));
        }
        else {
            appIcon.setImage(nimage);
        }
        const onClick = () => {
            loglevel_1.default.debug('onClick');
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            }
            else {
                mainWindow.show();
            }
        };
        const contextMenu = electron_1.Menu.buildFromTemplate([
            {
                label: options.name,
                click: onClick,
            },
            {
                label: 'Quit',
                click: () => electron_1.app.exit(0),
            },
        ]);
        appIcon.on('click', onClick);
        if (options.counter) {
            mainWindow.on('page-title-updated', (event, title) => {
                var _a, _b;
                loglevel_1.default.debug('mainWindow.page-title-updated', { event, title });
                const counterValue = (0, helpers_1.getCounterValue)(title);
                if (counterValue) {
                    appIcon.setToolTip(`(${counterValue})  ${(_a = options.name) !== null && _a !== void 0 ? _a : 'Nativefier'}`);
                }
                else {
                    appIcon.setToolTip((_b = options.name) !== null && _b !== void 0 ? _b : '');
                }
            });
        }
        else {
            electron_1.ipcMain.on('notification', () => {
                loglevel_1.default.debug('ipcMain.notification');
                if (mainWindow.isFocused()) {
                    return;
                }
                if (options.name) {
                    appIcon.setToolTip(`•  ${options.name}`);
                }
            });
            mainWindow.on('focus', () => {
                var _a;
                loglevel_1.default.debug('mainWindow.focus');
                appIcon.setToolTip((_a = options.name) !== null && _a !== void 0 ? _a : '');
            });
        }
        appIcon.setToolTip((_a = options.name) !== null && _a !== void 0 ? _a : '');
        appIcon.setContextMenu(contextMenu);
        return appIcon;
    }
    return undefined;
}
exports.createTrayIcon = createTrayIcon;
//# sourceMappingURL=trayIcon.js.map