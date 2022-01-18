/// <reference types="node" />
import { EventEmitter } from 'events';
declare class MockBrowserWindow extends EventEmitter {
    webContents: MockWebContents;
    constructor(options?: unknown);
    addTabbedWindow(tab: MockBrowserWindow): void;
    focus(): void;
    static fromWebContents(webContents: MockWebContents): MockBrowserWindow;
    static getFocusedWindow(window: MockBrowserWindow): MockBrowserWindow;
    isSimpleFullScreen(): boolean;
    isFullScreen(): boolean;
    isFullScreenable(): boolean;
    loadURL(url: string, options?: unknown): Promise<void>;
    setFullScreen(flag: boolean): void;
    setSimpleFullScreen(flag: boolean): void;
}
declare class MockDialog {
    static showMessageBox(browserWindow: MockBrowserWindow, options: unknown): Promise<number>;
    static showMessageBoxSync(browserWindow: MockBrowserWindow, options: unknown): number;
}
declare class MockSession extends EventEmitter {
    webRequest: MockWebRequest;
    constructor();
    clearCache(): Promise<void>;
    clearStorageData(): Promise<void>;
}
declare class MockWebContents extends EventEmitter {
    session: MockSession;
    constructor();
    getURL(): string;
    insertCSS(css: string, options?: unknown): Promise<string>;
}
declare class MockWebRequest {
    emitter: InternalEmitter;
    constructor();
    onResponseStarted(filter: unknown, listener: ((details: unknown) => void) | null): void;
    send(event: string, ...args: unknown[]): void;
}
declare class InternalEmitter extends EventEmitter {
}
export { MockDialog as dialog, MockBrowserWindow as BrowserWindow, MockSession as Session, MockWebContents as WebContents, MockWebRequest as WebRequest, };
