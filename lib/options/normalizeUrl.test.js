"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const normalizeUrl_1 = require("./normalizeUrl");
test("a proper URL shouldn't be mangled", () => {
    expect((0, normalizeUrl_1.normalizeUrl)('http://www.google.com')).toEqual('http://www.google.com/');
});
test('missing protocol should default to https', () => {
    expect((0, normalizeUrl_1.normalizeUrl)('www.google.com')).toEqual('https://www.google.com/');
});
test("a proper URL shouldn't be mangled", () => {
    expect(() => {
        (0, normalizeUrl_1.normalizeUrl)('http://ssddfoo bar');
    }).toThrow('Your url "http://ssddfoo bar" is invalid');
});
//# sourceMappingURL=normalizeUrl.test.js.map