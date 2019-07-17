import * as React from 'react';
import { Provider } from 'react-redux';
import { Route, Router, Switch} from 'react-router';
import { createMemoryHistory } from 'history';

import * as api from 'utils/api';
import { createStorage } from 'utils/storage';
import handlers from 'redux/actions';

import Wizard from './wizard/';
import Login from './auth/login';
import App from './app';

import DotProgress from 'common/progressBars/dotProgress';
import ExternalLink from 'common/etc/externalLink';

import { I18nextProvider} from 'react-i18next';
import i18n from 'i18next/init';

import initElectronMenu from './electronMenu';

import { Role } from 'typings/mode';

interface IState {
    component: any;
    started: boolean;
    storage: any;
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

export default class Start extends React.Component<{}, IState> {

    private mount = false;

    constructor(props: {}){

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

        this.state = { started: false, component, storage: null };
    }

    componentDidMount(){
        this.mount = true;
        this.startWatchingSupervisor();
    }

    componentWillUnmount(){
        this.mount = false;
    }

    private startWatchingSupervisor = async () => {
        if(!this.mount){
            return;
        }

        const { started } = this.state;

        if(started){
            return;
        }

        const { role, supervisorEndpoint } = await api.settings.getLocal();
        if(role === Role.CLIENT){
            try{
                const res = await fetch(`${supervisorEndpoint}/start`);
                if(res.status === 200){
                    const storage = createStorage();
                    const localSettings = JSON.parse(window.localStorage.getItem('localSettings'));
                    storage.dispatch(handlers.setMode(localSettings.mode ? localSettings.mode : 'simple'));
                    this.setState({started: true, storage});
                }else{
                    setTimeout(this.startWatchingSupervisor, 1000);
                }
            }catch (e){
                setTimeout(this.startWatchingSupervisor, 1000);
            }
        }else{
            const storage = createStorage();
            this.setState({started: true, storage});
        }
    }

    render() {

        const { started, component, storage } = this.state;

        return started ? (
            <Provider store={storage}>
                <Router history={memoryHistory}>
                    <I18nextProvider i18n={ i18n }>
                        { component }
                    </I18nextProvider>
                </Router>
            </Provider>
        ):(
            <div className='startingServiceWrap'>
                <I18nextProvider i18n={ i18n }>
                    <div style={ {textAlign: 'center', margin: 'auto'} }>
                        <h6>{ i18n.t('start:StartingServices') }<DotProgress /></h6>

                        <div className='text-center m-t-15 m-b-15'>
                            <div className='lds-dual-ring'></div>
                        </div>

                        <div>{ i18n.t('start:UsuallyItTakes') }</div>
                        <div>{ i18n.t('start:IfSomethingWentWrong') }</div>&nbsp;
                        <ExternalLink href='https://privatix.atlassian.net/wiki/spaces/BVP/pages/297304077/How+to+detect+a+trouble+cause'>
                            { i18n.t('start:HowToDetectATroubleCause') }
                        </ExternalLink>
                    </div>
                </I18nextProvider>
            </div>
        );
    }
}
