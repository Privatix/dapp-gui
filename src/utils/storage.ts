import * as api from './api';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import {valid, gt } from 'semver';

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

const checkVersion = function(releases: any, currentRelease: string, target: string){
    const versions = Object.keys(releases);
    if(!versions.length){
        return currentRelease;
    }

    const max = versions.reduce((max, version) => {
        if(!valid(version)){
           return max;
        }
        if(!gt(version, max)){
           return max;
        }
        if(!('platforms' in releases[version]) || target === '' || !(target in releases[version].platforms)){
           return max;
        }
        if(!('minVersion' in releases[version].platforms[target]) || gt(releases[version].platforms[target].minVersion, max)){
            return max;
        }
        return version;
    }, currentRelease);

    return max;
};


api.on('releases', async function(event: any, data: any){
    await ws.whenAuthorized();
    const guiSettings = await ws.getGUISettings();
    const settings = await ws.getLocal();
    const latestReleaseChecked = checkVersion(data, settings.release, settings.target);
    if(!gt(latestReleaseChecked, settings.release)
       || ((guiSettings as any).latestReleaseChecked
           && !gt(latestReleaseChecked, (guiSettings as any).latestReleaseChecked.version)
          )
    ){
        return;
    }

    const updated = Object.assign({}, guiSettings, {latestReleaseChecked: data[latestReleaseChecked]});
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
