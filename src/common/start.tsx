import * as React from 'react';
import { Route, Router, Switch} from 'react-router';
import { createMemoryHistory } from 'history';
import {asyncReactor} from 'async-reactor';

import SetLanguage from './auth/setLanguage';
import SetPassword from './auth/setPassword';
import SetAccount from './auth/setAccount';
import GenerateKey from './auth/generateKey';
import ImportHexKey from './auth/importHexKey';
import ImportJsonKey from './auth/importJsonKey';
import Backup from './auth/backup';
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
    const wizard = <Router history={MemoryHistory as any}>
        <Switch>
            <Route exact path='/' component={SetLanguage} />
            <Route exact path='/setPassword' component={SetPassword} />
            <Route path='/setAccount' render={() => <SetAccount default={true} /> } />
            <Route path='/generateKey/:default' render={ (props:any) => <GenerateKey default={props.match.params.default} /> } />
            <Route path='/importHexKey/:default' render={ (props:any) => <ImportHexKey default={props.match.params.default} /> } />
            <Route path='/importJsonKey/:default' component={ (props:any) => <ImportJsonKey default={props.match.params.default} /> } />
            <Route path='/backup/:accountId/:from' render={(props: any) => <Backup entryPoint={'/app'}
                                                                                    accountId={props.match.params.accountId}
                                                                                    from={props.match.params.from}/>}
                                                                            />
            <Route path='/login' component={Login} />
            <Route path='/app' component={App} />
        </Switch>
    </Router>;

    const setAccount = <Router history={MemoryHistory as any}>
        <Switch>
            <Route exact path='/' render={() => <Login entryPoint={'/setAccount'} />} />
            <Route path='/setAccount' render={() => <SetAccount default={true} /> } />
            <Route path='/generateKey/:default' render={ (props:any) => <GenerateKey default={props.match.params.default} /> } />
            <Route path='/importHexKey/:default' render={ (props:any) => <ImportHexKey default={props.match.params.default} /> } />
            <Route path='/importJsonKey/:default' component={ (props:any) => <ImportJsonKey default={props.match.params.default} /> } />
            <Route path='/backup/:accountId/:from' render={(props: any) => <Backup entryPoint={'/app'}
                                                                                   accountId={props.match.params.accountId}
                                                                                   from={props.match.params.from}/>}
                                                                            />
            <Route path='/app' component={App} />
        </Switch>
    </Router>;

    const login = <Router history={MemoryHistory as any}>
        <Switch>
            <Route exact path='/' render={() => <Login entryPoint={'/app'} />} />
            <Route path='/app' component={App} />
        </Switch>
    </Router>;

     return <I18nextProvider i18n={ i18n }>
                { settings.firstStart ? wizard : settings.accountCreated ? login : setAccount}
            </I18nextProvider>;
}

export default asyncReactor(AsyncStart, Loader);
