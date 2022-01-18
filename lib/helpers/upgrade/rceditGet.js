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
exports.getVersionString = void 0;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
// A modification of https://github.com/electron/node-rcedit to support the retrieval
// of information.
function getVersionString(executablePath, versionString) {
    var _a;
    let rcedit = path.resolve(__dirname, '..', '..', '..', 'node_modules', 'rcedit', 'bin', process.arch === 'x64' ? 'rcedit-x64.exe' : 'rcedit.exe');
    const args = [executablePath, `--get-version-string`, versionString];
    const spawnOptions = {
        env: { ...process.env },
    };
    // Use Wine on non-Windows platforms except for WSL, which doesn't need it
    if (process.platform !== 'win32' && !os.release().endsWith('Microsoft')) {
        args.unshift(rcedit);
        rcedit = process.arch === 'x64' ? 'wine64' : 'wine';
        // Suppress "fixme:" stderr log messages
        spawnOptions.env.WINEDEBUG = '-all';
    }
    try {
        const child = (0, child_process_1.spawnSync)(rcedit, args, spawnOptions);
        const result = (_a = child.output) === null || _a === void 0 ? void 0 : _a.toString().split(',wine: ')[0];
        return result.startsWith(',') ? result.substr(1) : result;
    }
    catch {
        return undefined;
    }
}
exports.getVersionString = getVersionString;
//# sourceMappingURL=rceditGet.js.map