import * as React from 'react';
// import { Link /*, withRouter */ } from 'react-router-dom';
import {asyncReactor} from 'async-reactor';
import {fetch} from 'utils/fetch';

import SetPassword from './auth/setPassword';
import Login from './auth/login';

function Loader() {

  return (<h2>Loading settings ...</h2>);

}

async function AsyncStart (props:any){

    const firstStart = await fetch('/isItFirstStart', {method: 'get'});
    // const isAuthorized = await fetch('/isAuthorized', {method: 'get'});

    return firstStart
        ? <SetPassword />
        :  <Login />;
}

export default asyncReactor(AsyncStart, Loader);
