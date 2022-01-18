"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
jest.mock('loglevel');
const loglevel_1 = require("loglevel");
jest.mock('./helpers');
const helpers_1 = require("./helpers");
jest.mock('./windowEvents');
const windowHelpers_1 = require("./windowHelpers");
describe('clearAppData', () => {
    let window;
    let mockClearCache;
    let mockClearStorageData;
    const mockShowDialog = jest.spyOn(electron_1.dialog, 'showMessageBox');
    beforeEach(() => {
        window = new electron_1.BrowserWindow();
        mockClearCache = jest.spyOn(window.webContents.session, 'clearCache');
        mockClearStorageData = jest.spyOn(window.webContents.session, 'clearStorageData');
        mockShowDialog.mockReset().mockResolvedValue(undefined);
    });
    afterAll(() => {
        mockClearCache.mockRestore();
        mockClearStorageData.mockRestore();
        mockShowDialog.mockRestore();
    });
    test('will not clear app data if dialog canceled', async () => {
        mockShowDialog.mockResolvedValue(1);
        await (0, windowHelpers_1.clearAppData)(window);
        expect(mockShowDialog).toHaveBeenCalledTimes(1);
        expect(mockClearCache).not.toHaveBeenCalled();
        expect(mockClearStorageData).not.toHaveBeenCalled();
    });
    test('will clear app data if ok is clicked', async () => {
        mockShowDialog.mockResolvedValue(0);
        await (0, windowHelpers_1.clearAppData)(window);
        expect(mockShowDialog).toHaveBeenCalledTimes(1);
        expect(mockClearCache).not.toHaveBeenCalledTimes(1);
        expect(mockClearStorageData).not.toHaveBeenCalledTimes(1);
    });
});
describe('createNewTab', () => {
    const window = new electron_1.BrowserWindow();
    const options = {
        blockExternalUrls: false,
        insecure: false,
        name: 'Test App',
        targetUrl: 'https://github.com/nativefier/natifefier',
        zoom: 1.0,
    };
    const setupWindow = jest.fn();
    const url = 'https://github.com/nativefier/nativefier';
    const mockAddTabbedWindow = jest.spyOn(electron_1.BrowserWindow.prototype, 'addTabbedWindow');
    const mockFocus = jest.spyOn(electron_1.BrowserWindow.prototype, 'focus');
    const mockLoadURL = jest.spyOn(electron_1.BrowserWindow.prototype, 'loadURL');
    test('creates new foreground tab', () => {
        const foreground = true;
        const tab = (0, windowHelpers_1.createNewTab)(options, setupWindow, url, foreground, window);
        expect(mockAddTabbedWindow).toHaveBeenCalledWith(tab);
        expect(setupWindow).toHaveBeenCalledWith(options, tab);
        expect(mockLoadURL).toHaveBeenCalledWith(url);
        expect(mockFocus).not.toHaveBeenCalled();
    });
    test('creates new background tab', () => {
        const foreground = false;
        const tab = (0, windowHelpers_1.createNewTab)(options, setupWindow, url, foreground, window);
        expect(mockAddTabbedWindow).toHaveBeenCalledWith(tab);
        expect(setupWindow).toHaveBeenCalledWith(options, tab);
        expect(mockLoadURL).toHaveBeenCalledWith(url);
        expect(mockFocus).toHaveBeenCalledTimes(1);
    });
});
describe('injectCSS', () => {
    jest.setTimeout(10000);
    const mockGetCSSToInject = helpers_1.getCSSToInject;
    const mockLogError = loglevel_1.error;
    const css = 'body { color: white; }';
    let responseHeaders;
    beforeEach(() => {
        mockGetCSSToInject.mockReset().mockReturnValue('');
        mockLogError.mockReset();
        responseHeaders = { 'x-header': ['value'], 'content-type': ['test/other'] };
    });
    afterAll(() => {
        mockGetCSSToInject.mockRestore();
        mockLogError.mockRestore();
    });
    test('will not inject if getCSSToInject is empty', () => {
        const window = new electron_1.BrowserWindow();
        const mockWebContentsInsertCSS = jest
            .spyOn(window.webContents, 'insertCSS')
            .mockResolvedValue('');
        jest
            .spyOn(window.webContents, 'getURL')
            .mockReturnValue('https://example.com');
        (0, windowHelpers_1.injectCSS)(window);
        expect(mockGetCSSToInject).toHaveBeenCalled();
        expect(mockWebContentsInsertCSS).not.toHaveBeenCalled();
    });
    test('will inject on did-navigate + onResponseStarted', () => {
        mockGetCSSToInject.mockReturnValue(css);
        const window = new electron_1.BrowserWindow();
        const mockWebContentsInsertCSS = jest
            .spyOn(window.webContents, 'insertCSS')
            .mockResolvedValue('');
        jest
            .spyOn(window.webContents, 'getURL')
            .mockReturnValue('https://example.com');
        (0, windowHelpers_1.injectCSS)(window);
        expect(mockGetCSSToInject).toHaveBeenCalled();
        window.webContents.emit('did-navigate');
        // @ts-expect-error this function doesn't exist in the actual electron version, but will in our mock
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        window.webContents.session.webRequest.send('onResponseStarted', {
            responseHeaders,
            webContents: window.webContents,
        });
        expect(mockWebContentsInsertCSS).toHaveBeenCalledWith(css);
    });
    test.each(['application/json', 'font/woff2', 'image/png'])('will not inject for content-type %s', (contentType) => {
        mockGetCSSToInject.mockReturnValue(css);
        const window = new electron_1.BrowserWindow();
        const mockWebContentsInsertCSS = jest
            .spyOn(window.webContents, 'insertCSS')
            .mockResolvedValue('');
        jest
            .spyOn(window.webContents, 'getURL')
            .mockReturnValue('https://example.com');
        responseHeaders['content-type'] = [contentType];
        (0, windowHelpers_1.injectCSS)(window);
        expect(mockGetCSSToInject).toHaveBeenCalled();
        expect(window.webContents.emit('did-navigate')).toBe(true);
        mockWebContentsInsertCSS.mockReset().mockResolvedValue(undefined);
        // @ts-expect-error this function doesn't exist in the actual electron version, but will in our mock
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        window.webContents.session.webRequest.send('onResponseStarted', {
            responseHeaders,
            webContents: window.webContents,
            url: `test-${contentType}`,
        });
        // insertCSS will still run once for the did-navigate
        expect(mockWebContentsInsertCSS).not.toHaveBeenCalled();
    });
    test.each(['text/html'])('will inject for content-type %s', (contentType) => {
        mockGetCSSToInject.mockReturnValue(css);
        const window = new electron_1.BrowserWindow();
        const mockWebContentsInsertCSS = jest
            .spyOn(window.webContents, 'insertCSS')
            .mockResolvedValue('');
        jest
            .spyOn(window.webContents, 'getURL')
            .mockReturnValue('https://example.com');
        responseHeaders['content-type'] = [contentType];
        (0, windowHelpers_1.injectCSS)(window);
        expect(mockGetCSSToInject).toHaveBeenCalled();
        window.webContents.emit('did-navigate');
        mockWebContentsInsertCSS.mockReset().mockResolvedValue(undefined);
        // @ts-expect-error this function doesn't exist in the actual electron version, but will in our mock
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        window.webContents.session.webRequest.send('onResponseStarted', {
            responseHeaders,
            webContents: window.webContents,
            url: `test-${contentType}`,
        });
        expect(mockWebContentsInsertCSS).toHaveBeenCalledTimes(1);
    });
    test.each(['image', 'script', 'stylesheet', 'xhr'])('will not inject for resource type %s', (resourceType) => {
        mockGetCSSToInject.mockReturnValue(css);
        const window = new electron_1.BrowserWindow();
        const mockWebContentsInsertCSS = jest
            .spyOn(window.webContents, 'insertCSS')
            .mockResolvedValue('');
        jest
            .spyOn(window.webContents, 'getURL')
            .mockReturnValue('https://example.com');
        (0, windowHelpers_1.injectCSS)(window);
        expect(mockGetCSSToInject).toHaveBeenCalled();
        window.webContents.emit('did-navigate');
        mockWebContentsInsertCSS.mockReset().mockResolvedValue(undefined);
        // @ts-expect-error this function doesn't exist in the actual electron version, but will in our mock
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        window.webContents.session.webRequest.send('onResponseStarted', {
            responseHeaders,
            webContents: window.webContents,
            resourceType,
            url: `test-${resourceType}`,
        });
        // insertCSS will still run once for the did-navigate
        expect(mockWebContentsInsertCSS).not.toHaveBeenCalled();
    });
    test.each(['html', 'other'])('will inject for resource type %s', (resourceType) => {
        mockGetCSSToInject.mockReturnValue(css);
        const window = new electron_1.BrowserWindow();
        const mockWebContentsInsertCSS = jest
            .spyOn(window.webContents, 'insertCSS')
            .mockResolvedValue('');
        jest
            .spyOn(window.webContents, 'getURL')
            .mockReturnValue('https://example.com');
        (0, windowHelpers_1.injectCSS)(window);
        expect(mockGetCSSToInject).toHaveBeenCalled();
        window.webContents.emit('did-navigate');
        mockWebContentsInsertCSS.mockReset().mockResolvedValue(undefined);
        // @ts-expect-error this function doesn't exist in the actual electron version, but will in our mock
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        window.webContents.session.webRequest.send('onResponseStarted', {
            responseHeaders,
            webContents: window.webContents,
            resourceType,
            url: `test-${resourceType}`,
        });
        expect(mockWebContentsInsertCSS).toHaveBeenCalledTimes(1);
    });
});
//# sourceMappingURL=windowHelpers.test.js.map