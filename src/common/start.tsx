import * as React from 'react';
import { Route, Router, Switch} from 'react-router';
import { createMemoryHistory } from 'history';
import {asyncReactor} from 'async-reactor';

import Wizard from './wizard/';
import Login from './auth/login';
import App from './app';

import * as api from 'utils/api';

import { I18nextProvider} from 'react-i18next';
import i18n from 'i18next/init';

import initElectronMenu from './electronMenu';

function Loader() {

  return (<h2>Loading settings ...</h2>);

}

async function AsyncStart (props:any){
    const settings = await api.settings.getLocal();

    i18n.changeLanguage(settings.lang);

    // From custom electron menu
    initElectronMenu();

    const MemoryHistory = createMemoryHistory();

    const login = <Router history={MemoryHistory as any}>
        <Switch>
            <Route exact path='/' render={() => <Login entryPoint={'/app'} />} />
            <Route path='/app' component={App} />
        </Switch>
    </Router>;

     return <I18nextProvider i18n={ i18n }>
                { settings.firstStart || !settings.accountCreated ? <Wizard currentState={settings.firstStart ? 'firstStart' : 'setAccount'} app={App} /> :  login }
            </I18nextProvider>;
}

export default asyncReactor(AsyncStart, Loader);
