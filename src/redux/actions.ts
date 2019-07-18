import { WS } from 'utils/ws';
import * as api from 'utils/api';
import {screen} from 'electron';

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
    REMOVE_NOTICES,
    SET_EXIT,
    ADD_TRANSFER,
    REMOVE_TRANSFER,
    SET_IP
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
    setChannel                 : function(channel: ClientChannel){ return { type: actions.SET_CHANNEL, value: channel };},
    setWS                      : function(ws: WS){ return { type: actions.SET_WS, value: ws};},
    setOfferingsAvailability   : function(offeringsAvailability: Object[]){ return { type: actions.SET_OFFERINGS_AVAILABILITY, value: offeringsAvailability};},
    incrementOfferingsAvailabilityCounter: function(counter: number){ return { type: actions.INCREMENT_OFFERINGS_AVAILABILITY_COUNTER, value: counter};},
    setAutoTransfer            : function(autoTransfer: boolean){ return { type: actions.SET_AUTOTRANSFER, value: autoTransfer };},
    addNotice                  : function(msg: {code: number,  notice: Notice}){ return { type: actions.ADD_NOTICE, value: msg };},
    removeNotices              : function(notices: {code: number,  notice: Notice}[]){ return { type: actions.REMOVE_NOTICES, value: notices };},
    setExit                    : function(exit: boolean){ return { type: actions.SET_EXIT, value: exit };},
    addTransfer                : function(address: string, amount: number){ return { type: actions.ADD_TRANSFER, value: {address, amount} };},
    removeTransfer             : function(address: string, amount: number){ return { type: actions.REMOVE_TRANSFER, value: {address, amount} };},
    setIP                      : function(ip: string){ return {type: actions.SET_IP, value: ip};}
};

const notify = function(msg: string){
    const notification = new Notification('Privatix', {
      body: msg
    });
    notification.onclick = () => {
      //
    };
};

const context = {createChannelSubscription: null, channelSubscription: null, connected: null, ipSubscription: null};

export const asyncProviders = {
    observeChannel: function(){

        const refresh = async function(dispatch: any, getState: Function){

            const getIP = async function(attempt?: number){
                const counter = !attempt ? 0 : attempt;
                if(counter < 5){
                    try{
                        const res = await fetch('https://api.ipify.org?format=json');
                        const json = await res.json();
                        dispatch(handlers.setIP(json.ip));
                    }catch(e){
                        context.ipSubscription = setTimeout(getIP.bind(null, counter+1), 3000);
                    }
                }
            };

            const handler = refresh.bind(null, dispatch, getState);
            const { channel, ws, ip } = getState();
            const channels = await ws.getNotTerminatedClientChannels();

            if(!context.createChannelSubscription){
                context.createChannelSubscription = await ws.subscribe('channel', ['clientPreChannelCreate'], handler, handler);
            }

            if(channels.length){
                if(!ip){
                    getIP();
                }
                if(channels[0].channelStatus.serviceStatus === 'active'){
                    if(context.connected === false){
                        notify(i18n.t('client/simpleMode:connectedMsg'));
                    }
                    context.connected = true;
                }else{
                    if(context.connected === true){
                        notify(i18n.t('client/simpleMode:disconnectedMsg'));
                    }
                    context.connected = false;
                }
                if(channel && channel.id === channels[0].id){
                        dispatch(handlers.setChannel(channels[0]));
                }else{
                    if(context.channelSubscription){
                        await ws.unsubscribe(context.channelSubscription);
                    }
                    dispatch(handlers.setChannel(channels[0]));
                    context.channelSubscription = await ws.subscribe('channel', [channels[0].id], handler, handler);
                }
            }else{
                if(context.connected !== null){
                    if(context.connected === true){
                        notify(i18n.t('client/simpleMode:disconnectedMsg'));
                        dispatch(handlers.setIP(''));
                    }
                }
                context.connected = false;

                if(context.channelSubscription){
                    await ws.unsubscribe(context.channelSubscription);
                    context.channelSubscription = null;
                }
                dispatch(handlers.setChannel(null));
            }
        };

        return refresh;
    },
    updateAccounts: function(){
        return async function(dispatch: any, getState: Function){
            const { ws, role, autoTransfer, transfers } = getState();

            const startWatchingTransfer = async (address: string, amount: number) => {

                const context = {subscriptionId: null};

                const checkIfComplete = (evt: any) => {
                    if('job' in evt && evt.job.type === 'afterAccountAddBalance' && evt.job.status === 'done'){

                        dispatch(handlers.removeTransfer(address, amount));
                        ws.unsubscribe(context.subscriptionId);
                        context.subscriptionId = null;
                    }
                };
                context.subscriptionId = await ws.subscribe('account', [address], checkIfComplete);
            };

            const includesTransfer = (transferring: {address: string, amount: number}[], address: string, amount: number) =>
                transferring.some(transfer => transfer.address === address && transfer.amount === amount);

            const accounts = await ws.getAccounts();
            dispatch(handlers.updateAccounts(accounts));

            let ledger = {};
            if(role === Role.CLIENT){
                const channels = await ws.getClientChannels(['wait_coop', 'wait_challenge', 'wait_uncoop', 'pending', 'active'], [], 0, 0);
                ledger = channels.items.reduce((ledger: {[key:string]: number}, channel: ClientChannel) => {
                    const address = channel.client.toLowerCase();
                    if(!(address in ledger)){
                        ledger[address] = 0;
                    }
                    ledger[address] += channel.totalDeposit - channel.usage.cost;
                    return ledger;
                }, {});
            }else{
                const offerings = await ws.getAgentOfferings();
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
                                                                             ? ledger[`0x${account.ethAddr.toLowerCase()}`]
                                                                             : 0
                                                                           }
                                                                         ));
            dispatch(handlers.updateAccounts(updatedAccounts));


            const account = accounts.find(account => account.isDefault);
            if(account && account.ptcBalance !== 0 && autoTransfer && !includesTransfer(transfers, account.ethAddr, account.ptcBalance)){
                const settings = await ws.getSettings();
                const localSettings = await ws.getLocal();
                if(localSettings.gas.transfer*settings['eth.default.gasprice'].value <= account.ethBalance){
                    try{
                        await ws.transferTokens(account.id, 'psc', account.ptcBalance, parseFloat(settings['eth.default.gasprice'].value));
                        dispatch(handlers.addTransfer(account.ethAddr, account.ptcBalance));
                        startWatchingTransfer(account.ethAddr, account.ptcBalance);
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
        return function(dispatch: any){
            api.settings.getLocal()
               .then(settings => {
                   dispatch(handlers.setRole(settings.role));
               });
        };
    },
    setMode: function(mode: Mode){
        return async function(dispatch: any, getState: Function){

            const { window } = await api.settings.getLocal();
            let { width, height } = window[mode];

            const winSize = screen.getPrimaryDisplay().workAreaSize;
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
