import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Router, Switch} from 'react-router';
import { createMemoryHistory } from 'history';

import Wizard from './wizard/';
import Login from './auth/login';
import App from './app';

import { I18nextProvider} from 'react-i18next';
import i18n from 'i18next/init';

import initElectronMenu from './electronMenu';

import {State} from 'typings/state';
import {LocalSettings} from 'typings/settings';

interface IProps {
    localSettings?: LocalSettings;
}

interface IState {

}

class Start extends React.Component<IProps, IState> {

    MemoryHistory: any = null;

    componentDidMount(){

        const { localSettings } = this.props;

        i18n.changeLanguage(localSettings.lang);

        // From custom electron menu
        initElectronMenu();

        this.MemoryHistory = createMemoryHistory();
    }

    render(){

        const { localSettings: { firstStart, accountCreated } } = this.props;

        const login = <Router history={this.MemoryHistory as any}>
            <Switch>
                <Route exact path='/' render={() => <Login entryPoint={'/app'} />} />
                <Route path='/app' component={App} />
            </Switch>
        </Router>;

         return (
             <I18nextProvider i18n={ i18n }>
                 { firstStart || !accountCreated ? <Wizard currentState={firstStart ? 'firstStart' : 'setAccount'} app={App} /> :  login }
             </I18nextProvider>
         );
    }
}

export default connect( (state: State) => ({localSettings: state.localSettings}) )(Start);
