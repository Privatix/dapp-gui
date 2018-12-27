import {LocalSettings} from 'typings/settings';
import bugsnag from 'bugsnag-js';

import * as api from 'utils/api';
import { WS } from 'utils/ws';

export const registerBugsnagHandler = async (window, apiKey, release, commit, userId, ws?) => {
    // if we have release tag, this is Production environment, else Development
    const commitTrimmed = commit.substring(0, 7);
    let appVersion = 'undefined (' + commitTrimmed + ')';
    let releaseStage = 'development';
    if (release !== '') {
        appVersion = release + ' (' + commitTrimmed + ')';
        releaseStage = 'production';
    }

    const bugsnagClient = bugsnag({
        apiKey: apiKey,
        autoNotify: false,
        appVersion,
        releaseStage,
    });

    if(ws){
        const role = await ws.getUserRole();
        bugsnagClient.user = {
            id: userId,
            role
        };
    }else{
        bugsnagClient.user = {
            id: userId
        };
    }

    if (window.onerror) {

        if((window as any).bugsnagListener){
            window.removeEventListener('error', (window as any).bugsnagListener);
        }

        (window as any).bugsnagListener = async function(ErrorEvent:any) {

            if(ws){
                const accounts = await ws.getAccounts();
                const accountsAddrs = accounts.map((account) => {
                    return '0x' + account.ethAddr;
                });

                bugsnagClient.metaData = {
                    accounts: accountsAddrs
                };
            }

            bugsnagClient.notify(ErrorEvent.error);
        };

        window.addEventListener('error', (window as any).bugsnagListener);

    }
};

export const registerBugsnag = async function(ws?: WS){

    const settings = (await api.settings.getLocal()) as LocalSettings;
    if (settings.bugsnag.enable) {
        await registerBugsnagHandler(window, settings.bugsnag.key, settings.release, settings.commit, settings.bugsnag.userid, ws);
    }
};
