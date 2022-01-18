import { BrowserWindow, OpenExternalOptions } from 'electron';
export declare const INJECT_DIR: string;
/**
 * Helper to print debug messages from the main process in the browser window
 */
export declare function debugLog(browserWindow: BrowserWindow, message: string): void;
export declare function getAppIcon(): string | undefined;
export declare function getCounterValue(title: string): string | undefined;
export declare function getCSSToInject(): string;
export declare function isOSX(): boolean;
export declare function isLinux(): boolean;
export declare function isWindows(): boolean;
export declare function linkIsInternal(currentUrl: string, newUrl: string, internalUrlRegex: string | RegExp | undefined): boolean;
export declare function nativeTabsSupported(): boolean;
export declare function openExternal(url: string, options?: OpenExternalOptions): Promise<void>;
export declare function removeUserAgentSpecifics(userAgentFallback: string, appName: string, appVersion: string): string;
