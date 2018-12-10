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
    },
    release: string;
    commit: string;
    logsCountPerPage: number;
    elementsPerPage: number;
    lang: string;
}

export interface DbSetting {
    key: string;
    value: string;
    description: string;
    name: string;
}
