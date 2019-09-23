import { WS } from 'utils/ws';

import { Account } from './accounts';
import { Role, Mode } from './mode';
import { Product } from './products';
import { Notice } from 'utils/notice';

import { OfferingAvailabilityResponse } from './offerings';
import { LocalSettings } from './settings';
import Channel  from 'models/channel';

interface State {
    accounts: Account[];
    products: Product[];
    serviceName: string;
    settings: {[key: string]: string};
    localSettings: LocalSettings;
    channel: Channel;
    role: Role;
    mode: Mode;
    ws: WS;
    i18n: any;
    log: any;
    totalIncome: number;
    offeringsAvailability: {
        counter: number;
        statuses: OfferingAvailabilityResponse;
    };
    autoTransfer: boolean;
    transferring: boolean;
    notices: {code: number, notice: Notice}[];
    exit: boolean;
    showExternalLink: boolean;
    externalLink: string;
    stoppingSupervisor: boolean;
}

const StateDefault: State = {
    accounts: [],
    products: [],
    serviceName: '',
    settings: {},
    localSettings: null,
    channel: null,
    role: null,
    mode: null,
    ws: null,
    i18n: null,
    log: null,
    totalIncome: 0,
    offeringsAvailability: {
        counter: 0,
        statuses: {}
    },
    autoTransfer: false,
    transferring: false,
    notices: [],
    exit: false,
    showExternalLink: false,
    externalLink: '',
    stoppingSupervisor: false,
};

export {
    State, StateDefault
};
