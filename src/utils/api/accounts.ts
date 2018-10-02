import {fetch} from '../fetch';
import {Account} from '../../typings/accounts';

export const getAccounts = function(): Promise<Account[]>{
    return fetch('/accounts') as Promise<Account[]>;
};
