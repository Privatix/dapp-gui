// tslint:disable-next-line
import * as React from 'react';
// tslint:disable-next-line

import {asyncReactor} from 'async-reactor';
import * as api from '../utils/api';

import App from './app';

function Loader() {

  return (<b>check mode ...</b>);

}

async function AsyncApp(props:any){
    const userRole = await api.getUserRole();
    return <App mode={userRole} />;
}

export default asyncReactor(AsyncApp, Loader);
