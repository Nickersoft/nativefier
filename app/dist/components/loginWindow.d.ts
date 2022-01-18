import { BrowserWindow } from 'electron';
export declare function createLoginWindow(loginCallback: (username?: string, password?: string) => void, parent?: BrowserWindow): Promise<BrowserWindow>;
