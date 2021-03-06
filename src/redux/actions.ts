import * as api from 'utils/api';
import {remote} from 'electron';

import { State } from 'typings/state';
import { ClientChannel } from 'typings/channels';
import { Offering } from 'typings/offerings';
import { Role, Mode } from 'typings/mode';

import { Notice } from 'utils/notice';

import i18n from 'i18next/init';

export const enum actions {
    REFRESH_ACCOUNTS,
    SET_ROLE,
    SET_MODE,
    UPDATE_PRODUCTS,
    UPDATE_SETTINGS,
    UPDATE_LOCAL_SETTINGS,
    UPDATE_TOTAL_INCOME,
    UPDATE_SERVICE_NAME,
    SET_CHANNEL,
    SET_OFFERINGS,
    SET_WS,
    SET_LOG,
    SET_I18N,
    SET_OFFERINGS_AVAILABILITY,
    INCREMENT_OFFERINGS_AVAILABILITY_COUNTER,
    SET_AUTOTRANSFER,
    ADD_NOTICE,
    REMOVE_NOTICES,
    SET_EXIT,
    SET_EXTERNAL_LINK_WARNING,
    SET_STOPPING_SUPERVISOR,
    SET_TRANSFERRING_FLAG
}

const handlers  = {
    updateAccounts             : function(accounts: State['accounts']){ return { type: actions.REFRESH_ACCOUNTS, value: accounts };},
    updateProducts             : function(products: State['products']){ return { type: actions.UPDATE_PRODUCTS, value: products };},
    updateSettings             : function(settings: State['settings']){ return { type: actions.UPDATE_SETTINGS, value: settings };},
    updateLocalSettings        : function(settings: State['localSettings']){ return { type: actions.UPDATE_LOCAL_SETTINGS, value: settings };},
    updateTotalIncome          : function(totalIncome: number){ return { type: actions.UPDATE_TOTAL_INCOME, value: totalIncome };},
    updateServiceName          : function(serviceName: string){ return { type: actions.UPDATE_SERVICE_NAME, value: serviceName };},
    setRole                    : function(role: State['role']){ return { type: actions.SET_ROLE, value: role };},
    setMode                    : function(mode: State['mode']){ return { type: actions.SET_MODE, value: mode };},
    setChannel                 : function(channel: State['channel']){ return { type: actions.SET_CHANNEL, value: channel };},
    setOfferings               : function(offerings: State['offerings']){ return { type: actions.SET_OFFERINGS, value: offerings };},
    setWS                      : function(ws: State['ws']){ return { type: actions.SET_WS, value: ws};},
    setLOG                     : function(log: State['log']){ return { type: actions.SET_LOG, value: log};},
    setI18N                    : function(i18n: any){ return {type: actions.SET_I18N, value: i18n};},
    setOfferingsAvailability   : function(offeringsAvailability: State['offeringsAvailability']['statuses'][]){
                                     return { type: actions.SET_OFFERINGS_AVAILABILITY, value: offeringsAvailability};
                                 },
    incrementOfferingsAvailabilityCounter: function(counter: number){ return { type: actions.INCREMENT_OFFERINGS_AVAILABILITY_COUNTER, value: counter};},
    setAutoTransfer            : function(autoTransfer: boolean){ return { type: actions.SET_AUTOTRANSFER, value: autoTransfer };},
    addNotice                  : function(msg: {code: number,  notice: Notice}){ return { type: actions.ADD_NOTICE, value: msg };},
    removeNotices              : function(notices: State['notices']){ return { type: actions.REMOVE_NOTICES, value: notices };},
    setExit                    : function(exit: boolean){ return { type: actions.SET_EXIT, value: exit };},
    showExternalLinkWarning    : function(showExternalLink: boolean, externalLink: string){ return { type: actions.SET_EXTERNAL_LINK_WARNING, value: {showExternalLink, externalLink} };},
    setStoppingSupervisor      : function(flag: boolean){ return { type: actions.SET_STOPPING_SUPERVISOR, value: flag };},
    setTransferringFlag        : function(flag: boolean){ return { type: actions.SET_TRANSFERRING_FLAG, value: flag };}
};

