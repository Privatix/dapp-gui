import { Role, Mode } from './mode';

export interface GasConsumption {
    defaultGasPrice: number;
    maxPossibleGasPrice: number;
    acceptOffering: number;
    createOffering: number;
    transfer: number;
    returnBalance: number;
    increaseDeposit: number;
    removeOffering: number;
    popupOffering: number;
    terminateContract: number;
    transactionIncreaseCoefficient: number;
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
    paging: {
        logs: number;
        jobs: number;
        transactions: number;
        offerings: number;
    }
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
        delayBetweenTransferTokensAndUpdateBalance: number;
    },
    log: {
        level: string;
        console: boolean;
        file: boolean;
        fileName: string;
        filePath: string;
        fileOverwrite: boolean;
    },
    rootpath: string;
}

export interface DbSetting {
    key: string;
    value: string;
    description: string;
    name: string;
}
