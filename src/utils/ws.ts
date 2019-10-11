import * as React from 'react';
import { connect } from 'react-redux';
import uuidv4 from 'uuid/v4';

import * as api from './api';
import { Template, TemplateType } from 'typings/templates';
import { Endpoint } from 'typings/endpoints';
import { OfferStatus, Offering, AgentOfferingResponse, ClientOfferingResponse } from 'typings/offerings';
import { Account } from 'typings/accounts';
import { TransactionResponse } from 'typings/transactions';
import { Product } from 'typings/products';
import { Session } from 'typings/session';
import { Channel, ClientChannel, ClientChannelUsage, ChannelResponse, ClientChannelResponse } from 'typings/channels';
import { LogResponse } from 'typings/logs';
import { JobResponse } from 'typings/jobs';
import { State } from 'typings/state';
import { GetClientOfferingsFilterParamsResponse } from 'typings/paginatedResponse';
import * as log from 'electron-log';

export class WS {

    static handlers = {}; // uuid -> handler
    static byUUID = {}; // uuid -> subscribeID
    static subscribeRequests = {}; // subscribeId => descriptor
    static pollings = {};
    static groups = {};

    private socket: WebSocket;
    private pwd: string;
    private token: string;
    private ready: Promise<boolean>;
    private authorized: Promise<boolean>;
//    private reject: Function = null;
    private resolve: Function = null;
    private resolveAuth: Function = null;
    private log: any;

    constructor(log: any) {
        this.log = log;
        this.ready = new Promise((resolve: Function) => {
            this.resolve = resolve;
        });
        this.authorized = new Promise((resolve: Function) => {
            this.resolveAuth = resolve;
        });
        api.settings.getLocal()
           .then(settings => {
                this.reconnect(settings.wsEndpoint);
           });

    }

    reconnect(endpoint: string) {

        const socket = new WebSocket(endpoint);
        this.socket = socket;

        if(!this.resolve){
            this.ready = new Promise((resolve: Function) => {
                this.resolve = resolve;
            });
            this.authorized = new Promise((resolve: Function) => {
                this.resolveAuth = resolve;
            });
        }

        socket.onopen = async () => {
          log.log('Connection established.');
          if(this.pwd){
              const token = await this.getToken();
              this.token = token;
              this.resolveAuth(true);
              this.resolveAuth = null;
              await this.saveCache();
              this.restoreSubscriptions();
          }
          this.resolve(true);
          this.resolve = null;
        };

        socket.onclose = (event: any) => {
            if (event.wasClean) {
                log.log('Connection closed.');
            } else {
                log.log('Connection interrupted.');
            }
            log.log('Code: ' + event.code + ' reason: ' + event.reason);
            setTimeout(this.reconnect.bind(this, endpoint), 1000);
        };

        socket.onmessage = function(event: any) {
            const msg = JSON.parse(event.data);
            if('id' in msg && 'string' === typeof msg.id){
                if(msg.id in WS.handlers){
                    const handler = WS.handlers[msg.id];
                    delete WS.handlers[msg.id];
                    handler(msg);
                }
            }else if('method' in msg && msg.method === 'ui_subscription'){
                if(msg.params.subscription in WS.subscribeRequests){
                    WS.subscribeRequests[msg.params.subscription].handler(msg.params.result);
                }
           } else {
               // ignore
           }
          // log.log('Data received: ' + event.data);
        };

        socket.onerror = function() {
          // log.log('Error ' + error.message);
        };

    }

    whenReady() {
        return this.ready;
    }

    whenAuthorized() {
        return this.authorized;
    }

    get passwordIsEntered(){
        return this.pwd && this.pwd !== '';
    }
    private async restoreSubscriptions(){
        const toRestore = WS.subscribeRequests;
        WS.subscribeRequests = {};

        Object.keys(WS.byUUID).forEach(async uuid => {
            if(WS.byUUID[uuid]){
                const subscribeId = WS.byUUID[uuid];
                const { entityType, ids, handler, onReconnect } = toRestore[subscribeId];
                await this._subscribe(uuid, entityType, ids, handler, onReconnect);
            }else{
                // polling
                const subscribeId = uuid;
                const { entityType, ids, handler, onReconnect } = WS.pollings[subscribeId];
                await this._subscribe(uuid, entityType, ids, handler, onReconnect);
            }
        });
    }

