import * as React from 'react';
import { Link } from 'react-router-dom';
import {ipcRenderer} from 'electron';
import {fetchFactory} from '../../fetch';
const fetch = fetchFactory(ipcRenderer);
import {asyncReactor} from 'async-reactor';
import ChannelItem from './channelItem';

function Loader() {

  return (<h2>Loading channels ...</h2>);

}

async function AsyncChannels (props:any){

    const endpoint = '/channels' + (props.match.params.offering === 'all' ? '' : `?offeringId=${props.match.params.offering}`);
    const channels = await fetch(endpoint, {method: 'GET'});
    const title = props.match.params.offering === 'all'
        ? <h3>channels list for all offerings</h3>
        : <h3>channels list for offering: {props.match.params.offering}</h3>;
    const channelsDOM = (channels as any).map((channel: any) => <ChannelItem channel={channel} />);
    return <div>
        {title}
        <hr />
        {channelsDOM}
        <hr />
        <Link to={'/'}>back</Link>
    </div>;
}

export default asyncReactor(AsyncChannels, Loader);
