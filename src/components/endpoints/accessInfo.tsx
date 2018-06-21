import * as React from 'react';
import {fetch} from '../../utils/fetch';
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<h2>Loading endpoint ...</h2>);

}

async function AsyncAccessInfo (props:any){

    // const endpoints = await fetch(`/endpoints?ch_id=${props.channelId}`, {method: 'GET'});
    // const endpoint = endpoints[0];
    // const channels = await fetch(`/channels/?id=${props.channelId}`, {method: 'GET'});
    // const channel = channels[0];
    console.log('ACCESS INFO!!!', props.channel);
    const offerings = await fetch(`/offerings/?id=${props.channel.offering}`, {method: 'GET'});
    console.log('OFFERINGS!!!', offerings);

    const offering = (offerings as any)[0];
    console.log(offerings, offering);
    const products = await fetch(`/products`, {});
    const product = (products as any).filter((product: any) => product.id === offering.product)[0];
    console.log(products, product);
    return <div className='table-responsive'>
        <table className='table table-striped'>
            <tbody>
                <tr><td>Country:</td><td><img src={`images/country/${offering.country.toLowerCase()}.png`} width='30px'/></td></tr>
                <tr><td>Hostname:</td><td>{product.serviceEndpointAddress}</td></tr>
            </tbody>
        </table>
    </div>;
}

export default asyncReactor(AsyncAccessInfo, Loader);
