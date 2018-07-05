// tslint:disable-next-line
import * as React from 'react';
// tslint:disable-next-line

import { Route, Router, Switch} from 'react-router';
import { withRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import Main from './main';
import Navigation from './navigation';
import Header from './header';
import Settings from './settings';
import Products from './products/products';
import Product from './products/product';
import Offerings from './offerings/offerings';
import Offering from './offerings/offering';
import CreateOffering from './offerings/createOffering';
import ChannelsList from './channels/channelsList';
import ChannelsByStatus from './channels/channelsByStatus';
import Channel from './channels/channel';
import SessionsList from './sessions/sessionsList';
import Session from './sessions/session';
import Endpoint from './endpoints/endpoint';

import SetAccount from './auth/setAccount';
import GenerateKey from './auth/generateKey';
import ImportHexKey from './auth/importHexKey';
import ImportJsonKey from './auth/importJsonKey';
import Backup from './auth/backup';

import AccountsList from './accounts/accountsList';
import ClientDashboardStart from '../client_components/dashboard/startVPNBtn';
import ClientDashboardConnecting from '../client_components/dashboard/connecting';
import ClientDashboardActive from '../client_components/dashboard/active';
import ClientDashboardPaused from '../client_components/dashboard/paused';
import VPNList from '../client_components/vpn_list/list';
import AcceptOffering from '../client_components/vpn_list/acceptOffering';
import ClientHistory from '../client_components/vpn_list/history';
import * as api from '../utils/api';
import notice from '../utils/notice';

import Logs from './logs/logs';


let MemoryHistory = createMemoryHistory();

interface Props {
    mode: string;
}

class App extends React.Component<Props, any> {

    constructor(props: Props) {
        super(props);
        this.state = {mode: props.mode || 'agent' };
    }
    static getDerivedStateFromProps(nextProps: Props, prevState: any){
        return {mode: nextProps.mode};
    }

    async onSwitchMode(evt: any){
        evt.preventDefault();

        const newUserMode = this.state.mode === 'agent' ? 'client' : 'agent';
        const updateResult = await api.setUserMode(newUserMode);

        if (updateResult === 'updated.') {
            this.setState({mode: newUserMode});
            if (newUserMode === 'agent') {
                MemoryHistory.push('/');
            } else {
                MemoryHistory.push('/client-dashboard-start');
            }
            notice({level: 'info', title: 'Congratulations!', msg: 'User mode was successfully switched to ' + newUserMode.toUpperCase()});
        } else {
            notice({level: 'error', title: 'Attention!', msg: 'Something went wrong!'});
        }
    }

    render(){
        return <Router history={MemoryHistory as any}>
            <div id='wrapper'>
                <Header onSwitchMode={this.onSwitchMode.bind(this)} mode={this.state.mode}/>
                <Navigation mode={this.state.mode} />
                <div className='content-page'>
                    <div className='content'>
                        <Switch>
                            <Route exact path='/' component={this.state.mode === 'client' ? ClientDashboardStart : Main } />
                            <Route path='/settings' component={Settings} />
                            <Route path='/products/:showCreateOfferingModal?/:productId?' component={Products} />
                            <Route path='/accounts' component={AccountsList} />
                            <Route path='/product/:product' component={Product} />
                            <Route path='/offerings/:product' render={(props: any) => <Offerings product={props.match.params.product} />} />
                            <Route path='/offering/:offering' component={Offering} />
                            <Route path='/createOffering/' component={CreateOffering} />
                            <Route path='/channels/:offering' component={ChannelsList} />
                            <Route path='/channelsByStatus/:status' render={(props: any) => <ChannelsByStatus status={props.match.params.status} />} />
                            <Route path='/channel/:channel' component={Channel} />
                            <Route path='/sessions/:channel' render={(props: any) => <SessionsList channel={props.match.params.channel} /> } />
                            <Route path='/session/:session' component={Session} />
                            <Route path='/endpoint/:channel' component={Endpoint} />
                            <Route path='/setAccount' render={() => <SetAccount default={false} />} />
                            <Route path='/generateKey/:default' render={ (props:any) => <GenerateKey default={props.match.params.default} /> } />
                            <Route path='/importHexKey/:default' render={ (props:any) => <ImportHexKey default={props.match.params.default} /> } />
                            <Route path='/importJsonKey/:default' render={ (props:any) => <ImportJsonKey default={props.match.params.default} /> } />
                            <Route path='/backup/:privateKey/:from' render={ (props:any) => <Backup entryPoint={'/accounts'} privateKey={props.match.params.privateKey} from={props.match.params.from}/> } />
                            <Route path='/logs' component={Logs} />

                            <Route exact path='/client-dashboard-start' component={ClientDashboardStart} />
                            <Route exact path='/client-dashboard-connecting' component={ClientDashboardConnecting} />
                            <Route exact path='/client-dashboard-active' component={ClientDashboardActive} />
                            <Route exact path='/client-dashboard-paused' component={ClientDashboardPaused} />
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

export default withRouter(App);
