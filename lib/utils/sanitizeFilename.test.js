"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sanitizeFilename_1 = require("./sanitizeFilename");
const constants_1 = require("../constants");
describe('replacing reserved characters', () => {
    const reserved = '\\/?*<>:|';
    test('it should return a result without reserved characters', () => {
        const expectedResult = 'abc';
        const param = `${reserved}${expectedResult}`;
        const result = (0, sanitizeFilename_1.sanitizeFilename)('', param);
        expect(result).toBe(expectedResult);
    });
    test('it should allow non-ascii characters', () => {
        const expectedResult = '微信读书';
        const param = `${reserved}${expectedResult}`;
        const result = (0, sanitizeFilename_1.sanitizeFilename)('', param);
        expect(result).toBe(expectedResult);
    });
    test('when the result of replacing these characters is empty, use default', () => {
        const result = (0, sanitizeFilename_1.sanitizeFilename)('', reserved);
        expect(result).toBe(constants_1.DEFAULT_APP_NAME);
    });
});
describe('when the platform is linux', () => {
    test('it should return a name without spaces', () => {
        const param = 'some name';
        const expectedResult = 'somename';
        const result = (0, sanitizeFilename_1.sanitizeFilename)('linux', param);
        expect(result).toBe(expectedResult);
    });
});
//# sourceMappingURL=sanitizeFilename.test.js.map