export const asyncProviders = {
    updateAccounts: function(){
        return async function(dispatch: any, getState: Function){
            const { ws, role, autoTransfer, localSettings } = getState();

            const startWatchingTransfer = async (accountId: string) => {

                const Watcher = class {
                    private _subscriptionId = null;
                    private unsubscribe = false;
                    private transactionFinished = 0;

                    get subscriptionId(){
                        return this._subscriptionId;
                    }

                    set subscriptionId(id: string){
                        this._subscriptionId = id;
                        if(this.unsubscribe){
                            ws.unsubscribe(id);
                        }
                    }
                    checkIfComplete = (evt: any) => {
                        if('job' in evt && evt.job.Type === 'afterAccountAddBalance' && evt.job.Status === 'done'){
                            this.transactionFinished = Date.now();
                        }else{
                            if(['preAccountAddBalanceApprove'
                               ,'afterAccountAddBalanceApprove'
                               ,'preAccountAddBalance'
                               ,'afterAccountAddBalance'].includes(evt.job.Type)
                            && ['failed'].includes(evt.jobStatus)){
                                this.transactionFinished = Date.now();
                            }
                        }
                        const elapsedTime = (new Date(evt.object.lastBalanceCheck)).getTime() - this.transactionFinished;
                        if(this.transactionFinished > 0
                           && (elapsedTime > localSettings.timings.delayBetweenTransferTokensAndUpdateBalance
                               || evt.object.ptcBalance === 0
                              )
                          ){
                            dispatch(handlers.setTransferringFlag(false));
                            if(this.subscriptionId){
                                ws.unsubscribe(this.subscriptionId);
                            }else{
                                this.unsubscribe = true;
                            }
                        }
                    }
                };
                const watcher = new Watcher();
                watcher.subscriptionId = await ws.subscribe('account', [accountId], watcher.checkIfComplete);
            };

            const accounts = await ws.getAccounts();

            const account = accounts.find(account => account.isDefault);
            const { transferring } = getState();
            if(account && account.ptcBalance !== 0 && autoTransfer && !transferring){

                let gasPrice = localSettings.gas.defaultGasPrice;
                try {
                    const suggestedGasPrice = await ws.suggestGasPrice();
                    if(typeof suggestedGasPrice === 'number' && suggestedGasPrice !== 0){
                        gasPrice = suggestedGasPrice;
                    }
                }catch(e){
                    // DO NOTHING
                }

                if(localSettings.gas.transfer*gasPrice <= account.ethBalance){
                    dispatch(handlers.setTransferringFlag(true));
                    startWatchingTransfer(account.id);
                    ws.transferTokens(account.id, 'psc', account.ptcBalance, gasPrice);
                }else{
                    dispatch(handlers.addNotice({code: 0, notice: {level: 'warning', msg: i18n.t('transferTokens:TransferPRIXNotEnoughETH')}}));
                }
            }

            let ledger = {};
            if(role === Role.CLIENT){
                const channels = await ws.getClientChannels(['wait_coop', 'wait_challenge', 'in_challenge', 'wait_uncoop', 'pending', 'active'], [], 0, 0);
                ledger = channels.items.reduce((ledger: {[key:string]: number}, channel: ClientChannel) => {
                    const address = channel.client.toLowerCase();
                    if(!(address in ledger)){
                        ledger[address] = 0;
                    }
                    ledger[address] += channel.totalDeposit - channel.usage.cost;
                    return ledger;
                }, {});
            }else{
                const offerings = await ws.getAgentOfferings('', ['registered', 'popping_up', 'popped_up', 'removing']);
                ledger = offerings.items.reduce((ledger: {[key:string]: number}, offering: Offering) => {
                    const address = `0x${offering.agent.toLowerCase()}`;
                    if(!(address in ledger)){
                        ledger[address] = 0;
                    }
                    ledger[address] += offering.supply*offering.minUnits*offering.unitPrice;
                    return ledger;
                }, {});
            }

            const updatedAccounts = accounts.map(account => Object.assign({}
                                                                         ,account
                                                                         ,{escrow: `0x${account.ethAddr.toLowerCase()}` in ledger
                                                                                    && ledger[`0x${account.ethAddr.toLowerCase()}`] > 0
                                                                                    ? ledger[`0x${account.ethAddr.toLowerCase()}`]
                                                                                    : 0
                                                                         }
                                                                         ));
            dispatch(handlers.updateAccounts(updatedAccounts));
        };
    },
    updateProducts: function(){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getProducts()
               .then(products => {
                   dispatch(handlers.updateProducts(products));
               });
        };
    },
    updateServiceName: function(){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getProducts()
               .then(products => {
                   dispatch(handlers.updateServiceName(products[0].name));
               });
        };
    },
    updateSettings: function(){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getSettings()
                .then(settings => {
                    dispatch(handlers.updateSettings(Object.keys(settings).reduce((acc, key) => {
                        acc[key] = settings[key].value;
                        return acc;
                    }, {} as any)));
                });
        };
    },
    updateLocalSettings: function(cb?: Function){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getLocal()
                .then(localSettings => {
                    dispatch(handlers.updateLocalSettings(localSettings));
                    if(cb){
                        cb();
                    }
                });
        };
    },
    updateTotalIncome: function(){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getTotalIncome()
                .then(totalIncome => {
                    dispatch(handlers.updateTotalIncome(totalIncome));
                });
        };
    },
    setRole: function(){
        return function(dispatch: any){
            api.settings.getLocal()
               .then(settings => {
                   dispatch(handlers.setRole(settings.role));
               });
        };
    },
    setMode: function(mode: Mode){
        return async function(dispatch: any){

            const { window } = await api.settings.getLocal();
            let { width, height } = window[mode];

            const winSize = remote.screen.getPrimaryDisplay().workAreaSize;
            if (mode === 'simple' && winSize.height <= height) {
                height = winSize.height;
            }

            api.app.resizeWindow(width, height);
            dispatch(handlers.setMode(mode));

        };
    },
    setOfferingsAvailability: function(offeringsIds:string[], cb?: Function){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();

            dispatch(handlers.incrementOfferingsAvailabilityCounter(offeringsIds.length));
            dispatch(handlers.setOfferingsAvailability(offeringsIds.map(id => ({[id]: undefined}))));
            dispatch(handlers.incrementOfferingsAvailabilityCounter(offeringsIds.length));

            offeringsIds.forEach((offeringId) => {
                ws.pingOfferings([offeringId])
                    .then(offeringsAvailability => {
                        dispatch(handlers.setOfferingsAvailability([offeringsAvailability]));
                        if(cb){
                            cb();
                        }
                    });
            });

        };
    }
};

export default handlers;
