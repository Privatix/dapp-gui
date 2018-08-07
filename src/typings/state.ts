import {Account} from './accounts';
import {Mode} from './mode';
import {Product} from './products';
import {DbSetting} from './settings';

interface State {
  [s: string]: any;
    accounts: Account[];
    products: Product[];
    settings: DbSetting[];
    mode: Mode;
}

const StateDefault: State = {
    accounts: [],
    products: [],
    settings: [],
    mode: Mode.CLIENT
};

export {
    State, StateDefault
};
