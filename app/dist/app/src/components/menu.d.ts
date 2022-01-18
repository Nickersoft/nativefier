import { BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { OutputOptions } from '../../../shared/src/options/model';
export declare function createMenu(options: OutputOptions, mainWindow: BrowserWindow): void;
export declare function generateMenu(options: {
    disableDevTools: boolean;
    nativefierVersion: string;
    zoom?: number;
}, mainWindow: BrowserWindow): MenuItemConstructorOptions[];
