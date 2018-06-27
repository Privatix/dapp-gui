import {fetch} from './fetch';
import {Account} from '../typings/accounts';
import {Product} from '../typings/products';
import {LocalSettings, DbSetting} from '../typings/settings';
import {Transaction} from '../typings/transactions';
import {ClientOffering} from '../typings/clientOfferings.d.ts';

export const getAccounts = function(): Promise<Account[]>{
    return fetch('/accounts') as Promise<Account[]>;
};

export const getTransactionsByAccount = async function(account: string): Promise<Transaction[]>{
    const endpoint = '/transactions' + (account === 'all' ? '' : `?relatedID=${account}&relatedType=account`);
    return fetch(endpoint, {}) as Promise<Transaction[]>;
};

export const getProducts = function(): Promise<Product[]>{
    return fetch('/products') as Promise<Product[]>;
};

export const getSettings = function(): Promise<DbSetting[]>{
    return fetch('/settings') as Promise<DbSetting[]>;
};

export const getLocalSettings = function(): Promise<LocalSettings>{
    return fetch('/localSettings') as Promise<LocalSettings>;
};

export const getUserMode = async function(): Promise<string> {
    const settings = await getSettings();
    const isAgentSetting = settings.filter((settingsItem:any) => {
        if (settingsItem.key === 'user.isagent') {
            return true;
        }
    }).map((settingsItem:any) => {
        return settingsItem.value;
    })[0];

    if (isAgentSetting === 'true') {
        return 'agent';
    }
    return 'client';
};

export const setUserMode = function(userMode:string) {
    const userModeValue = userMode === 'agent' ? 'true' : 'false';
    const body = [{
        'key': 'user.isagent',
        'value': userModeValue,
        'description': 'Specifies user role. "true" - agent. "false" - client.',
        'name': 'user role is agent'
    }];
    return fetch('/settings', {method: 'PUT', body}).then((result:any) => {
        return result.message;
    });
};

export const getClientOfferings = function(): Promise<ClientOffering[]>{
    // if you need to add parameters to this function - just make them optional
    // or change call in client_components/connections/connection.tsx
    return fetch('/client/offerings', {}) as Promise<ClientOffering[]>;

};
