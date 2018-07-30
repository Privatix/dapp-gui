import * as api from '../utils/api';
import notice from '../utils/notice';
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
    UPDATE_OFFERINGS
}


interface ReduxHandlers {
    [key: string]: Function;
}

const handlers: ReduxHandlers = {
    updateAccounts             : function(accounts: Account[]){ return { type: actions.REFRESH_ACCOUNTS, value: accounts };},
    updateProducts             : function(products: Product[]){ return { type: actions.UPDATE_PRODUCTS, value: products };},
    updateSettings             : function(settings: Setting[]){ return { type: actions.UPDATE_SETTINGS, value: settings };},
    updateOfferings            : function(offerings: Offering[]){ return { type: actions.UPDATE_OFFERINGS, value: offerings };},
    setMode                    : function(mode: Mode){ return { type: actions.SET_MODE, value: mode };}
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
            api.settings.get()
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
    setMode: function(mode:Mode, history: any){
        return function(dispatch: any){
            api.setUserMode(mode)
               .then(res => {
                   // TODO check if error
                   dispatch(handlers.setMode(mode));
                   if (res.message === 'updated.') {
                       if (mode === Mode.AGENT) {
                           history.push('/');
                       } else {
                           history.push('/client-dashboard-start');
                       }
                       notice({level: 'info', title: 'Congratulations!', msg: 'User mode was successfully switched to ' + mode.toUpperCase()});
                   } else {
                       notice({level: 'error', title: 'Attention!', msg: 'Something went wrong!'});
                   }
               });
        };
    }
};

export default handlers;
