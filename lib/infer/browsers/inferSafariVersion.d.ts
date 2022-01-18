export declare type SafariVersion = {
    majorVersion: number;
    version: string;
    webkitVersion: string;
};
export declare function getLatestSafariVersion(url?: string): Promise<SafariVersion>;
