import * as api from './api';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import reducers from 'redux/reducers';
import { asyncProviders, default as handlers } from 'redux/actions';

import { WS } from 'utils/ws';

import { Role } from 'typings/mode';

const localCache = window.localStorage.getItem('localSettings');
if(!localCache){
    window.localStorage.setItem('localSettings', JSON.stringify({firstStart: true, accountCreated: false, lang: 'en'}));
}

const storage = createStore(reducers, applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
  ));

const ws = new WS();
storage.dispatch(handlers.setWS(ws));
storage.dispatch(asyncProviders.updateLocalSettings());

api.on('releases', async function(event: any, data: any){
    const guiSettings = await ws.getGUISettings();
    const updated = Object.assign({}, guiSettings, {releases: Object.assign({}, (guiSettings as any).releases, data)});
    await ws.setGUISettings(updated);
});

const refresh = function(){

    const { ws, mode } = storage.getState();

    if(ws) {
        storage.dispatch(asyncProviders.updateLocalSettings());
    }

    if(ws && ws.authorized){
        storage.dispatch(asyncProviders.updateAccounts());
        storage.dispatch(asyncProviders.updateProducts());
        storage.dispatch(asyncProviders.updateSettings());

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
