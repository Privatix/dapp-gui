import * as React from 'react';
import EndpointView from './endpointView';
import EndpointTools from './endpointTools';
import {fetch} from '../../utils/fetch';
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<h2>Loading endpoint ...</h2>);

}

async function AsyncEndpoint (props: any){

    const url = `/endpoints?ch_id=${props.match.params.channel}`;
    const endpoint = await fetch(url, {method: 'GET'});
    const title = <h3>endpoint for channel: {props.match.params.channel}</h3>;

    return <div> 
        {title}
        <hr />
        <EndpointView endpoint={endpoint[0]} /><hr />
        <EndpointTools endpoint={endpoint[0]} />
        <hr />
    </div>;
}

export default asyncReactor(AsyncEndpoint, Loader);
