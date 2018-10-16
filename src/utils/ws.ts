import * as uuidv4 from 'uuid/v4';
import {TemplateType} from '../typings/templates';
import {OfferStatus, Offering} from '../typings/offerings';
import {Account} from '../typings/accounts';
import {Product} from '../typings/products';
import {Session} from '../typings/session';

export class WS {
    
    static listeners = {}; // uuid -> listener
    static handlers = {}; // uuid -> handler

    static byUUID = {}; // uuid -> subscribeID
    static bySubscription = {}; // subscribeId -> uuid

    private socket: WebSocket;
    private pwd: string;
    private ready: Promise<boolean>;
//    private reject: Function = null;
    private resolve: Function = null;

    constructor(endpoint: string) {

        const socket = new WebSocket(endpoint);
        this.ready = new Promise((resolve: Function, reject: Function) => {
            // this.reject = reject;
            this.resolve = resolve;
        });
        socket.onopen = () => {
          console.log('Connection established.');
          this.resolve(true);
        };

        socket.onclose = function(event: any) {
            if (event.wasClean) {
                console.log('Connection closed.');
            } else {
                console.log('Connection interrupted.');
            }
            console.log('Code: ' + event.code + ' reason: ' + event.reason);
        };

        socket.onmessage = function(event: any) {
            const msg = JSON.parse(event.data);
            if('id' in msg && 'string' === typeof msg.id){
                if(msg.id in WS.handlers){
                    WS.handlers[msg.id](msg);
                    delete WS.handlers[msg.id];
                }else {
                    if('result' in msg && 'string' === typeof msg.result){
                        WS.byUUID[msg.id] = msg.result;
                        WS.bySubscription[msg.result] = msg.id;
                    }
                }
            }else if('method' in msg && msg.method === 'ui_subscription'){
                if(msg.params.subscription in WS.bySubscription){
                    WS.listeners[WS.bySubscription[msg.params.subscription]](msg.params.result);
                }
           } else {
               // ignore
           }
          // console.log('Data received: ' + event.data);
        };

        socket.onerror = function(error: any) {
          // console.log('Error ' + error.message);
        };

        this.socket = socket;
    }

    whenReady(){
        return this.ready;
    }
    subscribe(entityType:string, ids: string[], handler: Function) {
        const uuid = uuidv4();
        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_subscribe',
            params: ['objectChange', this.pwd, entityType, ids]
        };
        WS.listeners[uuid] = handler;
        this.socket.send(JSON.stringify(req));
        return uuid;
    }

    unsubscribe(id: string){

        const uuid = uuidv4();

        if(WS.listeners[id]){
            const req = {
                jsonrpc: '2.0',
	            id: uuid,
	            method: 'ui_unsubscribe',
	            params: [ WS.byUUID[id] ]
            };
            this.socket.send(JSON.stringify(req));
            delete WS.listeners[id];
            delete WS.bySubscription[WS.byUUID[id]];
            delete WS.byUUID[id];
        }
    }

    topUp(channelId: string, gasPrice: number, handler: Function){
        const uuid = uuidv4();
        WS.handlers[uuid] = handler;

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_topUpChannel',
            params: [this.pwd, channelId, gasPrice]
        };

        this.socket.send(JSON.stringify(req));
    }

// auth

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
            const handler = (res: any) => {
                if('error' in res){
                    if(res.error.message.indexOf('password exists') === -1){
                        reject(res.error);
                    }else{
                        this.getProducts()
                            .then(products => {
                                resolve(true);
                            })
                            .catch(err => {
                                reject(err);
                            });
                    }
                }else{
                    resolve(res.result);
                }
            };
            WS.handlers[uuid] = handler;
            this.socket.send(JSON.stringify(req));
        });
    }

    updatePassword(pwd: string){
        const uuid = uuidv4();

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_setPassword',
            params: [this.pwd, pwd]
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
        });
    }

