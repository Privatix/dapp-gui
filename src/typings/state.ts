import {Account} from './accounts';
import {Mode} from './mode';

interface State {
  [s: string]: any;
    accounts: Account[];
}

const StateDefault: State = {
   accounts: []
  ,mode: Mode.CLIENT
};

export {
    State, StateDefault
};
