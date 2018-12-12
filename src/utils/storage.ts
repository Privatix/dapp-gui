import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import reducers from 'redux/reducers';
import { asyncProviders } from 'redux/actions';

import { Role } from 'typings/mode';

const storage = createStore(reducers, applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
  ));

const refresh = function(){

    const { ws, mode } = storage.getState();

    if(ws){
        storage.dispatch(asyncProviders.updateAccounts());
        storage.dispatch(asyncProviders.updateProducts());
        if(mode === Role.AGENT){
            storage.dispatch(asyncProviders.updateTotalIncome());
        }
    }

    setTimeout(refresh, 3000);
};

refresh();

export const store = storage;
