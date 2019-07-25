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
<<<<<<< HEAD
        delayBetweenTransferTokensAndUpdateBalance: number;
    }
=======
    },
    log: {
        level: string;
        console: boolean;
        file: boolean;
        fileName: string;
    },
    rootpath: string;
>>>>>>> 1aeb38fc64c065e36f7b870e623fe242282723d1
}

export interface DbSetting {
    key: string;
    value: string;
    description: string;
    name: string;
}
