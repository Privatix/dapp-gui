import * as React from 'react';
import {ipcRenderer} from 'electron';
import {fetchFactory} from '../../fetch';
const fetch = fetchFactory(ipcRenderer);
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<h2>Loading endpoint ...</h2>);

}

async function AsyncEndpoint(props:any){
    const endpoint = `/endpoints?ch_id=${props.channelId}`;
    const raw = await fetch(endpoint, {method: 'GET'});
    const body = JSON.parse((raw as any).src);
    return <div> endpoint view component<hr />
    {body.test_prop}
    </div>;
}

export default asyncReactor(AsyncEndpoint, Loader);
