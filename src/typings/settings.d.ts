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
    target: string;
    releasesEndpoint: string;
    platformsEndpoint: string;
    latestReleaseChecked: any;
    updateCheckFreq: number;
    widndow: {
        advancedMode: {
            width: number;
            height: number;
        }
        simpleMode: {
            width: number;
            height: number;
        }
    }
}

export interface DbSetting {
    key: string;
    value: string;
    description: string;
    name: string;
}
