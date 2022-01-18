"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inferChromeVersion_1 = require("../../infer/browsers/inferChromeVersion");
const inferFirefoxVersion_1 = require("../../infer/browsers/inferFirefoxVersion");
const inferSafariVersion_1 = require("../../infer/browsers/inferSafariVersion");
const userAgent_1 = require("./userAgent");
jest.mock('./../../infer/browsers/inferChromeVersion');
jest.mock('./../../infer/browsers/inferFirefoxVersion');
jest.mock('./../../infer/browsers/inferSafariVersion');
test('when a userAgent parameter is passed', async () => {
    const params = {
        packager: {},
        nativefier: { userAgent: 'valid user agent' },
    };
    await expect((0, userAgent_1.userAgent)(params)).resolves.toBeUndefined();
});
test('no userAgent parameter is passed', async () => {
    const params = {
        packager: { platform: 'mac' },
        nativefier: {},
    };
    await expect((0, userAgent_1.userAgent)(params)).resolves.toBeUndefined();
});
test('edge userAgent parameter is passed', async () => {
    inferChromeVersion_1.getChromeVersionForElectronVersion.mockImplementationOnce(() => Promise.resolve('99.0.0'));
    const params = {
        packager: { platform: 'darwin' },
        nativefier: { userAgent: 'edge' },
    };
    const parsedUserAgent = await (0, userAgent_1.userAgent)(params);
    expect(parsedUserAgent).not.toBe(params.nativefier.userAgent);
    expect(parsedUserAgent).toContain('Edg/99.0.0');
});
test('firefox userAgent parameter is passed', async () => {
    inferFirefoxVersion_1.getLatestFirefoxVersion.mockImplementationOnce(() => Promise.resolve('100.0.0'));
    const params = {
        packager: { platform: 'win32' },
        nativefier: { userAgent: 'firefox' },
    };
    const parsedUserAgent = await (0, userAgent_1.userAgent)(params);
    expect(parsedUserAgent).not.toBe(params.nativefier.userAgent);
    expect(parsedUserAgent).toContain('Firefox/100.0.0');
});
test('safari userAgent parameter is passed', async () => {
    inferSafariVersion_1.getLatestSafariVersion.mockImplementationOnce(() => Promise.resolve({
        majorVersion: 101,
        version: '101.0.0',
        webkitVersion: '600.0.0.0',
    }));
    const params = {
        packager: { platform: 'linux' },
        nativefier: { userAgent: 'safari' },
    };
    const parsedUserAgent = await (0, userAgent_1.userAgent)(params);
    expect(parsedUserAgent).not.toBe(params.nativefier.userAgent);
    expect(parsedUserAgent).toContain('Version/101.0.0 Safari');
});
test('short userAgent parameter is passed with an electronVersion', async () => {
    inferChromeVersion_1.getChromeVersionForElectronVersion.mockImplementationOnce(() => Promise.resolve('102.0.0'));
    const params = {
        packager: { electronVersion: '12.0.0', platform: 'darwin' },
        nativefier: { userAgent: 'edge' },
    };
    const parsedUserAgent = await (0, userAgent_1.userAgent)(params);
    expect(parsedUserAgent).not.toBe(params.nativefier.userAgent);
    expect(parsedUserAgent).toContain('102.0.0');
    expect(inferChromeVersion_1.getChromeVersionForElectronVersion).toHaveBeenCalledWith('12.0.0');
});
//# sourceMappingURL=userAgent.test.js.map