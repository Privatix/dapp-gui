import * as api from './api';

import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import reducers from 'redux/reducers';
import { asyncProviders, default as handlers } from 'redux/actions';

import { Role } from 'typings/mode';

const storage = createStore(reducers, applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
  ));

api.on('announcement', function(event: any, data: any){
    storage.dispatch(handlers.setReleases(data));
});

api.on('localSettings', function(event: any, data: any){
    storage.dispatch(handlers.updateLocalSettings(data));
});

const refresh = function(){

    const { ws, mode } = storage.getState();

    if(ws && ws.authorized){
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