    private _subscribe (uuid: string, entityType:string, ids: string[], handler: Function, onReconnect: Function){
        return new Promise((resolve: Function) => {
            switch(entityType){
                case 'usage':
                    const usagePolling = async () => {
                        const usage = await this.getChannelsUsage(ids);
                        handler(usage);
                        if(WS.pollings[uuid]){
                            WS.pollings[uuid].workerId = setTimeout(usagePolling, 2000);
                        }
                    };
                    WS.pollings[uuid] = {entityType, ids, handler, onReconnect};
                    resolve(uuid);
                    usagePolling();
                    break;
                case 'channels':
                    const channelsUUID = uuidv4();
                    this._subscribe(channelsUUID, 'channel', ids, handler, onReconnect)
                        .then(channelsSubscribeId => {
                            const usageUUID = uuidv4();
                            this._subscribe(usageUUID, 'usage', ids, handler, onReconnect)
                                .then(usageSubscribeId => {
                                    WS.groups[uuid] = [channelsSubscribeId, usageSubscribeId];
                                    resolve(uuid);
                                });
                        });
                    break;
                default:
                    const req = {
                        jsonrpc: '2.0',
                        id: uuid,
                        method: 'ui_subscribe',
                        params: ['objectChange', this.token, entityType, ids]
                    };


                    WS.handlers[uuid] = (msg: any) => {
                        WS.subscribeRequests[msg.result] = {
                            entityType, ids, handler, onReconnect
                        };
                        WS.byUUID[uuid] = msg.result;
                        resolve(uuid);
                    };
                    this.log.info('Send wc subscribe request: '+JSON.stringify(req));
                    this.socket.send(JSON.stringify(req));
            }
        }) as Promise<string>;
    }

    subscribe(entityType:string, ids: string[], handler: Function, onReconnect?: Function): Promise<string>{
        const uuid = uuidv4();
        return this._subscribe(uuid, entityType, ids, handler, onReconnect);
    }

    unsubscribe(id: string){

        if(WS.byUUID[id]){
            const uuid = uuidv4();
            const subscribeId = WS.byUUID[id];

            if(WS.subscribeRequests[subscribeId]){
                const req = {
                    jsonrpc: '2.0',
                    id: uuid,
                    method: 'ui_unsubscribe',
                    params: [subscribeId]
                };

                return new Promise((resolve: Function, reject: Function) => {
                    const handler = function(res: any){
                        if('error' in res){
                            reject(res.error);
                        }else{
                            resolve(res.result);
                        }
                    };

                    WS.handlers[uuid] = handler;
                    this.socket.send(JSON.stringify(req));
                    delete WS.byUUID[id];
                    delete WS.subscribeRequests[subscribeId];
                });
            }
        }else if(id in WS.pollings){
            // polling
            clearTimeout(WS.pollings[id].workerId);
            delete WS.pollings[id];
        }else if(id in WS.groups){
            WS.groups[id].forEach(uuid => this.unsubscribe(uuid));
            delete WS.groups[id];
        }else {
            log.error('unsubscribe: unknown subscription', id);
        }
    }

    send(method: string, params: any[] = []){

        const uuid = uuidv4();
        if(!['ui_updatePassword', 'ui_getUserRole', 'ui_getToken'].includes(method)){
            params.unshift(this.token);
        }
        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method,
            params
        };

        return new Promise((resolve: Function, reject: Function) => {
            const handler = function(res: any){
                if('error' in res){
                    reject(res.error);
                }else{
                    resolve(res.result);
                }
            };
            this.log.info('Send wc request: '+JSON.stringify(req));
            WS.handlers[uuid] = handler;
            this.socket.send(JSON.stringify(req));
        });
    }

    topUp(channelId: string, deposit: number, gasPrice: number){
        return this.send('ui_topUpChannel', [channelId, deposit, gasPrice]) as Promise<any>;
    }

// auth

    private getToken(): Promise<string>{
        return this.send('ui_getToken', [this.pwd]) as Promise<string>;
    }

    setPassword(pwd: string){
        const uuid = uuidv4();
        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_setPassword',
            params: [pwd]
        };

        this.pwd = pwd;

        return new Promise((resolve: Function, reject: Function) => {
            const updateToken = async () => {
                try {
                    const token = await this.getToken();
                    if(token){
                        this.token = token;
                        if(this.resolveAuth){
                            this.resolveAuth(true);
                        }
                        await this.saveCache();
                        resolve(true);
                    }else{
                        reject(false);
                    }
                 } catch(err){
                        reject(err);
                }
            };
            const handler = async (res: any) => {
                if('error' in res && res.error.message.indexOf('password exists') === -1){
                    reject(res.error);
                }else{
                    updateToken();
                }
            };
            WS.handlers[uuid] = handler;
            this.socket.send(JSON.stringify(req));
        });
    }

    updatePassword(pwd: string){
        const old = this.pwd;
        this.pwd = pwd;
        return this.send('ui_updatePassword', [old, pwd]);
    }
