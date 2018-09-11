export interface GasConsumption {
    acceptOffering: number;
    createOffering: number;
    transfer: number;
}

export interface LocalSettings {
    firstStart: boolean;
    accountCreated: boolean;
    apiEndpoint: string;
    wsEndpoint: string;
    gas: GasConsumption;
    network: string;
    bugsnagKey: string;
    bugsnagEnable: boolean;
    release: string;
    logsCountPerPage: number;
    lang: string;
}

export interface DbSetting {
    key: string;
    value: string;
    description: string;
    name: string;
}
