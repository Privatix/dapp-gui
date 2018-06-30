import * as React from 'react';
import { Route, Router, Switch} from 'react-router';
import { createMemoryHistory } from 'history';
import {asyncReactor} from 'async-reactor';
import {fetch} from '../utils/fetch';
import {LocalSettings} from '../typings/settings';
import SetPassword from './auth/setPassword';
import SetAccount from './auth/setAccount';
import GenerateKey from './auth/generateKey';
import ImportHexKey from './auth/importHexKey';
import ImportJsonKey from './auth/importJsonKey';
import Backup from './auth/backup';
import Login from './auth/login';
import App from '../components/asyncApp';

function Loader() {

  return (<h2>Loading settings ...</h2>);

}

async function AsyncStart (props:any){

    const settings = (await fetch('/localSettings', {})) as LocalSettings;

let MemoryHistory = createMemoryHistory();
const wizard = <Router history={MemoryHistory as any}>
    <Switch>
        <Route exact path='/' component={SetPassword} />
        <Route path='/setAccount' render={() => <SetAccount default={true} /> } />
        <Route path='/generateKey/:default' render={ (props:any) => <GenerateKey default={props.match.params.default} /> } />
        <Route path='/importHexKey/:default' render={ (props:any) => <ImportHexKey default={props.match.params.default} /> } />
        <Route path='/importJsonKey/:default' component={ (props:any) => <ImportJsonKey default={props.match.params.default} /> } />
        <Route path='/backup/:privateKey/:from' render={(props: any) => <Backup entryPoint={'/app'} privateKey={props.match.params.privateKey} from={props.match.params.from}/>} />
        <Route path='/login' component={Login} />
        <Route path='/app' component={App} />
    </Switch>
</Router>;

const setAccount = <Router history={MemoryHistory as any}>
    <Switch>
        <Route exact path='/' render={() => <Login entryPoint={'/setAccount'} />} />
        <Route path='/setAccount' render={() => <SetAccount default={true} /> } />
        <Route path='/generateKey/:default' render={ (props:any) => <GenerateKey default={props.match.params.default} /> } />
        <Route path='/importHexKey/:default' render={ (props:any) => <ImportHexKey default={props.match.params.default} /> } />
        <Route path='/importJsonKey/:default' component={ (props:any) => <ImportJsonKey default={props.match.params.default} /> } />
        <Route path='/backup/:privateKey/:from' render={ (props:any) => <Backup entryPoint={'/app'} privateKey={props.match.params.privateKey} from={props.match.params.from}/> } />
        <Route path='/app' component={App} />
    </Switch>
</Router>;

const login = <Router history={MemoryHistory as any}>
    <Switch>
        <Route exact path='/' render={() => <Login entryPoint={'/app'} />} />
        <Route path='/app' component={App} />
    </Switch>
</Router>;

     return settings.firstStart ? wizard : settings.accountCreated ? login : setAccount;
}

export default asyncReactor(AsyncStart, Loader);