// accounts

    getAccounts(): Promise<Account[]> {
        const uuid = uuidv4();

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_getAccounts',
            params: [this.pwd]
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
        }) as Promise<Account[]>;
    }

    generateAccount(payload: any, handler: Function){
        const uuid = uuidv4();
        WS.handlers[uuid] = handler;

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_generateAccount',
            params: [this.pwd, payload]
        };

        this.socket.send(JSON.stringify(req));
    }

    importAccountFromHex(payload: any, handler: Function){
        const uuid = uuidv4();
        WS.handlers[uuid] = handler;

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_importAccountFromHex',
            params: [this.pwd, payload]
        };

        this.socket.send(JSON.stringify(req));
    }

    importAccountFromJSON(payload: any, key: Object, pwd: string, handler: Function){
        const uuid = uuidv4();
        WS.handlers[uuid] = handler;

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_importAccountFromJSON',
            params: [this.pwd, payload, key, pwd]
        };

        this.socket.send(JSON.stringify(req));
    }

    exportAccount(accountId: string, handler: Function){
        const uuid = uuidv4();
        WS.handlers[uuid] = handler;

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_exportPrivateKey',
            params: [this.pwd, accountId]
        };

        this.socket.send(JSON.stringify(req));
    }

    updateBalance(accountId: string){
        const uuid = uuidv4();

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_updateBalance',
            params: [this.pwd, accountId]
        };

        return new Promise((resolve: Function, reject: Function) => {
            WS.handlers[uuid] = function(res: any){
                if ('err' in res) {
                    reject(res.err);
                } else {
                    resolve(res.result);
                }
            };
            this.socket.send(JSON.stringify(req));
        });
    }
// templates

    getTemplates(templateType?: TemplateType){
        const uuid = uuidv4();

        const type = templateType ? templateType : '';

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_getTemplates',
            params: [this.pwd, type]
        };

        return new Promise((resolve: Function, reject: Function) => {
            WS.handlers[uuid] = function(res: any){
                if ('err' in res) {
                    reject(res.err);
                } else {
                    resolve(res.result);
                }
            };
            this.socket.send(JSON.stringify(req));
        });
    }

    getTemplate(id: string){
        return this.getObject('template', id);
    }


// endpoints

    getEndpoints(channelId: string, templateId: string = ''){
        const uuid = uuidv4();

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_getEndpoints',
            params: [this.pwd, channelId, templateId]
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
        });
    }

// products

    getProducts(): Promise<Product[]> {
        const uuid = uuidv4();

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_getProducts',
            params: [this.pwd]
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
        }) as Promise<Product[]>;
    }

    updateProduct(product: any){
        const uuid = uuidv4();

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_updateProduct',
            params: [this.pwd, product]
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
        });
    }

// offerings

    getAgentOfferings(productId: string='', status: OfferStatus = OfferStatus.undef): Promise<Offering[]>{
        const uuid = uuidv4();

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_getAgentOfferings',
            params: [this.pwd, productId, status]
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
        }) as Promise<Offering[]>;
    }

    getOffering(id: string): Promise<Offering>{
        return this.getObject('offering', id) as Promise<Offering>;
    }

    createOffering(payload: any){
        const uuid = uuidv4();

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_createOffering',
            params: [this.pwd, payload]
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
        });
    }

    changeOfferingStatus(offeringId: string, action: string, gasPrice: number){
        const uuid = uuidv4();

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_changeOfferingStatus',
            params: [this.pwd, offeringId, action, gasPrice]
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
        });
    }

// sessions

    getSessions(channelId: string = ''): Promise<Session[]>{
         const uuid = uuidv4();

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_getSessions',
            params: [this.pwd, channelId]
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
        }) as Promise<Session[]>;
    }
// common

    getObject(type: string, id: string){
        const uuid = uuidv4();

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_getObject',
            params: [this.pwd, type, id]
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
        });
    }

    getTransactions(type: string, id: string) {
        const uuid = uuidv4();

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_getEthTransactions',
            params: [this.pwd, type, id]
        };

        return new Promise((resolve: Function, reject: Function) => {
            WS.handlers[uuid] = function(res: any){
                if ('err' in res) {
                    reject(res.err);
                } else {
                    resolve(res.result);
                }
            };

            this.socket.send(JSON.stringify(req));
        });
    }

    getSettings() {
        const uuid = uuidv4();

        const req = {
            jsonrpc: '2.0',
            id: uuid,
            method: 'ui_getSettings',
            params: [this.pwd]
        };

        return new Promise((resolve: Function, reject: Function) => {
            WS.handlers[uuid] = function(res: any){
                if ('err' in res) {
                    reject(res.err);
                } else {
                    resolve(res.result);
                }
            };

            this.socket.send(JSON.stringify(req));
        });
    }
    
}
