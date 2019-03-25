import {Account} from './accounts';
import {Role} from './mode';
import {Product} from './products';
import {OfferingAvailabilityResponse} from './offerings';
import {LocalSettings} from './settings';
import { WS } from '../utils/ws';

interface State {
  [s: string]: any;
    accounts: Account[];
    products: Product[];
    settings: {[key: string]: string};
    localSettings: LocalSettings;
    channel: string;
    mode: Role;
    advancedMode: boolean;
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
    settings: {},
    localSettings: null,
    channel: '',
    mode: Role.CLIENT,
    advancedMode: false,
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
