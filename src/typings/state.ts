import {Account} from './accounts';
import {Mode} from './mode';
import {Product} from './products';

interface State {
  [s: string]: any;
    accounts: Account[];
    products: Product[];
}

const StateDefault: State = {
    accounts: [],
    products: [],
    mode: Mode.CLIENT
};

export {
    State, StateDefault
};