// accounts

    getAccount(id: string): Promise<Account> {
        return this.getObject('account', id);
    }

    getAccounts(): Promise<Account[]> {
        return this.send('ui_getAccounts') as Promise<Account[]>;
    }

    generateAccount(payload: any): Promise<string>{
        return this.send('ui_generateAccount', [payload]) as Promise<string>;
    }

    importAccountFromHex(payload: any): Promise<any>{
        return this.send('ui_importAccountFromHex', [payload]) as Promise<any>;
    }

    importAccountFromJSON(payload: any, key: Object, pwd: string){
        return this.send('ui_importAccountFromJSON', [payload, key, pwd]) as Promise<any>;
    }

    exportAccount(accountId: string): Promise<string>{
        return this.send('ui_exportPrivateKey', [accountId]) as Promise<string>;
    }

    updateAccount(accountId: string, name: string, isDefault: boolean, inUse: boolean){
        return this.send('ui_updateAccount', [accountId, name, isDefault, inUse]);
    }

    updateBalance(accountId: string){
        return this.send('ui_updateBalance', [accountId]);
    }

    transferTokens(accountId: string, destination: 'ptc'|'psc', tokenAmount: number, gasPrice: number){
        return this.send('ui_transferTokens', [accountId, destination, tokenAmount, gasPrice]);
    }
// templates

    getTemplates(templateType?: TemplateType): Promise<Template[]>{
        const type = templateType ? templateType : '';
        return this.send('ui_getTemplates', [type]) as Promise<Template[]>;
    }

    getTemplate(id: string){
        return this.getObject('template', id);
    }


// endpoints

    getEndpoints(channelId: string, templateId: string = '') : Promise<Endpoint[]>{
        return this.send('ui_getEndpoints', [channelId, templateId]) as Promise<Endpoint[]>;
    }

// products

    getProduct(id: string): Promise<Product> {
        return this.getObject('product', id) as Promise<Product>;
    }

    getProducts(): Promise<Product[]> {
        return this.send('ui_getProducts')  as Promise<Product[]>;
    }

    updateProduct(product: any){
        return this.send('ui_updateProduct', [product]);
    }

// offerings

    getAgentOfferings(productId: string='', statuses: OfferStatus[] = [], offset: number = 0, limit: number = 0): Promise<AgentOfferingResponse>{
        return this.send('ui_getAgentOfferings', [productId, statuses, offset, limit]) as Promise<AgentOfferingResponse>;
    }

    getClientOfferings(agent: string = ''
                      ,minUnitPrice: number = 0
                      ,maxUnitPrice: number = 0
                      ,countries: string[] = []
                      ,ipTypes: string[] = []
                      ,offset: number = 0
                      ,limit: number = 0) : Promise<ClientOfferingResponse> {
        return this.send('ui_getClientOfferings', [agent, minUnitPrice, maxUnitPrice, countries, ipTypes, offset, limit]) as Promise<ClientOfferingResponse>;
    }

    getOffering(id: string): Promise<Offering>{
        return this.getObject('offering', id) as Promise<Offering>;
    }

    createOffering(payload: any): Promise<string>{
        return this.send('ui_createOffering', [payload]) as Promise<string>;
    }

    changeOfferingStatus(offeringId: string, action: string, gasPrice: number){
        return this.send('ui_changeOfferingStatus', [offeringId, action, gasPrice]);
    }

    acceptOffering(ethAddress: string, offeringId: string, deposit: number, gasPrice: number) {
        return this.send('ui_acceptOffering', [ethAddress, offeringId, deposit, gasPrice]);
    }

    getClientOfferingsFilterParams(): Promise<GetClientOfferingsFilterParamsResponse> {
        return this.send('ui_getClientOfferingsFilterParams') as Promise<GetClientOfferingsFilterParamsResponse>;
    }

    getObjectByHash(type: 'offering', hash: string) : Promise<Offering> {
        return this.send('ui_getObjectByHash', [type, hash]) as Promise<Offering>;
    }

    pingOfferings(offeringsIds: Array<string>) {
        return this.send('ui_pingOfferings', [offeringsIds]);
    }

// sessions

    getSessions(channelId: string = ''): Promise<Session[]>{
        return this.send('ui_getSessions', [channelId]) as Promise<Session[]>;
    }

