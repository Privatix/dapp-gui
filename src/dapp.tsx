import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import Start from 'common/start';

import * as api from 'utils/api';
import { registerBugsnag } from 'utils/bugsnag';
import reducers from 'redux/reducers';

import {LocalSettings} from 'typings/settings';

(async () => {
    const settings = (await api.settings.getLocal()) as LocalSettings;
    if (settings.bugsnag.enable) {
        await registerBugsnag(window, settings.bugsnag.key, settings.release, settings.commit, settings.bugsnag.userid);
    }
})();

const store = createStore(reducers, applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
  ));

render(<Provider store={store}><Start /></Provider>, document.getElementById('app'));







