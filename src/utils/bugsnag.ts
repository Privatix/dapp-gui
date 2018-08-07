import bugsnag from 'bugsnag-js';
import * as api from './api';

const bugsnag_handler = (window, apiKey, release) => {
    const bugsnagClient = bugsnag(
        {
            apiKey:apiKey,
            autoNotify: false
        });

    if (window.onerror) {
        window.addEventListener('error', async function(ErrorEvent:any) {
            const accounts = await api.accounts.getAccounts();
            bugsnagClient.metaData = {
                accounts: accounts,
                release: release
            };

            bugsnagClient.notify(ErrorEvent.error);
        });

    }
};

export const registerBugsnag = bugsnag_handler;
