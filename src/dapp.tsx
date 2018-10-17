// tslint:disable-next-line
import * as React from 'react';
// tslint:disable-next-line

import { render } from 'react-dom';
import Start from './components/start';
import {LocalSettings} from './typings/settings';
import * as api from './utils/api';
import { registerBugsnag } from './utils/bugsnag';


(async () => {
    const settings = (await api.settings.getLocal()) as LocalSettings;
    if (settings.bugsnagEnable) {
        registerBugsnag(window, settings.bugsnagKey, settings.release, settings.commit);
    }
})();

render(<Start />, document.getElementById('app'));







