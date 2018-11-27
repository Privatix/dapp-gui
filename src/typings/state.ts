import {Account} from './accounts';
import {Role} from './mode';
import {Product} from './products';
import {DbSetting} from './settings';
import { WS } from '../utils/ws';

interface State {
  [s: string]: any;
    accounts: Account[];
    products: Product[];
    settings: DbSetting[];
    channel: string;
    mode: Role;
    ws: WS;
}

const StateDefault: State = {
    accounts: [],
    products: [],
    settings: [],
    channel: '',
    mode: Role.CLIENT,
    ws: null
};

export {
    State, StateDefault
};
