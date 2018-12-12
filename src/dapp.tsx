import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import Start from 'common/start';

import * as api from 'utils/api';
import { registerBugsnag } from 'utils/bugsnag';
import { store } from 'utils/storage';

import {LocalSettings} from 'typings/settings';

(async () => {
    const settings = (await api.settings.getLocal()) as LocalSettings;
    if (settings.bugsnagEnable) {
        registerBugsnag(window, settings.bugsnagKey, settings.release, settings.commit);
    }
})();

render(<Provider store={store}><Start /></Provider>, document.getElementById('app'));
