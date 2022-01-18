"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
describe('isArgFormatInvalid', () => {
    test('is false for correct short args', () => {
        expect((0, helpers_1.isArgFormatInvalid)('-t')).toBe(false);
    });
    test('is true for improperly double-dashed short args', () => {
        expect((0, helpers_1.isArgFormatInvalid)('--t')).toBe(true);
    });
    test('is false for --x and --y (backwards compat, we should have made these short, oh well)', () => {
        expect((0, helpers_1.isArgFormatInvalid)('--x')).toBe(false);
        expect((0, helpers_1.isArgFormatInvalid)('--y')).toBe(false);
    });
    test('is false for correct long args', () => {
        expect((0, helpers_1.isArgFormatInvalid)('--test')).toBe(false);
    });
    test('is true for improperly triple-dashed long args', () => {
        expect((0, helpers_1.isArgFormatInvalid)('---test')).toBe(true);
    });
    test('is true for improperly single-dashed long args', () => {
        expect((0, helpers_1.isArgFormatInvalid)('-test')).toBe(true);
    });
    test('is false for correct long args with dashes', () => {
        expect((0, helpers_1.isArgFormatInvalid)('--test-run')).toBe(false);
    });
    test('is false for correct long args with many dashes', () => {
        expect((0, helpers_1.isArgFormatInvalid)('--test-run-with-many-dashes')).toBe(false);
    });
});
describe('generateRandomSuffix', () => {
    test('is not empty', () => {
        expect((0, helpers_1.generateRandomSuffix)()).not.toBe('');
    });
    test('is not null', () => {
        expect((0, helpers_1.generateRandomSuffix)()).not.toBeNull();
    });
    test('is not undefined', () => {
        expect((0, helpers_1.generateRandomSuffix)()).toBeDefined();
    });
    test('is different per call', () => {
        expect((0, helpers_1.generateRandomSuffix)()).not.toBe((0, helpers_1.generateRandomSuffix)());
    });
    test('respects the length param', () => {
        expect((0, helpers_1.generateRandomSuffix)(10).length).toBe(10);
    });
});
//# sourceMappingURL=helpers.test.js.map