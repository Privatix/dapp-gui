import { WS } from 'utils/ws';

import {Account} from 'typings/accounts';
import {Product} from 'typings/products';
import {DbSetting as Setting, LocalSettings} from 'typings/settings';
import {Offering} from 'typings/offerings';
import { Role } from 'typings/mode';

export const enum actions {
    REFRESH_ACCOUNTS,
    SET_MODE,
    SET_ADVANCED_MODE,
    UPDATE_PRODUCTS,
    UPDATE_SETTINGS,
    UPDATE_LOCAL_SETTINGS,
    UPDATE_OFFERINGS,
    UPDATE_TOTAL_INCOME,
    SET_CHANNEL,
    SET_WS,
    SET_OFFERINGS_AVAILABILITY,
    INCREMENT_OFFERINGS_AVAILABILITY_COUNTER
}


interface ReduxHandlers {
    [key: string]: Function;
}

const handlers: ReduxHandlers = {
    updateAccounts             : function(accounts: Account[]){ return { type: actions.REFRESH_ACCOUNTS, value: accounts };},
    updateProducts             : function(products: Product[]){ return { type: actions.UPDATE_PRODUCTS, value: products };},
    updateSettings             : function(settings: Setting[]){ return { type: actions.UPDATE_SETTINGS, value: settings };},
    updateLocalSettings        : function(settings: LocalSettings){ return { type: actions.UPDATE_LOCAL_SETTINGS, value: settings };},
    updateOfferings            : function(offerings: Offering[]){ return { type: actions.UPDATE_OFFERINGS, value: offerings };},
    updateTotalIncome          : function(totalIncome: number){ return { type: actions.UPDATE_TOTAL_INCOME, value: totalIncome };},
    setMode                    : function(mode: Role){ return { type: actions.SET_MODE, value: mode };},
    setAdvancedMode            : function(advancedMode: boolean){ return { type: actions.SET_ADVANCED_MODE, value: advancedMode };},
    setChannel                 : function(channelId: string){ return { type: actions.SET_CHANNEL, value: channelId };},
    setWS                      : function(ws: WS){ return { type: actions.SET_WS, value: ws};},
    setOfferingsAvailability   : function(offeringsAvailability: Object[]){ return { type: actions.SET_OFFERINGS_AVAILABILITY, value: offeringsAvailability};},
    incrementOfferingsAvailabilityCounter: function(counter: number){ return { type: actions.INCREMENT_OFFERINGS_AVAILABILITY_COUNTER, value: counter};},
};

interface AsyncProviders {
    [key: string] : Function;
}

export const asyncProviders: AsyncProviders = {
    updateAccounts: function(){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getAccounts()
               .then(accounts => {
                   dispatch(handlers.updateAccounts(accounts));
               });
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
    updateSettings: function(){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getSettings()
                .then(settings => {
                    dispatch(handlers.updateSettings(Object.keys(settings).reduce((acc, key) => {
                        acc[key] = settings[key].value;
                        return acc;
                    }, {})));
                });
        };
    },
    updateLocalSettings: function(){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getLocal()
                .then(localSettings => {
                    dispatch(handlers.updateLocalSettings(localSettings));
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
    setMode: function(mode:Role, history: any, t: any){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();
            ws.getUserRole()
               .then(role => {
                   // TODO check if error
                   dispatch(handlers.setMode(role));
               });
        };
    },
    setOfferingsAvailability: function(offeringsIds:string[]){
        return function(dispatch: any, getState: Function){
            const { ws } = getState();

            dispatch(handlers.incrementOfferingsAvailabilityCounter(offeringsIds.length));

            offeringsIds.forEach((offeringId) => {
                ws.pingOfferings([offeringId])
                    .then(offeringsAvailability => {
                        dispatch(handlers.setOfferingsAvailability([offeringsAvailability]));
                    });
            });

        };
    }
};

export default handlers;
