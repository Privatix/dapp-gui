import * as React from 'react';
import { Route, Router, Switch} from 'react-router';
import { createMemoryHistory } from 'history';

import SetLanguage from './setLanguage';
import SetPassword from './setPassword';
import SetAccount from './setAccount';
import GenerateKey from './generateKey';
import ImportHexKey from './importHexKey';
import ImportJsonKey from './importJsonKey';
import Backup from './backup';
import GetPrix from './getPrix';

import Login from 'common/auth/login';

type WizardState = 'firstStart' | 'setAccount' | 'createAccount';

interface IProps {
    currentState: WizardState;
    app: React.ComponentType;
}

interface IState {

}

export default class Wizard extends React.Component<IProps, IState> {

    render(){

        const { currentState, app } = this.props;
        const MemoryHistory = createMemoryHistory();

        if(currentState === 'firstStart'){
            return (
                <Router history={MemoryHistory}>
                    <Switch>
                        <Route exact path='/' component={SetLanguage} />
                        <Route exact path='/setPassword' component={SetPassword} />
                        <Route path='/setAccount' render={() => <SetAccount isDefault={true} /> } />
                        <Route path='/generateKey/:default' render={ (props:any) => <GenerateKey isDefault={props.match.params.default==='true'} /> } />
                        <Route path='/importHexKey/:default' render={ (props:any) => <ImportHexKey isDefault={props.match.params.default==='true'} /> } />
                        <Route path='/importJsonKey/:default' render={ (props:any) => <ImportJsonKey isDefault={props.match.params.default==='true'} /> } />
                        <Route path='/backup/:accountId/:from'
                               render={(props: any) => <Backup entryPoint={'/app'}
                                                               accountId={props.match.params.accountId}
                                                               from={props.match.params.from}
                                                       />
                                      }
                        />
                        <Route path='/getPrix/:accountId'
                               render={(props: any) => <GetPrix entryPoint={'/app'}
                                                                accountId={props.match.params.accountId}
                                                       />
                                      }
                        />
                        <Route path='/login' component={Login} />
                        <Route path='/app' component={app} />
                    </Switch>
                </Router>
            );
        }

        if(currentState === 'setAccount'){
            return (
                <Router history={MemoryHistory}>
                    <Switch>
                        <Route exact path='/' render={() => <Login entryPoint={'/setAccount'} />} />
                        <Route path='/setAccount' render={() => <SetAccount default={true} /> } />
                        <Route path='/generateKey/:default' render={ (props:any) => <GenerateKey isDefault={props.match.params.default==='true'} /> } />
                        <Route path='/importHexKey/:default' render={ (props:any) => <ImportHexKey isDefault={props.match.params.default==='true'} /> } />
                        <Route path='/importJsonKey/:default' render={ (props:any) => <ImportJsonKey isDefault={props.match.params.default==='true'} /> } />
                        <Route path='/backup/:accountId/:from'
                               render={(props: any) => <Backup entryPoint={'/app'}
                                                               accountId={props.match.params.accountId}
                                                               from={props.match.params.from}
                                                       />
                                      }
                        />
                        <Route path='/getPrix/:accountId'
                               render={(props: any) => <GetPrix entryPoint={'/app'}
                                                                accountId={props.match.params.accountId}
                                                       />
                                      }
                        />
                        <Route path='/app' component={app} />
                    </Switch>
                </Router>
            );
        }

        if(currentState === 'createAccount'){
            return (
                <Router history={MemoryHistory}>
                    <Switch>
                        <Route exact path='/' render={() => <SetAccount default={false} /> } />
                        <Route exact path='/setAccount' render={() => <SetAccount default={false} /> } />
                        <Route path='/generateKey/:default' render={ (props:any) => <GenerateKey isDefault={props.match.params.default==='true'} /> } />
                        <Route path='/importHexKey/:default' render={ (props:any) => <ImportHexKey isDefault={props.match.params.default==='true'} /> } />
                        <Route path='/importJsonKey/:default' render={ (props:any) => <ImportJsonKey isDefault={props.match.params.default==='true'} /> } />
                        <Route path='/backup/:accountId/:from'
                               render={(props: any) => <Backup entryPoint={'/app'}
                                                               accountId={props.match.params.accountId}
                                                               from={props.match.params.from}
                                                       />
                                      }
                        />
                        <Route path='/getPrix/:accountId'
                               render={(props: any) => <GetPrix entryPoint={'/app'}
                                                                accountId={props.match.params.accountId}
                                                       />
                                      }
                        />
                        <Route path='/app' component={app} />
                    </Switch>
                </Router>
            );
        }

        return null;
    }
}
