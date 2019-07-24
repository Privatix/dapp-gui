import { Role, Mode } from './mode';

export interface GasConsumption {
    acceptOffering: number;
    createOffering: number;
    transfer: number;
    increaseDeposit: number;
    removeOffering: number;
    popupOffering: number;
}

export interface LocalSettings {
    firstStart: boolean;
    accountCreated: boolean;
    wsEndpoint: string;
    supervisorEndpoint: string;
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
    window: {
        [key: Mode ] : {
            width: number;
            height: number;
        }
    }
    reconnect: {
        count: number;
        delay: number;
        progression: number;
    },
    role: Role;
    timings: {
        updateBalances: number;
    }
}

export interface DbSetting {
    key: string;
    value: string;
    description: string;
    name: string;
}
