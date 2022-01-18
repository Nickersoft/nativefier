"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prepareElectronApp_1 = require("./prepareElectronApp");
describe('normalizeAppName', () => {
    test('it is stable', () => {
        // Non-determinism / unstability would cause using a different appName
        // at each app regen, thus a different appData folder, which would cause
        // losing user state, including login state through cookies.
        const normalizedTrello = (0, prepareElectronApp_1.normalizeAppName)('Trello', 'https://trello.com');
        expect(normalizedTrello).toBe('trello-nativefier-679e8e');
    });
});
//# sourceMappingURL=prepareElectronApp.test.js.map