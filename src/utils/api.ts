import {fetch} from './fetch';
import {Account} from '../typings/accounts';
import {Product} from '../typings/products';

export const getAccounts = function(): Promise<Account[]>{
    return fetch('/accounts') as Promise<Account[]>;
};

export const getProducts = function(): Promise<Product[]>{
    return fetch('/products') as Promise<Product[]>;
};
