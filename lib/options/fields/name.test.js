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
const log = __importStar(require("loglevel"));
const name_1 = require("./name");
const constants_1 = require("../../constants");
const inferTitle_1 = require("../../infer/inferTitle");
const sanitizeFilename_1 = require("../../utils/sanitizeFilename");
jest.mock('./../../infer/inferTitle');
jest.mock('./../../utils/sanitizeFilename');
jest.mock('loglevel');
const inferTitleMockedResult = 'mock name';
const NAME_PARAMS_PROVIDED = {
    packager: {
        name: 'appname',
        targetUrl: 'https://google.com',
        platform: 'linux',
    },
};
const NAME_PARAMS_NEEDS_INFER = {
    packager: {
        targetUrl: 'https://google.com',
        platform: 'mac',
    },
};
beforeAll(() => {
    sanitizeFilename_1.sanitizeFilename.mockImplementation((_, filename) => filename);
});
describe('well formed name parameters', () => {
    test('it should not call inferTitle', async () => {
        const result = await (0, name_1.name)(NAME_PARAMS_PROVIDED);
        expect(inferTitle_1.inferTitle).toHaveBeenCalledTimes(0);
        expect(result).toBe(NAME_PARAMS_PROVIDED.packager.name);
    });
    test('it should call sanitize filename', async () => {
        const result = await (0, name_1.name)(NAME_PARAMS_PROVIDED);
        expect(sanitizeFilename_1.sanitizeFilename).toHaveBeenCalledWith(NAME_PARAMS_PROVIDED.packager.platform, result);
    });
});
describe('bad name parameters', () => {
    beforeEach(() => {
        inferTitle_1.inferTitle.mockResolvedValue(inferTitleMockedResult);
    });
    const params = { packager: { targetUrl: 'some url', platform: 'whatever' } };
    test('it should call inferTitle when the name is undefined', async () => {
        await (0, name_1.name)(params);
        expect(inferTitle_1.inferTitle).toHaveBeenCalledWith(params.packager.targetUrl);
    });
    test('it should call inferTitle when the name is an empty string', async () => {
        const testParams = {
            ...params,
            name: '',
        };
        await (0, name_1.name)(testParams);
        expect(inferTitle_1.inferTitle).toHaveBeenCalledWith(params.packager.targetUrl);
    });
    test('it should call sanitize filename', async () => {
        const result = await (0, name_1.name)(params);
        expect(sanitizeFilename_1.sanitizeFilename).toHaveBeenCalledWith(params.packager.platform, result);
    });
});
describe('handling inferTitle results', () => {
    test('it should return the result from inferTitle', async () => {
        const result = await (0, name_1.name)(NAME_PARAMS_NEEDS_INFER);
        expect(result).toEqual(inferTitleMockedResult);
        expect(inferTitle_1.inferTitle).toHaveBeenCalledWith(NAME_PARAMS_NEEDS_INFER.packager.targetUrl);
    });
    test('it should return the default app name when the returned pageTitle is falsey', async () => {
        inferTitle_1.inferTitle.mockResolvedValue(null);
        const result = await (0, name_1.name)(NAME_PARAMS_NEEDS_INFER);
        expect(result).toEqual(constants_1.DEFAULT_APP_NAME);
        expect(inferTitle_1.inferTitle).toHaveBeenCalledWith(NAME_PARAMS_NEEDS_INFER.packager.targetUrl);
    });
    test('it should return the default app name when inferTitle rejects', async () => {
        inferTitle_1.inferTitle.mockRejectedValue('some error');
        const result = await (0, name_1.name)(NAME_PARAMS_NEEDS_INFER);
        expect(result).toEqual(constants_1.DEFAULT_APP_NAME);
        expect(inferTitle_1.inferTitle).toHaveBeenCalledWith(NAME_PARAMS_NEEDS_INFER.packager.targetUrl);
        expect(log.warn).toHaveBeenCalledTimes(1); // eslint-disable-line @typescript-eslint/unbound-method
    });
});
//# sourceMappingURL=name.test.js.map