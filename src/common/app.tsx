import * as React from 'react';

import { connect } from 'react-redux';
import { Route, Router, Switch} from 'react-router';
import { withRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import Navigation from './navigation/navigation';
import Header from './header';
import Settings from './settings/';

import SetAccount from './auth/setAccount';
import GenerateKey from './auth/generateKey';
import ImportHexKey from './auth/importHexKey';
import ImportJsonKey from './auth/importJsonKey';
import Backup from './auth/backup';

import Main from 'agent/main/';
import Products from 'agent/products/';
import Offerings from 'agent/offerings/';
import ChannelsList from 'agent/channels/channelsList';
import ChannelsByStatus from 'agent/channels/channelsByStatus';
import SessionsList from 'agent/sessions/sessionsList';

import AccountsList from './accounts/accountsList';
import ClientDashboardStart from 'client/dashboard/startVPNBtn';
import ClientDashboardConnecting from 'client/dashboard/connecting';
import VPNList from 'client/vpn_list/list/';
import AcceptOffering from 'client/vpn_list/acceptOffering';
import ClientHistory from 'client/vpn_list/history';


import Logs from 'agent/logs/logsList';

import { Role } from 'typings/mode';

const MemoryHistory = createMemoryHistory();

interface Props {
    mode: Role;
    dispatch: any;
}

class App extends React.Component<Props, any> {

    constructor(props: Props) {
        super(props);
    }

    render(){

        const { mode } = this.props;

        return <Router history={MemoryHistory as any}>
                <div id='wrapper'>
                    <Header />
                    <Navigation />
                    <div className='content-page'>
                        <div className='content'>
                            <Switch>
                                <Route exact path='/' render={(props: any) => mode === Role.CLIENT ? <ClientDashboardStart /> : <Main /> } />
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
                                <Route path='/setAccount' render={() => <SetAccount default={false} />} />
                                <Route path='/generateKey/:default' render={ (props:any) => <GenerateKey default={props.match.params.default} /> } />
                                <Route path='/importHexKey/:default' render={ (props:any) => <ImportHexKey default={props.match.params.default} /> } />
                                <Route path='/importJsonKey/:default' render={ (props:any) => <ImportJsonKey default={props.match.params.default} /> } />
                                <Route path='/backup/:accountId/:from'
                                        render={ (props:any) => <Backup entryPoint={'/accounts'}
                                                                        accountId={props.match.params.accountId}
                                                                        from={props.match.params.from}
                                                                />
                                               }
                                />
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
            </Router>;
    }
}

export default connect(state => state)(withRouter(App));
