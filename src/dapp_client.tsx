import Main from './components/main';
import Start from './client_components/start';
import Navigation from './components/navigation';
import Header from './components/header';
import Settings from './components/settings';
import Products from './components/products/products';
import Product from './components/products/product';
import CreateProduct from './components/products/addProduct';
import OfferingsList from './components/offerings/offeringsList';
import Offering from './components/offerings/offering';
import CreateOffering from './components/offerings/createOffering';
import FilledOffering from './components/offerings/filledOffering';
import ChannelsList from './components/channels/channelsList';
import Channel from './components/channels/channel';
import SessionsList from './components/sessions/sessionsList';
import Session from './components/sessions/session';
import Endpoint from './components/endpoints/endpoint';

import TemplatesList from './components/templates/templatesList';
import Template from './components/templates/template';
import SetAccount from './client_components/auth/setAccount';
import GenerateKey from './client_components/auth/generateKey';
import Backup from './client_components/auth/backup';
import importHexKey from './client_components/auth/importHexKey';
import importJsonKey from './client_components/auth/importJsonKey';
import AddAccount from './components/accounts/addAccount';
import Login from './components/auth/login';


import AccountsList from './components/accounts/accountsList';
import Account from './components/accounts/accountView';

// tslint:disable-next-line
import * as React from 'react';
// tslint:disable-next-line
import { Route, Router, Switch, Redirect} from 'react-router';

import { createMemoryHistory } from 'history';

import { render } from 'react-dom';

let MemoryHistory = createMemoryHistory();

const auth = <Router history={MemoryHistory as any}>
    <div className='wrapper-page' style={{width:'700px'}}>
        <Switch>
            <Route exact path='/' component={Start} />
            <Route path='/auth' component={Login} />
            <Route path='/setAccount' component={SetAccount} />
            <Route path='/generateKey' component={GenerateKey} />
            <Route path='/backup' component={Backup} />
            <Route path='/importHexKey' component={importHexKey} />
            <Route path='/importJsonKey' component={importJsonKey} />
        </Switch>
</div>
</Router>;


const app = <Router history={MemoryHistory as any}>
    <div id='wrapper'>
        <Header />
        <Navigation />
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
                            <Route path='/offerings/:product' component={OfferingsList} />
                            <Route path='/offering/:offering' component={Offering} />
                            <Route path='/createOffering/' component={CreateOffering} />
                            <Route path='/filledOffering/:offering' component={FilledOffering} />
                            <Route path='/channels/:offering' component={ChannelsList} />
                            <Route path='/channel/:channel' component={Channel} />
                            <Route path='/sessions/:channel' component={SessionsList} />
                            <Route path='/session/:session' component={Session} />
                            <Route path='/endpoint/:channel' component={Endpoint} />
                            <Route path='/addAccount' render={() => <AddAccount default={false} />} />
                        </Switch>
            </div>
        </div>
    </div>
</Router>;
let lastRender = 'auth';
    MemoryHistory.listen((location, action) => {
        console.log(location);
        switch (location.pathname) {
            case '/setAccount':
            case '/auth':
            case '/generateKey':
            case '/backup':
            case '/importHexKey':
            case '/importJsonKey':
            case '/':
                if (lastRender!=='auth') {
                    lastRender = 'auth';
                    console.log('render auth');
                    render(auth, document.getElementById('app'));
                }
                break;
            default:
                if (lastRender!=='app') {
                    lastRender = 'app';
                    console.log('render app');
                    render(app, document.getElementById('app'));
                }
                break;
        }

        // render(<Navigation pathname={location.pathname}/>, findDOMNode(<Navigation />));
        // document.getElementById('back').style.display = (location.pathname === '/') ? 'none' : 'inline';
    });


    render(auth, document.getElementById('app'));
    // render(app, document.getElementById('app'));







