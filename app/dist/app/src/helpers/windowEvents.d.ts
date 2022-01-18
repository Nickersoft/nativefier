import { BrowserWindow, Event, NewWindowWebContentsEvent, WebContents } from 'electron';
import { WindowOptions } from '../../../shared/src/options/model';
export declare function onNewWindow(options: WindowOptions, setupWindow: (options: WindowOptions, window: BrowserWindow) => void, event: NewWindowWebContentsEvent, urlToGo: string, frameName: string, disposition: 'default' | 'foreground-tab' | 'background-tab' | 'new-window' | 'save-to-disk' | 'other', parent?: BrowserWindow): Promise<void>;
export declare function onNewWindowHelper(options: WindowOptions, setupWindow: (options: WindowOptions, window: BrowserWindow) => void, urlToGo: string, disposition: string | undefined, preventDefault: (newGuest?: BrowserWindow) => void, parent?: BrowserWindow): Promise<void>;
export declare function onWillNavigate(options: WindowOptions, event: Event, urlToGo: string): Promise<void>;
export declare function onWillPreventUnload(event: Event & {
    sender?: WebContents;
}): void;
export declare function setupNativefierWindow(options: WindowOptions, window: BrowserWindow): void;
