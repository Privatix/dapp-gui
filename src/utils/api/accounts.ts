import {fetch} from '../fetch';
import {SaveAnswer, CreateAccount} from '../../typings/SaveAnswer';
import {Account} from '../../typings/accounts';

export const createNewAccount = async function(privateKey: string, isDefault: boolean, inUse: boolean, name: string, type: string): Promise<SaveAnswer | CreateAccount> {
    const body = {privateKey: privateKey
        ,isDefault: isDefault
        ,inUse: inUse
        ,name
        ,type: type
    };
    console.log('GENERATE!!!', body);
    return fetch('/accounts/', {method: 'post', body}) as Promise<SaveAnswer | CreateAccount>;
};


export const getAccounts = function(): Promise<Account[]>{
    return fetch('/accounts') as Promise<Account[]>;
};
