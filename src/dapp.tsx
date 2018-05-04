// import * as $ from 'jquery';
import 'free-jqgrid';
// import {ipcRenderer} from 'electron';
// import {fetchFactory} from './fetch';


import Main from './components/main';
import Start from './components/start';
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
import SetAccount from './components/auth/setAccount';
import AddAccount from './components/accounts/addAccount';
import Login from './components/auth/login';


import AccountsList from './components/accounts/accountsList';
import Account from './components/accounts/accountView';

import Logs from './components/logs/logs';

// tslint:disable-next-line
import * as React from 'react';
// tslint:disable-next-line
import { Route, Router, Switch, Redirect} from 'react-router';

import { createMemoryHistory } from 'history';

import { render } from 'react-dom';
// import {fetch} from "./utils/fetch";


// import Form from 'react-jsonschema-form';


// const fetch = fetchFactory(ipcRenderer);
/*
fetch('/sessions', {}).then(res => {
    $(document).ready(function () {
        'use strict';
        const data = {
            'page': '1',
            'records': '3',
            'rows': res
        };
        const grid = $('#sessions_list');

        grid.jqGrid({
            colModel: [
                { name: 'id', index: 'id', width: '100' },
                { name: 'state_channel_id', index: 'state_channel_id', width: '100' },
                { name: 'started', index: 'started', width: '100' },
                { name: 'stopped', index: 'stopped', width: '100' },
                { name: 'up', index: 'up', width: '100' },
                { name: 'down', index: 'down', width: '100' },
            ],
            pager: '#packagePager',
            datatype: 'jsonstring',
            datastr: data,
            jsonReader: { repeatitems: false },
            rowNum: 2,
            viewrecords: true,
            caption: 'Sessions',
            height: 'auto',
            ignoreCase: true
        });
        grid.jqGrid('navGrid', '#pager',
            { add: false, edit: false, del: false }, {}, {}, {},
            { multipleSearch: true, multipleGroup: true });
        grid.jqGrid('filterToolbar', { defaultSearch: 'cn', stringResult: true });
    });
});
*/
/*
fetch('/getSOTemplates', {}).then(res => {
    render(<TemplatesList list={res} />, document.getElementById('templatesList'));
});
*/
let MemoryHistory = createMemoryHistory();
/*
let goBack = (e:any) => {
    MemoryHistory.goBack();
    e.preventDefault();
};
*/
const auth = <Router history={MemoryHistory as any}>
    <div className='wrapper-page'>
        <Switch>
            <Route exact path='/' component={Start} />
            <Route path='/auth' component={Login} />
            <Route path='/setAccount' component={SetAccount} />
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
                            <Route exact path='/app' component={Main} />
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
                            <Route path='/logs' component={Logs} />
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


    // render(auth, document.getElementById('app'));
    render(app, document.getElementById('app'));







