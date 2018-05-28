// tslint:disable-next-line
import * as React from 'react';
// tslint:disable-next-line

import {asyncReactor} from 'async-reactor';
import {fetch} from 'Utils/fetch';

import App from './app';

function Loader() {

  return (<b>check mode ...</b>);

}

async function AsyncApp(props:any){

    const localSettings = await fetch('/localSettings', {});
    return <App mode={(localSettings as any).mode} />;
}

export default asyncReactor(AsyncApp, Loader);
