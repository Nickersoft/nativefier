/// <reference types="node" />
export declare type DownloadResult = {
    data: Buffer;
    ext: string;
};
declare type ProcessEnvs = Record<string, unknown>;
export declare function hasWine(): boolean;
export declare function isOSX(): boolean;
export declare function isWindows(): boolean;
export declare function isWindowsAdmin(): boolean;
/**
 * Create a temp directory with a debug-friendly name, and return its path.
 * Will be automatically deleted on exit.
 */
export declare function getTempDir(prefix: string, mode?: number): string;
export declare function downloadFile(fileUrl: string): Promise<DownloadResult | undefined>;
export declare function getAllowedIconFormats(platform: string): string[];
/**
 * Refuse args like '--n' or '-name', we accept either short '-n' or long '--name'
 */
export declare function isArgFormatInvalid(arg: string): boolean;
export declare function generateRandomSuffix(length?: number): string;
export declare function getProcessEnvs(val: string): ProcessEnvs | undefined;
export declare function checkInternet(): void;
export {};