// channels

    getClientChannels(channelStatus: string[], serviceStatus: string[], offset: number, limit: number): Promise<ClientChannelResponse>{
        return this.send('ui_getClientChannels', [channelStatus, serviceStatus, offset, limit]) as Promise<ClientChannelResponse>;
    }

    async getNotTerminatedClientChannels(): Promise<ClientChannel[]>{

        const statuses = ['pending', 'activating', 'active', 'suspending', 'suspended'];

        const channels = await this.getClientChannels([], statuses, 0, 10);
        return channels.items;
    }

    getAgentChannels(channelStatus: Array<string>, serviceStatus: Array<string>, offset: number, limit: number): Promise<ChannelResponse>{
        return this.send('ui_getAgentChannels', [channelStatus, serviceStatus, offset, limit]) as Promise<ChannelResponse>;
    }

    getChannelsUsage(channelIds: string[]): Promise<{[key: string] : ClientChannelUsage}>{
        return this.send('ui_getChannelsUsage', [channelIds]) as Promise<{[key: string] : ClientChannelUsage}>;
    }

    changeChannelStatus(channelId: string, channelStatus: string){
        return this.send('ui_changeChannelStatus', [channelId, channelStatus]) as Promise<any>; // null actually
    }

// common
    getObject(type: 'product', id: string): Promise<Product>;
    getObject(type: 'channel', id: string): Promise<Channel>;
    getObject(type: 'template', id: string): Promise<Template>;
    getObject(type: 'offering', id: string): Promise<Offering>;
    getObject(type: 'account', id: string): Promise<Account>;
    getObject(type: string, id: string){
        return this.send('ui_getObject', [type, id]);
    }

    getTransactions(type: string, id: string, offset: number, limit: number) : Promise<TransactionResponse> {
        return this.send('ui_getEthTransactions', [type, id, offset, limit]) as Promise<TransactionResponse>;
    }

    increaseTxGasPrice(id: string, gasPrice: number){
        return this.send('ui_increaseTxGasPrice', [id, gasPrice]) as Promise<any>;
    }

    getTotalIncome(): Promise<number> {
        return this.send('ui_getTotalIncome', []) as Promise<number>;
    }
// logs
    getLogs(levels: Array<string>, searchText: string, dateFrom: string, dateTo: string, offset:number, limit: number): Promise<LogResponse> {
        return this.send('ui_getLogs', [levels, searchText, dateFrom, dateTo, offset, limit]) as Promise<LogResponse>;
    }

// jobs
    getJobs(jobType: string, from: string, to: string, statuses: Array<string>, offset:number, limit: number): Promise<JobResponse> {
        return this.send('ui_getJobs', [jobType, from, to, statuses, offset, limit]) as Promise<JobResponse>;
    }

    reactivateJob(id: string): Promise<any>{
        return this.send('ui_reactivateJob', [id]) as Promise<any>;
    }

    suggestGasPrice() : Promise<number>{
        return this.send('ui_suggestGasPrice') as Promise<number>;
    }

    getSettings() {
        return this.send('ui_getSettings');
    }

    // TODO typings
    updateSettings(updateSettings: Object) {
        return this.send('ui_updateSettings', [updateSettings]);
    }

    getGUISettings() {
        return this.send('ui_getGUISettings', []);
    }

    async setGUISettings(updateSettings: Object){
        if(this.token){
            const settings = await this.getGUISettings();
            const payload = Object.assign({}, settings, updateSettings);
            window.localStorage.setItem('localSettings', JSON.stringify(payload));
            return this.send('ui_setGUISettings', [payload]);
        }else{
            let localCache = window.localStorage.getItem('localSettings');
            const localCacheObj = JSON.parse(localCache);
            window.localStorage.setItem('localSettings', JSON.stringify(Object.assign({}, localCacheObj, updateSettings)));
        }
    }

    async getLocal(): Promise<{[key: string]: any}> {
        let localCache = window.localStorage.getItem('localSettings');
        localCache = JSON.parse(localCache);
        const mutableSettings = this.token ? await this.getGUISettings() : localCache;
        const immutableSettings = await api.settings.getLocal();
        return Object.assign({}, immutableSettings, mutableSettings);
    }

    saveCache(){
        let localCache = window.localStorage.getItem('localSettings');
        localCache = JSON.parse(localCache);
        return this.setGUISettings(localCache);
    }

}

export const ws = function<T>(constructor: React.ComponentType){
    return connect( (state: State, ownProps: any) => {
        return (Object.assign({}, {ws: state.ws}, ownProps) as T);
    } )(constructor);
};
