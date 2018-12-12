import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducers from 'redux/reducers';

export const store = createStore(reducers, applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
  ));
