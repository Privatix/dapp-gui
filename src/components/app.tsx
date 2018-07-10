// tslint:disable-next-line
import * as React from 'react';
// tslint:disable-next-line

import { Route, Router, Switch} from 'react-router';
import { withRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducers from '../redux/reducers';

import Main from './main';
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
import ClientDashboardActive from '../client_components/dashboard/active';
import ClientDashboardPaused from '../client_components/dashboard/paused';
import VPNList from '../client_components/vpn_list/list';
import AcceptOffering from '../client_components/vpn_list/acceptOffering';
import ClientHistory from '../client_components/vpn_list/history';

import handlers from '../redux/actions';

import Logs from './logs/logs';

import {Mode} from '../typings/mode';

const MemoryHistory = createMemoryHistory();
const store = createStore(reducers, applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
  ));

interface Props {
    mode: Mode;
}

class App extends React.Component<Props, any> {

    constructor(props: Props) {
        super(props);
        store.dispatch(handlers.setMode(props.mode));
    }

    render(){
        return <Provider store={store}>
            <Router history={MemoryHistory as any}>
                <div id='wrapper'>
                    <Header />
                    <Navigation />
                    <div className='content-page'>
                        <div className='content'>
                            <Switch>
                                <Route exact path='/' render={(props: any) => store.getState().mode === Mode.CLIENT ? <ClientDashboardStart /> : <Main /> } />
                                <Route path='/settings' component={Settings} />
                                <Route path='/products/:showCreateOfferingModal?/:productId?' component={Products} />
                                <Route path='/accounts' component={AccountsList} />
                                <Route path='/offerings/:product' render={(props: any) => <Offerings product={props.match.params.product} />} />
                                <Route path='/channels/:offering' render={(props: any) => <ChannelsList offering={props.match.params.offering} /> } />
                                <Route path='/channelsByStatus/:status' render={(props: any) => <ChannelsByStatus status={props.match.params.status} />} />
                                <Route path='/sessions/:channel' render={(props: any) => <SessionsList channel={props.match.params.channel} /> } />
                                <Route path='/setAccount' render={() => <SetAccount default={false} />} />
                                <Route path='/generateKey/:default' render={ (props:any) => <GenerateKey default={props.match.params.default} /> } />
                                <Route path='/importHexKey/:default' render={ (props:any) => <ImportHexKey default={props.match.params.default} /> } />
                                <Route path='/importJsonKey/:default' render={ (props:any) => <ImportJsonKey default={props.match.params.default} /> } />
                                <Route path='/backup/:privateKey/:from'
                                        render={ (props:any) => <Backup entryPoint={'/accounts'}
                                                                        privateKey={props.match.params.privateKey}
                                                                        from={props.match.params.from}
                                                                />
                                               }
                                />
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
            </Router>
        </Provider>;
    }
}

export default withRouter(App);
