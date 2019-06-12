import * as React from 'react';
import { Route, Router, Switch} from 'react-router';
import { createMemoryHistory } from 'history';

import Wizard from './wizard/';
import Login from './auth/login';
import App from './app';

import { I18nextProvider} from 'react-i18next';
import i18n from 'i18next/init';

import initElectronMenu from './electronMenu';

import {LocalSettings} from 'typings/settings';

interface IProps {
    localSettings?: LocalSettings;
}

interface IState {
    component: any;
}

const memoryHistory = createMemoryHistory();

const login = <Switch>
        <Route exact path='/' render={() => <Login entryPoint={'/app'} />} />
        <Route path='/app' component={App} />
    </Switch>;

const wizardFirstStart = <Wizard currentState={'firstStart'} app={App} />;

const wizardCreateAcc = <Switch>
        <Route exact path='/' render={() => <Login entryPoint={'/wizardSetAccount'} />} />
        <Route path='/wizardSetAccount' render={() => <Wizard currentState={'setAccount'} app={App} />} />
    </Switch>;

export default class Start extends React.Component<IProps, IState> {

    constructor(props: IProps){

        super(props);

        const localSettings = JSON.parse(window.localStorage.getItem('localSettings'));
        i18n.changeLanguage(localSettings.lang);
        initElectronMenu();

        let component;
        if(localSettings.firstStart){
            component = wizardFirstStart;
        }else if(!localSettings.accountCreated){
            component = wizardCreateAcc;
        }else{
            component = login;
        }

        this.state =  { component };
    }

    render(){

        return (
            <Router history={memoryHistory}>
                <I18nextProvider i18n={ i18n }>
                    {this.state.component}
                </I18nextProvider>
            </Router>
         );
    }
}
