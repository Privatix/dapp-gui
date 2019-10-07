import * as log from 'electron-log';

import { createStore, applyMiddleware, AnyAction } from 'redux';
import { default as thunk, ThunkMiddleware } from 'redux-thunk';
import reducers from 'redux/reducers';
import { asyncProviders, default as handlers } from 'redux/actions';

import {valid as isValid, gt } from 'semver';

import i18n from 'i18next/init';

import * as api from 'utils/api';
import stopSupervisor from 'utils/stopSupervisor';
import { WS } from 'utils/ws';
import initElectronMenu from 'utils/electronMenu';

import setupLog from './workers/log';
import subscribeAccounts from './workers/accounts';

import Channel from 'models/channel';
import Offerings from 'models/offerings';

import { Role, Mode } from 'typings/mode';
import { State } from 'typings/state';

const localCache = window.localStorage.getItem('localSettings');

if(!localCache){
    window.localStorage.setItem('localSettings', JSON.stringify({firstStart: true, accountCreated: false, lang: 'en', supervisorEndpoint: 'http://localhost:7777'}));
}


export const createStorage = () => {
    const storage = createStore(reducers, applyMiddleware(
        thunk as ThunkMiddleware<State, AnyAction> // lets us dispatch() functions
      ));

    storage.dispatch(handlers.setI18N(i18n));

    const ws = new WS(log);

    (async () => {

        const localSettings = await api.settings.getLocal();

        i18n.changeLanguage(localSettings.lang);
        initElectronMenu(storage);

        storage.dispatch(handlers.setWS(ws));
        storage.dispatch(handlers.setLOG(log));

        setupLog(log, localSettings);
        subscribeAccounts(storage, localSettings);

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
        log.log(event, data);
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

    api.on('exit', async () => {

        const { ws, role } = storage.getState();
        if(role === Role.CLIENT){
            log.log(ws, ws.passwordIsEntered);
            if(ws && ws.passwordIsEntered){
                await ws.whenAuthorized();
                const channels = await ws.getClientChannels([], ['active', 'activating', 'pending'], 0, 0);

                if(channels.items.length){
                    storage.dispatch(handlers.setExit(true));
                }else{
                    storage.dispatch(handlers.setStoppingSupervisor(true));
                    await stopSupervisor();
                    api.exit();
                }
            }else{
                storage.dispatch(handlers.setStoppingSupervisor(true));
                await stopSupervisor();
                api.exit();
            }
        }else{
            api.exit();
        }
    });


    const refresh = async function(){

        const { ws, role, serviceName, channel, offerings } = storage.getState();

        if(ws) {
            if(role === Role.CLIENT){
                if(!channel){
                    const channel = new Channel(ws);
                    storage.dispatch(handlers.setChannel(channel));
                }
            }
            await ws.whenAuthorized();

            if(role === Role.AGENT){
                storage.dispatch(asyncProviders.updateProducts());
                storage.dispatch(asyncProviders.updateTotalIncome());
            }
            if(role === Role.CLIENT){
                if(!offerings){
                    const offerings = new Offerings(ws);
                    offerings.init();
                    storage.dispatch(handlers.setOfferings(offerings));
                }
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
        const { role } = await api.settings.getLocal();
        if(role === Role.CLIENT){
            api.smartExit(true);
        }
    })();
    return storage;
};
