export enum Mode {
    agent = 'agent', client = 'client'
}

export interface GasConsumption {
    acceptOffering: number;
    createOffering: number;
}

export interface LocalSettings {
    firstStart: boolean;
    accountCreated: boolean;
    apiEndpoint: string;
    mode: Mode;
    gas: GasConsumption;
}
