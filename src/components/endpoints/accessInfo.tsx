import * as React from 'react';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<h2>Loading endpoint ...</h2>);

}

async function AsyncAccessInfo (props:any){

    const endpoints = await fetch(`/endpoints?ch_id=${props.channelId}`, {method: 'GET'});
    const endpoint = endpoints[0];
    const channels = await fetch(`/channels/?id=${props.channelId}`, {method: 'GET'});
    const channel = channels[0];
    const offerings = await fetch(`/offerings/`, {method: 'GET'});
    const offering = (offerings as any).filter(offering => offering.id === channel.offering)[0];
    console.log('ENDPOINTS!!!', endpoints, channels, offerings, offering);
    return <table className='table table-striped'>
        <tbody>
            <tr><td width='30%'>Country:</td><td><img src={`images/country/${offering.country.toLowerCase()}.png`} width='30px'/></td></tr>
            <tr><td>Hostname:</td>{endpoint.ipAddress}<td></td></tr>
            <tr><td>port:</td><td>[[ 443 ]]</td></tr>
        </tbody>
    </table>;
}

export default asyncReactor(AsyncAccessInfo, Loader);
