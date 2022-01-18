import { AppOptions } from '../../shared/src/options/model';
/**
 * Takes the options object and infers new values needing async work
 */
export declare function asyncConfig(options: AppOptions): Promise<AppOptions>;
