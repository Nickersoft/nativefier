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
exports.getOptionsFromExecutable = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const log = __importStar(require("loglevel"));
const rceditGet_1 = require("./rceditGet");
const fsHelpers_1 = require("../fsHelpers");
function getExecutableBytes(executablePath) {
    return fs.readFileSync(executablePath);
}
function getExecutableArch(exeBytes, platform) {
    switch (platform) {
        case 'linux':
            // https://en.wikipedia.org/wiki/Executable_and_Linkable_Format#File_header
            switch (exeBytes[0x12]) {
                case 0x03:
                    return 'ia32';
                case 0x28:
                    return 'armv7l';
                case 0x3e:
                    return 'x64';
                case 0xb7:
                    return 'arm64';
                default:
                    return undefined;
            }
        case 'darwin':
        case 'mas':
            // https://opensource.apple.com/source/xnu/xnu-2050.18.24/EXTERNAL_HEADERS/mach-o/loader.h
            switch ((exeBytes[0x04] << 8) + exeBytes[0x05]) {
                case 0x0700:
                    return 'x64';
                case 0x0c00:
                    return 'arm64';
                default:
                    return undefined;
            }
        case 'win32':
            // https://en.wikibooks.org/wiki/X86_Disassembly/Windows_Executable_Files#COFF_Header
            switch ((exeBytes[0x7d] << 8) + exeBytes[0x7c]) {
                case 0x014c:
                    return 'ia32';
                case 0x8664:
                    return 'x64';
                case 0xaa64:
                    return 'arm64';
                default:
                    return undefined;
            }
        default:
            return undefined;
    }
}
function getExecutableInfo(executablePath, platform) {
    if (!(0, fsHelpers_1.fileExists)(executablePath)) {
        return undefined;
    }
    const exeBytes = getExecutableBytes(executablePath);
    return {
        arch: getExecutableArch(exeBytes, platform),
    };
}
function getOptionsFromExecutable(appResourcesDir, priorOptions) {
    const newOptions = { ...priorOptions };
    if (!newOptions.name) {
        throw new Error('Can not extract options from executable with no name specified.');
    }
    const name = newOptions.name;
    let executablePath = undefined;
    const appRoot = path.resolve(path.join(appResourcesDir, '..', '..'));
    const children = fs.readdirSync(appRoot, { withFileTypes: true });
    const looksLikeMacOS = children.filter((c) => c.name === 'MacOS' && c.isDirectory()).length > 0;
    const looksLikeWindows = children.filter((c) => c.name.toLowerCase().endsWith('.exe') && c.isFile())
        .length > 0;
    const looksLikeLinux = children.filter((c) => c.name.toLowerCase().endsWith('.so') && c.isFile())
        .length > 0;
    if (looksLikeMacOS) {
        log.debug('This looks like a MacOS app...');
        if (newOptions.platform === undefined) {
            newOptions.platform =
                children.filter((c) => c.name === 'Library' && c.isDirectory()).length >
                    0
                    ? 'mas'
                    : 'darwin';
        }
        executablePath = path.join(appRoot, 'MacOS', fs.readdirSync(path.join(appRoot, 'MacOS'))[0]);
    }
    else if (looksLikeWindows) {
        log.debug('This looks like a Windows app...');
        if (newOptions.platform === undefined) {
            newOptions.platform = 'win32';
        }
        executablePath = path.join(appRoot, children.filter((c) => c.name.toLowerCase() === `${name.toLowerCase()}.exe` && c.isFile())[0].name);
        if (newOptions.appVersion === undefined) {
            // https://github.com/electron/electron-packager/blob/f1c159f4c844d807968078ea504fba40ca7d9c73/src/win32.js#L46-L48
            newOptions.appVersion = (0, rceditGet_1.getVersionString)(executablePath, 'ProductVersion');
            log.debug(`Extracted app version from executable: ${newOptions.appVersion}`);
        }
        if (newOptions.buildVersion === undefined) {
            //https://github.com/electron/electron-packager/blob/f1c159f4c844d807968078ea504fba40ca7d9c73/src/win32.js#L50-L52
            newOptions.buildVersion = (0, rceditGet_1.getVersionString)(executablePath, 'FileVersion');
            if (newOptions.appVersion == newOptions.buildVersion) {
                newOptions.buildVersion = undefined;
            }
            else {
                log.debug(`Extracted build version from executable: ${newOptions.buildVersion}`);
            }
        }
        if (newOptions.appCopyright === undefined) {
            // https://github.com/electron/electron-packager/blob/f1c159f4c844d807968078ea504fba40ca7d9c73/src/win32.js#L54-L56
            newOptions.appCopyright = (0, rceditGet_1.getVersionString)(executablePath, 'LegalCopyright');
            log.debug(`Extracted app copyright from executable: ${newOptions.appCopyright}`);
        }
    }
    else if (looksLikeLinux) {
        log.debug('This looks like a Linux app...');
        if (newOptions.platform === undefined) {
            newOptions.platform = 'linux';
        }
        executablePath = path.join(appRoot, children.filter((c) => c.name == name && c.isFile())[0].name);
    }
    if (!executablePath || !newOptions.platform) {
        throw Error(`Could not find executablePath or platform of app in ${appRoot}`);
    }
    log.debug(`Executable path: ${executablePath}`);
    if (newOptions.arch === undefined) {
        const executableInfo = getExecutableInfo(executablePath, newOptions.platform);
        if (!executableInfo) {
            throw new Error(`Could not get executable info for executable path: ${executablePath}`);
        }
        newOptions.arch = executableInfo.arch;
        log.debug(`Extracted arch from executable: ${newOptions.arch}`);
    }
    if (newOptions.platform === undefined || newOptions.arch == undefined) {
        throw Error(`Could not determine platform / arch of app in ${appRoot}`);
    }
    return newOptions;
}
exports.getOptionsFromExecutable = getOptionsFromExecutable;
//# sourceMappingURL=executableHelpers.js.map