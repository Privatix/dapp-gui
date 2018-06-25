export interface GasConsumption {
    acceptOffering: number;
}

export interface LocalSettings {
    firstStart: boolean;
    accountCreated: boolean;
    apiEndpoint: string;
    gas: GasConsumtion;
}

export interface DbSetting {
    key: string;
    value: string;
    description: string;
    name: string;
}
