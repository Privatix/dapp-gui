import * as React from 'react';
import { connect } from 'react-redux';
import { Router, Switch } from 'react-router';
import { createMemoryHistory } from 'history';

import Routes from './routes';
import Noticer from 'common/noticer';

import { State } from 'typings/state';
import { Role } from 'typings/mode';
import ExternalLinkWarning from 'common/externalLinkWarning';

type WizardState = 'firstStart' | 'setAccount' | 'createAccount';

interface IProps {
    currentState: WizardState;
    app: React.ComponentType;
    role: Role;
}

class Wizard extends React.Component<IProps, {}> {

    render(){

        const { currentState, app, role } = this.props;

        if(!role){
            return null;
        }
        const MemoryHistory = createMemoryHistory();

        return (
            <>
                <Noticer />
                <ExternalLinkWarning />
                <Router history={MemoryHistory}>
                    <Switch>
                        <Routes app={app} currentState={currentState} />
                    </Switch>
                </Router>
            </>
        );
    }
}

export default connect( (state: State) => ({role: state.role}) )(Wizard);
