import { WS } from 'utils/ws';

import {Account} from './accounts';
import {Role, Mode} from './mode';
import {Product} from './products';
import {OfferingAvailabilityResponse} from './offerings';
import {LocalSettings} from './settings';

interface State {
  [s: string]: any;
    accounts: Account[];
    products: Product[];
    serviceName: string;
    settings: {[key: string]: string};
    localSettings: LocalSettings;
    channel: string;
    role: Role;
    mode: Mode;
    ws: WS;
    totalIncome: number;
    offeringsAvailability: {
        counter: number;
        statuses: OfferingAvailabilityResponse;
    };
}

const StateDefault: State = {
    accounts: [],
    products: [],
    serviceName: '',
    settings: {},
    localSettings: null,
    channel: '',
    role: null,
    mode: null,
    ws: null,
    totalIncome: 0,
    offeringsAvailability: {
        counter: 0,
        statuses: {}
    },
};

export {
    State, StateDefault
};
