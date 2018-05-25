import * as React from 'react';
import { Route, Router, Switch} from 'react-router';
// import { Link /*, withRouter */ } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import {asyncReactor} from 'async-reactor';
import {fetch} from 'utils/fetch';

import SetPassword from './auth/setPassword';
import SetAccount from './auth/setAccount';
import GenerateKey from './auth/generateKey';
import ImportHexKey from './auth/importHexKey';
import ImportJsonKey from './auth/importJsonKey';
import Backup from './auth/backup';
import Login from './auth/login';
import App from '../components/app';

function Loader() {

  return (<h2>Loading settings ...</h2>);

}

async function AsyncStart (props:any){

    const firstStart = await fetch('/isItFirstStart', {method: 'get'});
    // const isAuthorized = await fetch('/isAuthorized', {method: 'get'});
    console.log('FIRST START: ', firstStart);

let MemoryHistory = createMemoryHistory();
const wisard = <Router history={MemoryHistory as any}>
    <Switch>
        <Route exact path='/' component={SetPassword} />
        <Route path='/setAccount' component={SetAccount} />
        <Route path='/generateKey' component={GenerateKey} />
        <Route path='/importHexKey' component={ImportHexKey} />
        <Route path='/importJsonKey' component={ImportJsonKey} />
        <Route path='/backup' component={Backup} />
        <Route path='/login' component={Login} />
        <Route path='/app' component={App} />
    </Switch>
</Router>;

const login = <Router history={MemoryHistory as any}>
    <Switch>
        <Route exact path='/' component={Login} />
        <Route path='/app' component={App} />
    </Switch>
</Router>;

     return firstStart ? wisard : login;
}

export default asyncReactor(AsyncStart, Loader);
