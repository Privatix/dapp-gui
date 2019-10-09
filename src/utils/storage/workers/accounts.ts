import { asyncProviders } from 'redux/actions';

const subscribe = async (storage: any, localSettings: any) => {

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
            accounts.forEach(async account => {
                try{
                    await ws.updateBalance(account.id);
                }catch{
                    // DO NOTHING
                }
            });
        }
        setTimeout(updateBalances, timings.updateBalances);
    };

    subscribeAccounts();
    updateBalances();
};

export default subscribe;
