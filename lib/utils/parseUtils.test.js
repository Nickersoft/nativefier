"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseUtils_1 = require("./parseUtils");
test.each([
    ['true', true, true],
    ['1', true, true],
    ['yes', true, true],
    [1, true, true],
    [true, true, true],
    ['false', false, true],
    ['0', false, true],
    ['no', false, true],
    [0, false, true],
    [false, false, true],
    [undefined, true, true],
    [undefined, false, false],
])('parseBoolean("%s") === %s (default = %s)', (testValue, expectedResult, _default) => {
    expect((0, parseUtils_1.parseBoolean)(testValue, _default)).toBe(expectedResult);
});
//# sourceMappingURL=parseUtils.test.js.map