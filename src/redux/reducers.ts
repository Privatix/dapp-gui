import {actions} from './actions';
import { State, StateDefault } from '../typings/state';
import * as Redux from 'redux';
interface Action extends Redux.Action {
    value? : any;
}

const _ = Object;

interface Reducers {
    // must be enum instead of number
    [key: number]: Function;
}

export default function reducer(state: State = StateDefault, action: Action = {type: 'NONE'}) {

    const handlers: Reducers = {
        [actions.REFRESH_ACCOUNTS]       : (state: State, action: Action) => _.assign({}, state, {accounts: action.value})
       ,[actions.SET_MODE]               : (state: State, action: Action) => _.assign({}, state, {mode: action.value})
    };

    return handlers.hasOwnProperty(action.type) ? handlers[action.type](state, action) : state;
}
