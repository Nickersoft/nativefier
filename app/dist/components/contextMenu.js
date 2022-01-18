"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initContextMenu = void 0;
const electron_context_menu_1 = __importDefault(require("electron-context-menu"));
const loglevel_1 = __importDefault(require("loglevel"));
const helpers_1 = require("../helpers/helpers");
const windowEvents_1 = require("../helpers/windowEvents");
const windowHelpers_1 = require("../helpers/windowHelpers");
const model_1 = require("../../../shared/src/options/model");
function initContextMenu(options, window) {
    loglevel_1.default.debug('initContextMenu', { options, window });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    (0, electron_context_menu_1.default)({
        prepend: (actions, params) => {
            loglevel_1.default.debug('contextMenu.prepend', { actions, params });
            const items = [];
            if (params.linkURL) {
                items.push({
                    label: 'Open Link in Default Browser',
                    click: () => {
                        (0, helpers_1.openExternal)(params.linkURL).catch((err) => loglevel_1.default.error('contextMenu Open Link in Default Browser ERROR', err));
                    },
                });
                items.push({
                    label: 'Open Link in New Window',
                    click: () => (0, windowHelpers_1.createNewWindow)((0, model_1.outputOptionsToWindowOptions)(options), windowEvents_1.setupNativefierWindow, params.linkURL, window),
                });
                if ((0, helpers_1.nativeTabsSupported)()) {
                    items.push({
                        label: 'Open Link in New Tab',
                        click: () => (0, windowHelpers_1.createNewTab)((0, model_1.outputOptionsToWindowOptions)(options), windowEvents_1.setupNativefierWindow, params.linkURL, true, window),
                    });
                }
            }
            return items;
        },
        showCopyImage: true,
        showCopyImageAddress: true,
        showSaveImage: true,
    });
}
exports.initContextMenu = initContextMenu;
//# sourceMappingURL=contextMenu.js.map