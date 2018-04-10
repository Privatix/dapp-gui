import * as React from 'react';
import { Link } from 'react-router-dom';
import ChannelStatus from './channelStatus';

export default function(props:any){
    const elem = <li>
        <Link to={`/channel/${JSON.stringify(props.channel)}`}>{props.channel.id}</Link> |
        <ChannelStatus channelId={props.channel.id} /> | <Link to={`/endpoint/${props.channel.id}`}>Endpoint</Link> | <Link to={`/sessions/${props.channel.id}`}>Sessions</Link>
    </li>;
    return (elem);
}
