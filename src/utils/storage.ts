import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import reducers from 'redux/reducers';
import { asyncProviders } from 'redux/actions';

const storage = createStore(reducers, applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
  ));

const refresh = function(){

    const { ws } = storage.getState();

    if(ws){
        storage.dispatch(asyncProviders.updateAccounts());
    }

    setTimeout(refresh, 3000);
};

refresh();

export const store = storage;
