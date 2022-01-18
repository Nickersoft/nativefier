import { NativefierOptions, RawOptions } from '../../../shared/src/options/model';
export declare type UpgradeAppInfo = {
    appResourcesDir: string;
    appRoot: string;
    options: NativefierOptions;
};
export declare function findUpgradeApp(upgradeFrom: string): UpgradeAppInfo | null;
export declare function useOldAppOptions(rawOptions: RawOptions, oldApp: UpgradeAppInfo): RawOptions;
