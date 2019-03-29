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
        [actions.REFRESH_ACCOUNTS]              : (state: State, action: Action) => _.assign({}, state, {accounts: action.value}),
        [actions.UPDATE_PRODUCTS]               : (state: State, action: Action) => _.assign({}, state, {products: action.value}),
        [actions.UPDATE_SERVICE_NAME]           : (state: State, action: Action) => _.assign({}, state, {serviceName: action.value}),
        [actions.UPDATE_SETTINGS]               : (state: State, action: Action) => _.assign({}, state, {settings: action.value}),
        [actions.UPDATE_LOCAL_SETTINGS]         : (state: State, action: Action) => _.assign({}, state, {localSettings: action.value}),
        [actions.UPDATE_TOTAL_INCOME]           : (state: State, action: Action) => _.assign({}, state, {totalIncome: action.value}),
        [actions.SET_MODE]                      : (state: State, action: Action) => _.assign({}, state, {mode: action.value}),
        [actions.SET_ADVANCED_MODE]             : (state: State, action: Action) => _.assign({}, state, {advancedMode: action.value}),
        [actions.SET_CHANNEL]                   : (state: State, action: Action) => _.assign({}, state, {channel: action.value}),
        [actions.SET_WS]                        : (state: State, action: Action) => _.assign({}, state, {ws: action.value}),
        [actions.SET_OFFERINGS_AVAILABILITY]    : (state: State, action: Action) => _.assign({}, state, {offeringsAvailability: Object.assign({}, {counter: state.offeringsAvailability.counter - action.value.length}, {statuses: (Object.assign({}, state.offeringsAvailability.statuses, ...action.value))})}),
        [actions.INCREMENT_OFFERINGS_AVAILABILITY_COUNTER] : (state: State, action: Action) => _.assign({}, state, {offeringsAvailability: Object.assign({}, {counter: state.offeringsAvailability.counter + action.value, statuses: state.offeringsAvailability.statuses})})
    };

    return handlers.hasOwnProperty(action.type) ? handlers[action.type](state, action) : state;
}
