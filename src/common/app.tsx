import * as React from 'react';

import { connect } from 'react-redux';
import { Route, Router, Switch} from 'react-router';
import { withRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import Navigation from './navigation/navigation';
import Header from './header';
import Settings from './settings/';

import Wizard from './wizard/';

import Main from 'agent/main/';
import Products from 'agent/products/';
import Offerings from 'agent/offerings/';
import ChannelsList from 'agent/channels/channelsList';
import ChannelsByStatus from 'agent/channels/channelsByStatus';
import SessionsList from 'agent/sessions/sessionsList';

import AccountsList from './accounts/accountsList';
import ClientDashboardStart from 'client/dashboard/startVPNBtn';
import LightClient from 'client/lightweightMode/';
import ClientDashboardConnecting from 'client/dashboard/connecting';
import VPNList from 'client/vpn_list/list/';
import AcceptOffering from 'client/vpn_list/acceptOffering';
import ClientHistory from 'client/vpn_list/history';


import Logs from 'common/logs/logsList';

import { State } from 'typings/state';
import { Role, Mode } from 'typings/mode';

const MemoryHistory = createMemoryHistory();

interface IProps {
    role: Role;
    mode: Mode;
    dispatch?: any;
}

class App extends React.Component<IProps, {}> {

    render(){

        const { role, mode } = this.props;

        if(role === Role.CLIENT && mode === Mode.SIMPLE){
            return <LightClient />;
        }

        const app = (
            <Router history={MemoryHistory}>
                <div id='wrapper'>
                    <Header />
                    <Navigation />
                    <div className='content-page'>
                        <div className='content'>
                            <Switch>
                                <Route exact path='/' render={(props: any) => role === Role.CLIENT ? <ClientDashboardStart /> : <Main /> } />
                                <Route path='/settings' component={Settings} />
                                <Route path='/products' render={() => <Products />} />
                                <Route path='/accounts' component={AccountsList} />
                                <Route path='/offerings/:product' render={(props: any) => <Offerings product={props.match.params.product} statuses={[]} />} />
                                <Route path='/offeringsByStatus/:page' render={(props: any) => <Offerings
                                    product={props.match.params.product}
                                    statuses={props.match.params.page === 'active' ? ['registering', 'registered', 'popping_up', 'popped_up', 'removing'] : ['removed']}
                                    page={props.match.params.page} />} />
                                <Route path='/channels' component={ChannelsList} />
                                <Route path='/channelsByStatus/:status' render={(props: any) => <ChannelsByStatus status={props.match.params.status} />} />
                                <Route path='/sessions/:channel' render={(props: any) => <SessionsList channel={props.match.params.channel} /> } />
                                <Route path='/setAccount' render={() => <Wizard currentState='createAccount' app={AccountsList} mode={Mode.ADVANCED} />} />
                                <Route path='/logs' component={Logs} />

                                <Route exact path='/client-dashboard-start' component={ClientDashboardStart} />
                                <Route exact path='/client-dashboard-connecting' component={ClientDashboardConnecting} />
                                <Route exact path='/client-vpn-list' component={VPNList} />
                                <Route exact path='/accept-offering' component={AcceptOffering} />
                                <Route exact path='/client-history' component={ClientHistory} />
                            </Switch>
                        </div>
                    </div>
                </div>
            </Router>
        );

        return app;
    }
}

export default connect<IProps>((state:State) => ({ role: state.role, mode: state.mode}))(withRouter(App));
