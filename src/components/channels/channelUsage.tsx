import * as React from 'react';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<h2>Loading sessions ...</h2>);

}

async function AsyncChannelUsage (props:any){

    const endpoint = `/sessions?channelId=${props.channelId}`;
    const sessions = await fetch(endpoint, {method: 'GET'});
    const usage = (sessions as any).reduce( (usage, session) => {return usage + session.unitsUsed;}, 0);
    return <span>{usage} Mb</span>;
}

export default asyncReactor(AsyncChannelUsage, Loader);
