import * as React from 'react';
import { Route, Router, Switch} from 'react-router';
import { createMemoryHistory } from 'history';

import Wizard from './wizard/';
import Login from './auth/login';
import App from './app';

import DotProgress from 'common/progressBars/dotProgress';
import ExternalLink from 'common/etc/externalLink';

import { I18nextProvider} from 'react-i18next';
import i18n from 'i18next/init';

import initElectronMenu from './electronMenu';

interface IState {
    component: any;
    started: boolean;
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

        this.state = { started: false, component };
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

        const localSettings = JSON.parse(window.localStorage.getItem('localSettings'));
        const { supervisorEndpoint } = localSettings;

        try{
            const res = await fetch(`${supervisorEndpoint}/start`);
            if(res.status === 200){
                this.setState({started: true});
            }else{
                setTimeout(this.startWatchingSupervisor, 1000);
            }
        }catch (e){
            setTimeout(this.startWatchingSupervisor, 1000);
        }
    }

    render(){

        const { started, component } = this.state;

        return started ? (
            <Router history={memoryHistory}>
                <I18nextProvider i18n={ i18n }>
                    { component }
                </I18nextProvider>
            </Router>
         ):(
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
         );
    }
}
