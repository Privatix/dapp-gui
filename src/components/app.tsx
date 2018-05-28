// tslint:disable-next-line
import * as React from 'react';
// tslint:disable-next-line

import {fetch} from '../utils/fetch';
import { Route, Router, Switch} from 'react-router';

import { createMemoryHistory } from 'history';

// import { render } from 'react-dom';
// import Start from './client_components/start';

import Main from './main';
// import Start from './components/start';
import Navigation from './navigation';
import Header from './header';
import Settings from './settings';
import Products from './products/products';
import Product from './products/product';
import ProductById from './products/productById';
import CreateProduct from './products/addProduct';
import Offerings from './offerings/offerings';
import Offering from './offerings/offering';
import CreateOffering from './offerings/createOffering';
import FilledOffering from './offerings/filledOffering';
import ChannelsList from './channels/channelsList';
import ChannelsByStatus from './channels/channelsByStatus';
import Channel from './channels/channel';
import SessionsList from './sessions/sessionsList';
import Session from './sessions/session';
import Endpoint from './endpoints/endpoint';

import TemplatesList from './templates/templatesList';
import Template from './templates/template';
// import SetAccount from './components/auth/setAccount';
import AddAccount from './accounts/addAccount';
// import Login from './components/auth/login';


import AccountsList from './accounts/accountsList';
import Account from './accounts/accountView';

import Logs from './logs/logs';


let MemoryHistory = createMemoryHistory();

interface Props {
    mode: string;
}

export default class App extends React.Component<Props, any> {

    constructor(props: Props) {
        super(props);
        this.state = {mode: props.mode || 'agent' };
    }
    static getDerivedStateFromProps(nextProps: Props, prevState: any){
        return {mode: nextProps.mode};
    }

    onSwitchMode(evt: any){
        evt.preventDefault();
        fetch('/switchMode', {});
        this.setState({mode: this.state.mode === undefined || this.state.mode === 'agent' ? 'client' : 'agent'});
    }

    render(){
        return <Router history={MemoryHistory as any}>
            <div id='wrapper'>
                <Header onSwitchMode={this.onSwitchMode.bind(this)} mode={this.state.mode}/>
                <Navigation mode={this.state.mode} />
                <div className='content-page'>
                    <div className='content'>
                        <Switch>
                            <Route exact path='/' component={Main} />
                            <Route path='/templates' component={TemplatesList} />
                            <Route path='/template/:id' component={Template} />
                            <Route path='/settings' component={Settings} />
                            <Route path='/products' component={Products} />
                            <Route path='/createProduct' component={CreateProduct} />
                            <Route path='/accounts' component={AccountsList} />
                            <Route path='/account/:account' component={Account} />
                            <Route path='/product/:product' component={Product} />
                            <Route path='/productById/:productId' component={ProductById} />
                            <Route path='/offerings/:product' component={Offerings} />
                            <Route path='/offering/:offering' component={Offering} />
                            <Route path='/createOffering/' component={CreateOffering} />
                            <Route path='/filledOffering/:offering' component={FilledOffering} />
                            <Route path='/channels/:offering' component={ChannelsList} />
                            <Route path='/channelsByStatus/:status' component={ChannelsByStatus} />
                            <Route path='/channel/:channel' component={Channel} />
                            <Route path='/sessions/:channel' component={SessionsList} />
                            <Route path='/session/:session' component={Session} />
                            <Route path='/endpoint/:channel' component={Endpoint} />
                            <Route path='/addAccount' render={() => <AddAccount default={false} />} />
                            <Route path='/logs' component={Logs} />
                        </Switch>
                    </div>
                </div>
            </div>
        </Router>;
    }
}
