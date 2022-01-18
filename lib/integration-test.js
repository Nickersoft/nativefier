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
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const constants_1 = require("./constants");
const helpers_1 = require("./helpers/helpers");
const inferChromeVersion_1 = require("./infer/browsers/inferChromeVersion");
const inferFirefoxVersion_1 = require("./infer/browsers/inferFirefoxVersion");
const inferSafariVersion_1 = require("./infer/browsers/inferSafariVersion");
const inferOs_1 = require("./infer/inferOs");
const main_1 = require("./main");
const userAgent_1 = require("./options/fields/userAgent");
const parseUtils_1 = require("./utils/parseUtils");
async function checkApp(appRoot, inputOptions) {
    const arch = inputOptions.arch ? inputOptions.arch : (0, inferOs_1.inferArch)();
    if (inputOptions.out !== undefined) {
        expect(path.join(inputOptions.out, `Google-${inputOptions.platform}-${arch}`)).toBe(appRoot);
    }
    let relativeResourcesDir = 'resources';
    if (inputOptions.platform === 'darwin') {
        relativeResourcesDir = path.join('Google.app', 'Contents', 'Resources');
    }
    const appPath = path.join(appRoot, relativeResourcesDir, 'app');
    const configPath = path.join(appPath, 'nativefier.json');
    const nativefierConfig = (0, parseUtils_1.parseJson)(fs.readFileSync(configPath).toString());
    expect(nativefierConfig).not.toBeUndefined();
    expect(inputOptions.targetUrl).toBe(nativefierConfig === null || nativefierConfig === void 0 ? void 0 : nativefierConfig.targetUrl);
    // Test name inferring
    expect(nativefierConfig === null || nativefierConfig === void 0 ? void 0 : nativefierConfig.name).toBe('Google');
    // Test icon writing
    const iconFile = inputOptions.platform === 'darwin'
        ? path.join('..', 'electron.icns')
        : inputOptions.platform === 'linux'
            ? 'icon.png'
            : 'icon.ico';
    const iconPath = path.join(appPath, iconFile);
    expect(fs.existsSync(iconPath)).toEqual(true);
    expect(fs.statSync(iconPath).size).toBeGreaterThan(1000);
    // Test arch
    if (inputOptions.arch !== undefined) {
        expect(inputOptions.arch).toEqual(nativefierConfig === null || nativefierConfig === void 0 ? void 0 : nativefierConfig.arch);
    }
    else {
        expect(os.arch()).toEqual(nativefierConfig === null || nativefierConfig === void 0 ? void 0 : nativefierConfig.arch);
    }
    // Test electron version
    expect(nativefierConfig === null || nativefierConfig === void 0 ? void 0 : nativefierConfig.electronVersionUsed).toBe(inputOptions.electronVersion || constants_1.DEFAULT_ELECTRON_VERSION);
    // Test user agent
    if (inputOptions.userAgent) {
        const translatedUserAgent = await (0, userAgent_1.userAgent)({
            packager: {
                platform: inputOptions.platform,
                electronVersion: inputOptions.electronVersion || constants_1.DEFAULT_ELECTRON_VERSION,
            },
            nativefier: { userAgent: inputOptions.userAgent },
        });
        inputOptions.userAgent = translatedUserAgent || inputOptions.userAgent;
    }
    expect(nativefierConfig === null || nativefierConfig === void 0 ? void 0 : nativefierConfig.userAgent).toEqual(inputOptions.userAgent);
    // Test lang
    expect(nativefierConfig === null || nativefierConfig === void 0 ? void 0 : nativefierConfig.lang).toEqual(inputOptions.lang);
    // Test global shortcuts
    if (inputOptions.globalShortcuts) {
        let shortcutData = [];
        if (typeof inputOptions.globalShortcuts === 'string') {
            shortcutData = (0, parseUtils_1.parseJson)(fs.readFileSync(inputOptions.globalShortcuts, 'utf8'));
        }
        else {
            shortcutData = inputOptions.globalShortcuts;
        }
        expect(nativefierConfig === null || nativefierConfig === void 0 ? void 0 : nativefierConfig.globalShortcuts).toStrictEqual(shortcutData);
    }
}
describe('Nativefier', () => {
    jest.setTimeout(300000);
    test.each(['darwin', 'linux'])('builds a Nativefier app for platform %s', async (platform) => {
        const tempDirectory = (0, helpers_1.getTempDir)('integtest');
        const options = {
            lang: 'en-US',
            out: tempDirectory,
            overwrite: true,
            platform,
            targetUrl: 'https://google.com/',
        };
        const appPath = await (0, main_1.buildNativefierApp)(options);
        expect(appPath).not.toBeUndefined();
        await checkApp(appPath, options);
    });
});
function generateShortcutsFile(dir) {
    const shortcuts = [
        {
            key: 'MediaPlayPause',
            inputEvents: [
                {
                    type: 'keyDown',
                    keyCode: 'Space',
                },
            ],
        },
        {
            key: 'MediaNextTrack',
            inputEvents: [
                {
                    type: 'keyDown',
                    keyCode: 'Right',
                },
            ],
        },
    ];
    const filename = path.join(dir, 'shortcuts.json');
    fs.writeFileSync(filename, JSON.stringify(shortcuts));
    return filename;
}
describe('Nativefier upgrade', () => {
    jest.setTimeout(300000);
    test.each([
        { platform: 'darwin', arch: 'x64' },
        { platform: 'linux', arch: 'arm64', userAgent: 'FIREFOX 60' },
        // Exhaustive integration testing here would be neat, but takes too long.
        // -> For now, only testing a subset of platforms/archs
        // { platform: 'win32', arch: 'x64' },
        // { platform: 'win32', arch: 'ia32' },
        // { platform: 'darwin', arch: 'arm64' },
        // { platform: 'linux', arch: 'x64' },
        // { platform: 'linux', arch: 'armv7l' },
        // { platform: 'linux', arch: 'ia32' },
    ])('can upgrade a Nativefier app for platform/arch: %s', async (baseAppOptions) => {
        const tempDirectory = (0, helpers_1.getTempDir)('integtestUpgrade1');
        const shortcuts = generateShortcutsFile(tempDirectory);
        const options = {
            electronVersion: '11.2.3',
            globalShortcuts: shortcuts,
            out: tempDirectory,
            overwrite: true,
            targetUrl: 'https://google.com/',
            ...baseAppOptions,
        };
        const appPath = await (0, main_1.buildNativefierApp)(options);
        expect(appPath).not.toBeUndefined();
        await checkApp(appPath, options);
        const upgradeOptions = {
            upgrade: appPath,
            overwrite: true,
        };
        const upgradeAppPath = await (0, main_1.buildNativefierApp)(upgradeOptions);
        options.electronVersion = constants_1.DEFAULT_ELECTRON_VERSION;
        options.userAgent = baseAppOptions.userAgent;
        expect(upgradeAppPath).not.toBeUndefined();
        await checkApp(upgradeAppPath, options);
    });
});
describe('Browser version retrieval', () => {
    test('get chrome version with electron version', async () => {
        await expect((0, inferChromeVersion_1.getChromeVersionForElectronVersion)('12.0.0')).resolves.toBe('89.0.4389.69');
    });
    test('get latest firefox version', async () => {
        const firefoxVersion = await (0, inferFirefoxVersion_1.getLatestFirefoxVersion)();
        const majorVersion = parseInt(firefoxVersion.split('.')[0]);
        expect(majorVersion).toBeGreaterThanOrEqual(88);
    });
    test('get latest safari version', async () => {
        const safariVersion = await (0, inferSafariVersion_1.getLatestSafariVersion)();
        expect(safariVersion.majorVersion).toBeGreaterThanOrEqual(14);
    });
});
//# sourceMappingURL=integration-test.js.map