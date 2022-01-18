"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputOptionsToWindowOptions = void 0;
function outputOptionsToWindowOptions(options) {
    var _a, _b;
    return {
        ...options,
        insecure: (_a = options.insecure) !== null && _a !== void 0 ? _a : false,
        zoom: (_b = options.zoom) !== null && _b !== void 0 ? _b : 1.0,
    };
}
exports.outputOptionsToWindowOptions = outputOptionsToWindowOptions;
//# sourceMappingURL=model.js.map