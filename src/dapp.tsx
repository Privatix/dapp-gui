// tslint:disable-next-line
import * as React from 'react';
// tslint:disable-next-line

import { render } from 'react-dom';
import Start from './components/start';
import {LocalSettings} from './typings/settings';
import * as api from './utils/api';
import { registerBugsnag } from './utils/bugsnag';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducers from './redux/reducers';

(async () => {
    const settings = (await api.settings.getLocal()) as LocalSettings;
    if (settings.bugsnagEnable) {
        registerBugsnag(window, settings.bugsnagKey, settings.release, settings.commit);
    }
})();

const store = createStore(reducers, applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
  ));

render(<Provider store={store}><Start /></Provider>, document.getElementById('app'));







