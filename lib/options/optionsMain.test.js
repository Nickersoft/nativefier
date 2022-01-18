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
const optionsMain_1 = require("./optionsMain");
const asyncConfig = __importStar(require("./asyncConfig"));
const inferOs_1 = require("../infer/inferOs");
let asyncConfigMock;
const mockedAsyncConfig = {
    nativefier: {
        accessibilityPrompt: false,
        alwaysOnTop: false,
        backgroundColor: undefined,
        basicAuthPassword: undefined,
        basicAuthUsername: undefined,
        blockExternalUrls: false,
        bookmarksMenu: undefined,
        bounce: false,
        browserwindowOptions: undefined,
        clearCache: false,
        counter: false,
        crashReporter: undefined,
        disableContextMenu: false,
        disableDevTools: false,
        disableGpu: false,
        disableOldBuildWarning: false,
        diskCacheSize: undefined,
        enableEs3Apis: false,
        fastQuit: true,
        fileDownloadOptions: undefined,
        flashPluginDir: undefined,
        fullScreen: false,
        globalShortcuts: undefined,
        height: undefined,
        hideWindowFrame: false,
        ignoreCertificate: false,
        ignoreGpuBlacklist: false,
        inject: [],
        insecure: false,
        internalUrls: undefined,
        maximize: false,
        maxHeight: undefined,
        minWidth: undefined,
        minHeight: undefined,
        maxWidth: undefined,
        nativefierVersion: '1.0.0',
        processEnvs: undefined,
        proxyRules: undefined,
        showMenuBar: false,
        singleInstance: false,
        titleBarStyle: undefined,
        tray: 'false',
        userAgent: undefined,
        userAgentHonest: false,
        verbose: false,
        versionString: '1.0.0',
        width: undefined,
        widevine: false,
        x: undefined,
        y: undefined,
        zoom: 1,
    },
    packager: {
        dir: '',
        platform: process.platform,
        portable: false,
        targetUrl: '',
        upgrade: false,
    },
};
beforeAll(() => {
    asyncConfigMock = jest
        .spyOn(asyncConfig, 'asyncConfig')
        .mockResolvedValue(mockedAsyncConfig);
});
test('it should call the async config', async () => {
    const params = {
        targetUrl: 'https://example.com/',
        tray: 'false',
    };
    const result = await (0, optionsMain_1.getOptions)(params);
    expect(asyncConfigMock).toHaveBeenCalledWith(expect.objectContaining({
        packager: expect.anything(),
        nativefier: expect.anything(),
    }));
    expect(result.packager.targetUrl).toEqual(params.targetUrl);
});
test('it should set the accessibility prompt option to true by default', async () => {
    const params = {
        targetUrl: 'https://example.com/',
        tray: 'false',
    };
    const result = await (0, optionsMain_1.getOptions)(params);
    expect(asyncConfigMock).toHaveBeenCalledWith(expect.objectContaining({
        nativefier: expect.objectContaining({
            accessibilityPrompt: true,
        }),
    }));
    expect(result.nativefier.accessibilityPrompt).toEqual(true);
});
test.each([
    { platform: 'darwin', expectedPlatform: 'darwin' },
    { platform: 'mAc', expectedPlatform: 'darwin' },
    { platform: 'osx', expectedPlatform: 'darwin' },
    { platform: 'liNux', expectedPlatform: 'linux' },
    { platform: 'mas', expectedPlatform: 'mas' },
    { platform: 'WIN32', expectedPlatform: 'win32' },
    { platform: 'windows', expectedPlatform: 'win32' },
    {},
])('it should be able to normalize the platform %s', (platformOptions) => {
    if (!platformOptions.expectedPlatform) {
        platformOptions.expectedPlatform = (0, inferOs_1.inferPlatform)();
    }
    expect((0, optionsMain_1.normalizePlatform)(platformOptions.platform)).toBe(platformOptions.expectedPlatform);
});
//# sourceMappingURL=optionsMain.test.js.map