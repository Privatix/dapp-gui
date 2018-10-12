import bugsnag from 'bugsnag-js';

const bugsnag_handler = (window, apiKey, release, commit) => {
    // if we have release tag, this is Production environment, else Development
    let appVersion = commit;
    let releaseStage = 'development';
    if (release !== '') {
        appVersion = release;
        releaseStage = 'production';
    }

    const bugsnagClient = bugsnag({
        apiKey: apiKey,
        autoNotify: false,
        appVersion,
        releaseStage
    });

    if (window.onerror) {
        window.addEventListener('error', async function(ErrorEvent:any) {
            const accounts = await (window as any).ws.getAccounts();
            bugsnagClient.metaData = {
                accounts: accounts
            };

            bugsnagClient.notify(ErrorEvent.error);
        });

    }
};

export const registerBugsnag = bugsnag_handler;
