import {Account} from './accounts';
import {Role} from './mode';
import {Product} from './products';
import {OfferingAvailabilityResponse} from './offerings';
import {DbSetting, LocalSettings} from './settings';
import { WS } from '../utils/ws';

interface State {
  [s: string]: any;
    accounts: Account[];
    products: Product[];
    settings: DbSetting[];
    localSettings: LocalSettings;
    channel: string;
    mode: Role;
    ws: WS;
    totalIncome: number;
    offeringsAvailability: {
        counter: number;
        statuses: OfferingAvailabilityResponse;
    };
    releases: any[];
}

const StateDefault: State = {
    accounts: [],
    products: [],
    settings: [],
    localSettings: null,
    channel: '',
    mode: Role.CLIENT,
    ws: null,
    totalIncome: 0,
    offeringsAvailability: {
        counter: 0,
        statuses: {}
    },
    releases: []
};

export {
    State, StateDefault
};
