import {Account} from './accounts';
import {Mode} from './mode';
import {Product} from './products';

interface State {
  [s: string]: any;
    accounts: Account[];
    products: Product[];
    mode: Mode;
}

const StateDefault: State = {
    accounts: [],
    products: [],
    mode: Mode.CLIENT
};

export {
    State, StateDefault
};
