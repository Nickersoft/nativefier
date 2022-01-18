"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractString = exports.extractBoolean = void 0;
function extractBoolean(infoPlistXML, plistKey) {
    const plistValue = extractRaw(infoPlistXML, plistKey);
    return plistValue === undefined
        ? undefined
        : plistValue.split('<')[1].split('/>')[0].toLowerCase() === 'true';
}
exports.extractBoolean = extractBoolean;
function extractString(infoPlistXML, plistKey) {
    const plistValue = extractRaw(infoPlistXML, plistKey);
    return plistValue === undefined
        ? undefined
        : plistValue.split('<string>')[1].split('</string>')[0];
}
exports.extractString = extractString;
function extractRaw(infoPlistXML, plistKey) {
    // This would be easier with xml2js, but let's not add a dependency for something this minor.
    const fullKey = `\n    <key>${plistKey}</key>`;
    if (infoPlistXML.indexOf(fullKey) === -1) {
        // This value wasn't set, so we'll stay agnostic to it
        return undefined;
    }
    return infoPlistXML
        .split(fullKey)[1]
        .split('\n  </dict>')[0] // Get everything between here and the end of the main plist dict
        .split('\n    <key>')[0]; // Get everything before the next key (if it exists)
}
//# sourceMappingURL=plistInfoXMLHelpers.js.map