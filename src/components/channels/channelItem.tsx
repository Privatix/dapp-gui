import * as React from 'react';
import { Link } from 'react-router-dom';
import ChannelStatus from './channelStatus';

export default function(props:any){
    const elem = <li>
        <Link to={`/channel/${JSON.stringify(props.channel)}`}>{props.channel.title}</Link> | 
        <ChannelStatus channelId={props.channel.id} />
    </li>;
    return (elem);
}
