import * as api from './api';

import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import reducers from 'redux/reducers';
import { asyncProviders } from 'redux/actions';

import { Role } from 'typings/mode';

const storage = createStore(reducers, applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
  ));

api.on('announcement', function(event: any, data: any){
    console.log('ANNOUNCE!!!', data);
});

const refresh = function(){

    const { ws, mode } = storage.getState();

    if(ws){
        storage.dispatch(asyncProviders.updateAccounts());
        storage.dispatch(asyncProviders.updateProducts());
        if(mode === Role.AGENT){
            storage.dispatch(asyncProviders.updateTotalIncome());
        }

        setTimeout(refresh, 3000);
    }else{
        setTimeout(refresh, 1000);
    }
};

refresh();

export const store = storage;
