import { WS } from 'utils/ws';
import * as api from 'utils/api';

import { Account } from 'typings/accounts';
import { Product } from 'typings/products';
import { ClientChannel } from 'typings/channels';
import { DbSetting as Setting, LocalSettings } from 'typings/settings';
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
    UPDATE_OFFERINGS,
    UPDATE_TOTAL_INCOME,
    UPDATE_SERVICE_NAME,
    SET_CHANNEL,
    SET_WS,
    SET_OFFERINGS_AVAILABILITY,
    INCREMENT_OFFERINGS_AVAILABILITY_COUNTER,
    SET_AUTOTRANSFER,
    ADD_NOTICE,
    REMOVE_NOTICES
}

const handlers  = {
    updateAccounts             : function(accounts: Account[]){ return { type: actions.REFRESH_ACCOUNTS, value: accounts };},
    updateProducts             : function(products: Product[]){ return { type: actions.UPDATE_PRODUCTS, value: products };},
    updateSettings             : function(settings: Setting[]){ return { type: actions.UPDATE_SETTINGS, value: settings };},
    updateLocalSettings        : function(settings: LocalSettings){ return { type: actions.UPDATE_LOCAL_SETTINGS, value: settings };},
    updateOfferings            : function(offerings: Offering[]){ return { type: actions.UPDATE_OFFERINGS, value: offerings };},
    updateTotalIncome          : function(totalIncome: number){ return { type: actions.UPDATE_TOTAL_INCOME, value: totalIncome };},
    updateServiceName          : function(serviceName: string){ return { type: actions.UPDATE_SERVICE_NAME, value: serviceName };},
    setRole                    : function(role: Role){ return { type: actions.SET_ROLE, value: role };},
    setMode                    : function(mode: Mode){ return { type: actions.SET_MODE, value: mode };},
    setChannel                 : function(channelId: string){ return { type: actions.SET_CHANNEL, value: channelId };},
    setWS                      : function(ws: WS){ return { type: actions.SET_WS, value: ws};},
    setOfferingsAvailability   : function(offeringsAvailability: Object[]){ return { type: actions.SET_OFFERINGS_AVAILABILITY, value: offeringsAvailability};},
    incrementOfferingsAvailabilityCounter: function(counter: number){ return { type: actions.INCREMENT_OFFERINGS_AVAILABILITY_COUNTER, value: counter};},
    setAutoTransfer            : function(autoTransfer: boolean){ return { type: actions.SET_AUTOTRANSFER, value: autoTransfer };},
    addNotice                  : function(msg: {code: number,  notice: Notice}){ return { type: actions.ADD_NOTICE, value: msg };},
    removeNotices              : function(notices: {code: number,  notice: Notice}[]){ return { type: actions.REMOVE_NOTICES, value: notices };}
};

export const asyncProviders = {
    updateAccounts: function(){
        return async function(dispatch: any, getState: Function){
            const { ws, role, autoTransfer } = getState();
            const accounts = await ws.getAccounts();
            dispatch(handlers.updateAccounts(accounts));
            if(role === Role.CLIENT){
                const channels = await ws.getClientChannels(['wait_coop', 'wait_challenge', 'wait_uncoop', 'pending', 'active'], [], 0, 0);
                const ledger = channels.items.reduce((ledger: any, channel: ClientChannel) => {
                    const address = channel.client.toLowerCase();
                    if(!(address in ledger)){
                        ledger[address] = 0;
                    }
                    ledger[address] += channel.totalDeposit - channel.usage.cost;
                    return ledger;
                }, {});
                const updatedAccounts = accounts.map(account => Object.assign({}
                                                                             ,account
                                                                             ,{escrow: `0x${account.ethAddr.toLowerCase()}` in ledger
                                                                                 ? ledger[`0x${account.ethAddr.toLowerCase()}`]
                                                                                 : 0
                                                                               }
                                                                             ));
                dispatch(handlers.updateAccounts(updatedAccounts));
            }
            const account = accounts.find(account => account.isDefault);
            if(account && account.ptcBalance !== 0 && autoTransfer){
                const settings = await ws.getSettings();
                const localSettings = await ws.getLocal();
                if(localSettings.gas.transfer*settings['eth.default.gasprice'].value <= account.ethBalance){
                    try{
                        await ws.transferTokens(account.id, 'psc', account.ptcBalance, parseFloat(settings['eth.default.gasprice'].value));
                    }catch(e){
                        // 
                    }
                }else{
                    dispatch(handlers.addNotice({code: 0, notice: {level: 'warning', msg: i18n.t('transferTokens:TransferPRIXNotEnoughETH')}}));
                }
            }
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
    updateOfferings: function(){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getAgentOfferings()
                .then(offerings => {
                    dispatch(handlers.updateOfferings(offerings.items));
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
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getUserRole()
               .then(role => {
                   // TODO check if error
                   dispatch(handlers.setRole(role));
               });
        };
    },
    setMode: function(mode: Mode){
        return async function(dispatch: any, getState: Function){

            const { window } = await api.settings.getLocal();
            const { width, height } = window[mode];

            api.app.resizeWindow(width, height);
            dispatch(handlers.setMode(mode));

        };
    },
    setOfferingsAvailability: function(offeringsIds:string[], cb?: Function){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();

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
