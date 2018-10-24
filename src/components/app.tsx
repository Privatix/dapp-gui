// tslint:disable-next-line
import * as React from 'react';
// tslint:disable-next-line

import { connect } from 'react-redux';
import { Route, Router, Switch} from 'react-router';
import { withRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import Main from './main/main';
import Navigation from './navigation';
import Header from './header';
import Settings from './settings';
import Products from './products/products';
import Offerings from './offerings/offerings';
import ChannelsList from './channels/channelsList';
import ChannelsByStatus from './channels/channelsByStatus';
import SessionsList from './sessions/sessionsList';

import SetAccount from './auth/setAccount';
import GenerateKey from './auth/generateKey';
import ImportHexKey from './auth/importHexKey';
import ImportJsonKey from './auth/importJsonKey';
import Backup from './auth/backup';

import AccountsList from './accounts/accountsList';
import ClientDashboardStart from '../client_components/dashboard/startVPNBtn';
import ClientDashboardConnecting from '../client_components/dashboard/connecting';
import VPNList from '../client_components/vpn_list/list';
import AcceptOffering from '../client_components/vpn_list/acceptOffering';
import ClientHistory from '../client_components/vpn_list/history';


import Logs from './logs/logsList';

import {Mode} from '../typings/mode';

const MemoryHistory = createMemoryHistory();

interface Props {
    mode: Mode;
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
                                <Route exact path='/' render={(props: any) => mode === Mode.CLIENT ? <ClientDashboardStart /> : <Main /> } />
                                <Route path='/settings' component={Settings} />
                                <Route path='/products' render={() => <Products />} />
                                <Route path='/accounts' component={AccountsList} />
                                <Route path='/offerings/:product' render={(props: any) => <Offerings product={props.match.params.product} />} />
                                <Route path='/channels/:offering' render={(props: any) => <ChannelsList offering={props.match.params.offering} /> } />
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
