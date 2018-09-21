import {Account} from './accounts';
import {Mode} from './mode';
import {Product} from './products';
import {DbSetting} from './settings';

interface State {
  [s: string]: any;
    accounts: Account[];
    products: Product[];
    settings: DbSetting[];
    channel: string;
    mode: Mode;
}

const StateDefault: State = {
    accounts: [],
    products: [],
    settings: [],
    channel: '',
    mode: Mode.CLIENT
};

export {
    State, StateDefault
};
