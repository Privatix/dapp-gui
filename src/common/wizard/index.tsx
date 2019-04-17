import * as React from 'react';
import { connect } from 'react-redux';
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

import { State } from 'typings/state';
import { Role, Mode } from 'typings/mode';

type WizardState = 'firstStart' | 'setAccount' | 'createAccount';

interface IProps {
    mode?: Mode;
    currentState: WizardState;
    app: React.ComponentType;
    role: Role;
}

class Wizard extends React.Component<IProps, {}> {

    render(){

        const { currentState, app, mode: _mode, role } = this.props;

        if(!role){
            return null;
        }
        const MemoryHistory = createMemoryHistory();

        const mode = _mode ? _mode : (role === Role.AGENT ? Mode.ADVANCED : Mode.SIMPLE);

        if( mode === Mode.ADVANCED){
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

        if( mode === Mode.SIMPLE){
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

export default connect( (state: State) => ({role: state.role}) )(Wizard);
