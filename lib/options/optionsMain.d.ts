import { AppOptions, RawOptions } from '../../shared/src/options/model';
/**
 * Process and validate raw user arguments
 */
export declare function getOptions(rawOptions: RawOptions): Promise<AppOptions>;
export declare function normalizePlatform(platform: string | undefined): string;
