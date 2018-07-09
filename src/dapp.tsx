// tslint:disable-next-line
import * as React from 'react';
// tslint:disable-next-line

import { render } from 'react-dom';
import Start from './components/start';
import {fetch} from './utils/fetch';
import {LocalSettings} from './typings/settings';
import { registerBugsnag } from './utils/bugsnag';

(async () => {
    const settings = (await fetch('/localSettings', {})) as LocalSettings;
    if (settings.bugsnagEnable) {
        registerBugsnag(window, settings.bugsnagKey, settings.release);
    }
})();

render(<Start />, document.getElementById('app'));







