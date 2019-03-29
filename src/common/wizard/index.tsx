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
    mode: string;
    currentState: WizardState;
    app: React.ComponentType;
}

export default class Wizard extends React.Component<IProps, {}> {

    render(){

        const { currentState, app, mode } = this.props;
        const MemoryHistory = createMemoryHistory();

        if( mode === 'advanced'){
            let routes = [
                <Route path='/generateKey/:default' render={ (props:any) => <GenerateKey isDefault={props.match.params.default==='true'} /> } />,
                <Route path='/importHexKey/:default' render={ (props:any) => <ImportHexKey isDefault={props.match.params.default==='true'} /> } />,
                <Route path='/importJsonKey/:default' render={ (props:any) => <ImportJsonKey isDefault={props.match.params.default==='true'} /> } />,
                <Route path='/backup/:accountId/:from'
                       render={(props: any) => <Backup entryPoint={'/app'}
                                                       accountId={props.match.params.accountId}
                                                       from={props.match.params.from}
                                               />
                              }
                />,
                <Route path='/getPrix/:accountId'
                       render={(props: any) => <GetPrix entryPoint={'/app'}
                                                        accountId={props.match.params.accountId}
                                               />
                              }
                />,
                <Route path='/app' component={app} />
            ];

            if(currentState === 'firstStart'){
                routes.push(
                    <Route exact path='/' render={() => <SetLanguage mode={mode} />} />,
                    <Route exact path='/setPassword' render={() => <SetPassword mode={mode} />} />,
                    <Route path='/setAccount' render={() => <SetAccount isDefault={true} /> } />,
                    <Route path='/login' component={Login} />
                );
            }

            if(currentState === 'setAccount'){
                routes.push(
                    <Route exact path='/' render={() => <Login entryPoint={'/setAccount'} />} />,
                    <Route path='/setAccount' render={() => <SetAccount isDefault={true} /> } />
                );
            }

            if(currentState === 'createAccount'){
                routes.push(
                    <Route exact path='/' render={() => <SetAccount isDefault={false} /> } />,
                    <Route exact path='/setAccount' render={() => <SetAccount isDefault={false} /> } />
                );
            }

            return (
                <Router history={MemoryHistory}>
                    <Switch>
                        { routes }
                    </Switch>
                </Router>
            );
        }

        if( mode === 'simple'){
            let routes = [
                <Route path='/getPrix/:accountId'
                       render={(props: any) => <GetPrix entryPoint={'/app'}
                                                        accountId={props.match.params.accountId}
                                               />
                              }
                />,
                <Route path='/app' component={app} />
            ];

            if(currentState === 'firstStart'){
                routes.push(
                    <Route exact path='/' render={() => <SetLanguage mode={mode} />} />,
                    <Route exact path='/setPassword' render={() => <SetPassword mode={mode} />} />,
                    <Route path='/setAccount' render={() => <SetAccount isDefault={true} /> } />,
                    <Route path='/login' component={Login} />
                );
            }

            if(currentState === 'setAccount'){
                routes.push(
                    <Route path='/'
                           render={(props: any) => <GetPrix entryPoint={'/app'}
                                                            accountId=''
                                                   />
                                  }
                    />,
                    <Route path='/setAccount' render={() => <SetAccount isDefault={true} /> } />
                );
            }

            if(currentState === 'createAccount'){
                routes.push(
                    <Route exact path='/' render={() => <SetAccount isDefault={false} /> } />,
                    <Route exact path='/setAccount' render={() => <SetAccount isDefault={false} /> } />
                );
            }

            return (
                <Router history={MemoryHistory}>
                    <Switch>
                        { routes }
                    </Switch>
                </Router>
            );
        }
    }
}
