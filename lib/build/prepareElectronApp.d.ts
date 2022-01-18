import { AppOptions } from '../../shared/src/options/model';
/**
 * Use a basic 6-character hash to prevent collisions. The hash is deterministic url & name,
 * so that an upgrade (same URL) of an app keeps using the same appData folder.
 * Warning! Changing this normalizing & hashing will change the way appNames are generated,
 *          changing appData folder, and users will get logged out of their apps after an upgrade.
 */
export declare function normalizeAppName(appName: string, url: string): string;
/**
 * Creates a temporary directory, copies the './app folder' inside,
 * and adds a text file with the app configuration.
 */
export declare function prepareElectronApp(src: string, dest: string, options: AppOptions): Promise<void>;
