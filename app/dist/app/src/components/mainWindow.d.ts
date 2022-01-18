import { BrowserWindow } from 'electron';
import { OutputOptions } from '../../../shared/src/options/model';
export declare const APP_ARGS_FILE_PATH: string;
/**
 * @param {{}} nativefierOptions AppArgs from nativefier.json
 * @param {function} setDockBadge
 */
export declare function createMainWindow(nativefierOptions: OutputOptions, setDockBadge: (value: number | string, bounce?: boolean) => void): Promise<BrowserWindow>;
export declare function saveAppArgs(newAppArgs: OutputOptions): void;
