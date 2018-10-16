import {fetch} from './fetch';
import {LocalSettings} from '../typings/settings';
import {Transaction} from '../typings/transactions';
import {ClientOffering} from '../typings/clientOfferings';

import * as Settings from './api/settings';
export const settings = Settings;

import * as Channels from './api/channels';
export const channels = Channels;

import * as Offerings from './api/offerings';
export const offerings = Offerings;

import * as Templates from './api/templates';
export const templates = Templates;

import * as Logs from './api/logs';
export const logs = Logs;

import * as UserRole from './api/userrole';
export const userrole = UserRole;

export const getTransactionsByAccount = async function(account: string): Promise<Transaction[]>{
    const endpoint = '/transactions' + (account === 'all' ? '' : `?relatedID=${account}&relatedType=account`);
    return fetch(endpoint, {}) as Promise<Transaction[]>;
};


export const getLocalSettings = function(): Promise<LocalSettings>{
    return Settings.getLocal() as Promise<LocalSettings>;
};


export const getUserRole = async function(): Promise<string> {
    const userRole = await userrole.get();

    return userRole;
};

export const getClientOfferings = function(): Promise<ClientOffering[]>{
    // if you need to add parameters to this function - just make them optional
    // or change call in client_components/connections/connection.tsx
    return fetch('/client/offerings', {}) as Promise<ClientOffering[]>;
};
