import * as api from '../utils/api';
import {Account} from '../typings/accounts';
import {Product} from '../typings/products';
import {DbSetting as Setting} from '../typings/settings';
import {Offering} from '../typings/offerings';
import {Mode} from '../typings/mode';

export const enum actions {
    REFRESH_ACCOUNTS,
    SET_MODE,
    UPDATE_PRODUCTS,
    UPDATE_SETTINGS,
    UPDATE_OFFERINGS,
    SET_CHANNEL
}


interface ReduxHandlers {
    [key: string]: Function;
}

const handlers: ReduxHandlers = {
    updateAccounts             : function(accounts: Account[]){ return { type: actions.REFRESH_ACCOUNTS, value: accounts };},
    updateProducts             : function(products: Product[]){ return { type: actions.UPDATE_PRODUCTS, value: products };},
    updateSettings             : function(settings: Setting[]){ return { type: actions.UPDATE_SETTINGS, value: settings };},
    updateOfferings            : function(offerings: Offering[]){ return { type: actions.UPDATE_OFFERINGS, value: offerings };},
    setMode                    : function(mode: Mode){ return { type: actions.SET_MODE, value: mode };},
    setChannel                 : function(channelId: string){ return { type: actions.SET_CHANNEL, value: channelId };}
};

interface AsyncProviders {
    [key: string] : Function;
}

export const asyncProviders: AsyncProviders = {
    updateAccounts: function(){
        return function(dispatch: any){
            api.accounts.getAccounts()
               .then(accounts => {
                    dispatch(handlers.updateAccounts(accounts));
               });
        };
    },
    updateProducts: function(){
        return function(dispatch: any){
            api.products.getProducts()
               .then(products => {
                   dispatch(handlers.updateProducts(products));
               });
        };
    },
    updateSettings: function(){
        return function(dispatch: any){
            (window as any).ws.getSettings()
                .then(settings => {
                    dispatch(handlers.updateSettings(settings));
                });
        };
    },
    updateOfferings: function(){
        return function(dispatch: any){
            api.offerings.getOfferings()
                .then(offerings => {
                    dispatch(handlers.updateOfferings(offerings));
                });
        };
    },
    setMode: function(mode:Mode, history: any, t: any){
        return function(dispatch: any){
            api.getUserRole()
               .then(role => {
                   // TODO check if error
                   dispatch(handlers.setMode(role));
               });
        };
    }
};

export default handlers;
