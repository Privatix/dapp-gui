import * as api from './api';
import { createStore, applyMiddleware, AnyAction } from 'redux';
import { default as thunk, ThunkMiddleware } from 'redux-thunk';
import {valid as isValid, gt } from 'semver';

import reducers from 'redux/reducers';
import { asyncProviders, default as handlers } from 'redux/actions';

import stopSupervisor from 'utils/stopSupervisor';

import { WS } from 'utils/ws';
import { Role, Mode } from 'typings/mode';
import { State } from 'typings/state';
import * as log from 'electron-log';


const localCache = window.localStorage.getItem('localSettings');
if(!localCache){
    window.localStorage.setItem('localSettings', JSON.stringify({firstStart: true, accountCreated: false, lang: 'en', supervisorEndpoint: 'http://localhost:7777'}));
}

export const createStorage = () => {
    const storage = createStore(reducers, applyMiddleware(
        thunk as ThunkMiddleware<State, AnyAction> // lets us dispatch() functions
      ));
    
    const ws = new WS(log);
    storage.dispatch(handlers.setWS(ws));
    storage.dispatch(handlers.setLOG(log));

    (async () => {
        const settings = await api.settings.getLocal();
        log.transports.file.level = false;
        log.transports.console.level = false;
        log.transports.mainConsole.level = false;
        log.transports.remote.level = false;
        if (settings.log && settings.log.file){
            const path = (!settings.log.filePath?settings.rootpath:settings.log.filePath);
            log.transports.file.level = settings.log.level as log.ILevelOption;
            log.transports.file.file = `${path}/${settings.log.fileName}`;
            if (settings.log.fileOverwrite){
                log.transports.file.clear();
            }
        }
        if (settings.log && settings.log.console){
            log.transports.console.level = settings.log.level as log.ILevelOption;
            log.transports.mainConsole.level = settings.log.level as log.ILevelOption;
        }
        
    })();

    (async () => {
        await ws.whenReady();
        storage.dispatch(asyncProviders.updateLocalSettings(
            async () => {
                storage.dispatch(asyncProviders.setRole());
                const { role } = await api.settings.getLocal();
                const { firstStart, accountCreated } = await ws.getLocal();
                const localSettings = JSON.parse(window.localStorage.getItem('localSettings'));
                const mode = (firstStart || !accountCreated) ? Mode.WIZARD
                             : role === Role.AGENT ? Mode.ADVANCED : Mode.SIMPLE;
                storage.dispatch(asyncProviders.setMode(localSettings.mode ? localSettings.mode : mode));
                storage.dispatch(asyncProviders.setRole());
            }
        ));
        await ws.whenAuthorized();
        storage.dispatch(asyncProviders.updateSettings());
    })();

    const checkVersion = function(releases: any, currentRelease: string, target: string){
        if(!currentRelease){
            return '0.0.0';
        }
        const versions = Object.keys(releases);
        if(!versions.length){
            return currentRelease;
        }

        const max = versions.reduce((max, version) => {
            if(!isValid(version)){
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

        const { ws } = storage.getState();
        if(ws){
            await ws.whenAuthorized();
            const guiSettings = await ws.getGUISettings();
            const settings = await ws.getLocal();

            if(settings.release && isValid(settings.release)){
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
            }
        }
    });

    api.on('exit', async ()=>{

        const { ws, role } = storage.getState();
        if(role === Role.CLIENT){
            const channels = await ws.getClientChannels([], ['active', 'activating', 'pending'], 0, 0);

            if(channels.items.length){
                storage.dispatch(handlers.setExit(true));
            }else{
                await stopSupervisor();
                api.exit();
            }
        }else{
            api.exit();
        }

    });

    const refreshAccounts = function(){
        storage.dispatch(asyncProviders.updateAccounts());
    };

    const subscribeAccounts = (async () => {

        const { ws } = storage.getState();

        if(ws) {
            await ws.whenAuthorized();
            refreshAccounts();
            ws.subscribe('account', ['afterAccountAddBalanceApprove', 'afterAccountAddBalance', 'accountUpdateBalances'], refreshAccounts, refreshAccounts);
        }else{
            setTimeout(subscribeAccounts, 1000);
        }
    });

    subscribeAccounts();

    const refresh = async function(){

        const { ws, role, serviceName } = storage.getState();

        if(ws) {

            await ws.whenAuthorized();

            if(role === Role.AGENT){
                storage.dispatch(asyncProviders.updateProducts());
                storage.dispatch(asyncProviders.updateTotalIncome());
            }
            if(role === Role.CLIENT){
                storage.dispatch(asyncProviders.observeChannel());
            }

            if(serviceName === ''){
                storage.dispatch(asyncProviders.updateServiceName());
            }

            setTimeout(refresh, 3000);

        }else{
            setTimeout(refresh, 1000);
        }
    };

    refresh();

    (async () => {
        const { role, timings } = await api.settings.getLocal();
        if(role === Role.CLIENT){
            api.smartExit(true);
        }
        const updateBalances = async () => {
            const { ws } = storage.getState();

            if(ws) {

                await ws.whenAuthorized();
                const accounts = await ws.getAccounts();
                accounts.forEach(account => ws.updateBalance(account.id));
            }
            setTimeout(updateBalances, timings.updateBalances);
        };

        updateBalances();
    })();
    return storage;
};
