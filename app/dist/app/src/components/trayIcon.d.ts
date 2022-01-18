import { Tray, BrowserWindow } from 'electron';
import { OutputOptions } from '../../../shared/src/options/model';
export declare function createTrayIcon(nativefierOptions: OutputOptions, mainWindow: BrowserWindow): Tray | undefined;
