import bugsnag from 'bugsnag-js';

const bugsnag_handler = (window, apiKey, release, commit) => {
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
        releaseStage
    });

    if (window.onerror) {
        window.addEventListener('error', async function(ErrorEvent:any) {
            const accounts = await (window as any).ws.getAccounts();
            const accountsAddrs = accounts.map((account) => {
                return '0x' + account.ethAddr;
            });

            bugsnagClient.metaData = {
                accounts: accountsAddrs
            };

            bugsnagClient.notify(ErrorEvent.error);
        });

    }
};

export const registerBugsnag = bugsnag_handler;
