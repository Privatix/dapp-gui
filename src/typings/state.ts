import { WS } from 'utils/ws';

import { Account } from './accounts';
import { Role, Mode } from './mode';
import { Product } from './products';
import { Notice } from 'utils/notice';

import { OfferingAvailabilityResponse } from './offerings';
import { LocalSettings } from './settings';
import { ClientChannel } from './channels';

interface State {
    accounts: Account[];
    products: Product[];
    serviceName: string;
    settings: {[key: string]: string};
    localSettings: LocalSettings;
    channel: ClientChannel;
    role: Role;
    mode: Mode;
    ws: WS;
    totalIncome: number;
    offeringsAvailability: {
        counter: number;
        statuses: OfferingAvailabilityResponse;
    };
    autoTransfer: boolean;
    notices: {code: number, notice: Notice}[];
    exit: boolean;
    transfers: {address: string, amount: number}[];
    ip: string;
    channelObserverContext: {
        createChannelSubscription: string;
        channelSubscription: string;
        connected: boolean;
        ipSubscription: string;
    };
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
    totalIncome: 0,
    offeringsAvailability: {
        counter: 0,
        statuses: {}
    },
    autoTransfer: false,
    notices: [],
    exit: false,
    transfers: [],
    ip: '',
    channelObserverContext: {
        createChannelSubscription: null,
        channelSubscription: null,
        connected: null,
        ipSubscription: null
    }
};

export {
    State, StateDefault
};
