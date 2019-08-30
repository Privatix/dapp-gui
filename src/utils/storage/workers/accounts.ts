import { asyncProviders } from 'redux/actions';

const subscribe = async (storage: any, localSettings: any) => {

    console.log('LOCAL SETTINGS!!!', localSettings);
    const subscribeAccounts = async() => {

        const refreshAccounts = function(){
            storage.dispatch(asyncProviders.updateAccounts());
        }; 

        const { ws } = storage.getState();

        if(ws) {
            await ws.whenAuthorized();
            refreshAccounts();
            ws.subscribe('account', ['afterAccountAddBalanceApprove', 'afterAccountAddBalance', 'accountUpdateBalances'], refreshAccounts);
        }else{
            setTimeout(subscribeAccounts, 1000);
        }
    };

    const updateBalances = async () => {

        const { ws } = storage.getState();
        const { timings } = localSettings;
        if(ws) {
            await ws.whenAuthorized();
            const accounts = await ws.getAccounts();
            console.log('UPDATE BALANCES!!');
            accounts.forEach(account => ws.updateBalance(account.id));
        }
        setTimeout(updateBalances, timings.updateBalances);
    };

    subscribeAccounts();
    updateBalances();
};

export default subscribe;
