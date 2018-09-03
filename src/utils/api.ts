import {fetch} from './fetch';
import {LocalSettings} from '../typings/settings';
import {Transaction} from '../typings/transactions';
import {ClientOffering} from '../typings/clientOfferings.d.ts';
import {Offering} from '../typings/offerings.d.ts';
import {Session} from '../typings/session.d.ts';

import * as Auth from './api/auth';
export const auth = Auth;

import * as Accounts from './api/accounts';
export const accounts = Accounts;

import * as Settings from './api/settings';
export const settings = Settings;

import * as Channels from './api/channels';
export const channels = Channels;

import * as Products from './api/products';
export const products = Products;

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

export const getOfferingById = function(offeringId: string): Promise<Offering>{
    return (fetch(`/offerings/?id=${offeringId}`) as Promise<Offering[]>)
               .then(offerings => offerings.length ? offerings[0] : null);
};

export const getClientOfferings = function(): Promise<ClientOffering[]>{
    // if you need to add parameters to this function - just make them optional
    // or change call in client_components/connections/connection.tsx
    return fetch('/client/offerings', {}) as Promise<ClientOffering[]>;
};

export const getClientOfferingById = function(offeringId: string): Promise<Offering>{
    return (fetch(`/client/offerings/?id=${offeringId}`) as Promise<Offering[]>)
        .then(offerings => offerings.length ? offerings[0] : null);
};

export const getSessions = function(channelId?: string): Promise<Session[]>{
        return fetch('/sessions'+ (channelId ? `?channelId=${channelId}` : ''), {}) as Promise<Session[]>;
};
