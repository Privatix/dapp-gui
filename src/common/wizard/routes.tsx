import * as React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router';

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

class Routes extends React.Component<IProps, {}> {

    render(){

        const { currentState, app, mode: _mode, role } = this.props;

        if(!role){
            return null;
        }

        const mode = _mode ? _mode : (role === Role.AGENT ? Mode.ADVANCED : Mode.SIMPLE);
        if( role === Role.AGENT || mode === Mode.ADVANCED ){
            let routes = [
                <Route key='/generateKey/' path='/generateKey/:default' render={ (props:any) => <GenerateKey isDefault={props.match.params.default==='true'} /> } />,
                <Route key='/importHexKey/' path='/importHexKey/:default' render={ (props:any) => <ImportHexKey isDefault={props.match.params.default==='true'} /> } />,
                <Route key='/importJsonKey/' path='/importJsonKey/:default' render={ (props:any) => <ImportJsonKey isDefault={props.match.params.default==='true'} /> } />,
                <Route key='/backup/' path='/backup/:accountId/:from'
                       render={(props: any) => <Backup entryPoint={'/app'}
                                                       accountId={props.match.params.accountId}
                                                       from={props.match.params.from}
                                               />
                              }
                />,
                <Route key='/getPrix/' path='/getPrix/:accountId'
                       render={(props: any) => <GetPrix entryPoint={'/app'}
                                                        accountId={props.match.params.accountId}
                                               />
                              }
                />,
                <Route key='/app' path='/app' component={app} />
            ];

            if(currentState === 'firstStart'){
                routes.push(
                    <Route key='/' exact path='/' render={() => <SetLanguage mode={mode} role={role} />} />,
                    <Route key='/setPassword' exact path='/setPassword' render={() => <SetPassword mode={mode} />} />,
                    <Route key='/setAccount' path='/setAccount' render={() => <SetAccount isDefault={true} /> } />,
                    <Route key='/login' path='/login' component={Login} />
                );
            }

            if(currentState === 'setAccount'){
                routes.push(
                    <Route key='/' exact path='/' render={() => <SetAccount isDefault={true} />} />,
                    <Route key='/setAccount' path='/setAccount' render={() => <SetAccount isDefault={true} /> } />
                );
            }

            if(currentState === 'createAccount'){
                routes.push(
                    <Route key='/' exact path='/' render={() => <SetAccount isDefault={false} /> } />,
                    <Route key='/setAccount' exact path='/setAccount' render={() => <SetAccount isDefault={false} /> } />
                );
            }

            return (
                <>
                    { routes }
                </>
            );
        }

        if( mode === Mode.SIMPLE || mode === Mode.WIZARD){
            let routes = [
                <Route key='/getPrix/' path='/getPrix/:accountId'
                       render={(props: any) => <GetPrix entryPoint={'/app'}
                                                        accountId={props.match.params.accountId}
                                               />
                              }
                />,
                <Route key='/app' path='/app' component={app} />,
                <Route key='/backup/' path='/backup/:accountId/:from'
                       render={(props: any) => <Backup entryPoint={'/app'}
                                                       accountId={props.match.params.accountId}
                                                       from={props.match.params.from}
                                               />
                              }
                />,
            ];

            if(currentState === 'firstStart'){
                routes.push(
                    <Route key='/' exact path='/' render={() => <SetLanguage mode={mode} role={role} />} />,
                    <Route key='/setPassword' exact path='/setPassword' render={() => <SetPassword mode={mode} />} />,
                    <Route key='/setAccount' path='/setAccount' render={() => <SetAccount isDefault={true} /> } />,
                    <Route key='/login' path='/login' component={Login} />
                );
            }

            if(currentState === 'setAccount'){
                routes.push(
                    <Route key='/' path='/'
                           render={() => <GetPrix entryPoint={'/app'}
                                                            accountId=''
                                                   />
                                  }
                    />,
                    <Route key='/setAccount' path='/setAccount' render={() => <SetAccount isDefault={true} /> } />
                );
            }

            if(currentState === 'createAccount'){
                routes.push(
                    <Route key='/' exact path='/' render={() => <SetAccount isDefault={false} /> } />,
                    <Route key='/setAccount' exact path='/setAccount' render={() => <SetAccount isDefault={false} /> } />
                );
            }

            return (
                <>
                    { routes }
                </>
            );
        }
    }
}

export default connect( (state: State) => ({role: state.role, mode: state.mode}) )(Routes);
