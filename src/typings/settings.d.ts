export interface GasConsumption {
    acceptOffering: number;
    createOffering: number;
    transfer: number;
    increaseDeposit: number;
}

export interface LocalSettings {
    firstStart: boolean;
    accountCreated: boolean;
    wsEndpoint: string;
    gas: GasConsumption;
    network: string;
    bugsnag: {
        userid: string;
        key: string;
        enable: boolean;
    };
    commit: string;
    logsCountPerPage: number;
    elementsPerPage: number;
    lang: string;
    release: string;
    releasesEndpoint: string;
    platformsEndpoint: string;
    releases: {[key:string]: any};
    updateCheckFreq: number;
    collectLogsPath: {
        utils: {
            linux: string,
            macOs: string
        },
        archives: {
            linux: string,
            macOs: string
        }
    };
}

export interface DbSetting {
    key: string;
    value: string;
    description: string;
    name: string;
}
