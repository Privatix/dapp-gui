export interface GasConsumption {
    acceptOffering: number;
    createOffering: number;
    transfer: number;
}

export interface LocalSettings {
    firstStart: boolean;
    accountCreated: boolean;
    apiEndpoint: string;
    gas: GasConsumption;
}

export interface DbSetting {
    key: string;
    value: string;
    description: string;
    name: string;
}
