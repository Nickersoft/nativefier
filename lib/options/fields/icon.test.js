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
const icon_1 = require("./icon");
const inferIcon_1 = require("../../infer/inferIcon");
jest.mock('./../../infer/inferIcon');
jest.mock('loglevel');
const mockedResult = 'icon path';
const ICON_PARAMS_PROVIDED = {
    packager: {
        icon: './icon.png',
        targetUrl: 'https://google.com',
        platform: 'mac',
    },
};
const ICON_PARAMS_NEEDS_INFER = {
    packager: {
        targetUrl: 'https://google.com',
        platform: 'mac',
    },
};
describe('when the icon parameter is passed', () => {
    test('it should return the icon parameter', async () => {
        expect(inferIcon_1.inferIcon).toHaveBeenCalledTimes(0);
        await expect((0, icon_1.icon)(ICON_PARAMS_PROVIDED)).resolves.toBeUndefined();
    });
});
describe('when the icon parameter is not passed', () => {
    test('it should call inferIcon', async () => {
        inferIcon_1.inferIcon.mockImplementationOnce(() => Promise.resolve(mockedResult));
        const result = await (0, icon_1.icon)(ICON_PARAMS_NEEDS_INFER);
        expect(result).toBe(mockedResult);
        expect(inferIcon_1.inferIcon).toHaveBeenCalledWith(ICON_PARAMS_NEEDS_INFER.packager.targetUrl, ICON_PARAMS_NEEDS_INFER.packager.platform);
    });
    describe('when inferIcon resolves with an error', () => {
        test('it should handle the error', async () => {
            inferIcon_1.inferIcon.mockImplementationOnce(() => Promise.reject(new Error('some error')));
            const result = await (0, icon_1.icon)(ICON_PARAMS_NEEDS_INFER);
            expect(result).toBeUndefined();
            expect(inferIcon_1.inferIcon).toHaveBeenCalledWith(ICON_PARAMS_NEEDS_INFER.packager.targetUrl, ICON_PARAMS_NEEDS_INFER.packager.platform);
            expect(log.warn).toHaveBeenCalledTimes(1); // eslint-disable-line @typescript-eslint/unbound-method
        });
    });
});
//# sourceMappingURL=icon.test.js.map