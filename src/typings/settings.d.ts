export enum Mode {
    agent = 'agent', client = 'client'
}

export interface LocalSettings {
    firstStart: boolean;
    accountCreated: boolean;
    apiEndpoint: string;
    mode: Mode;
}
