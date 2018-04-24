import * as React from 'react';
import { Link } from 'react-router-dom';
import ChannelToolClose from './channelToolClose';

export default function(props:any){

    return <div>
        <ChannelToolClose channelId={props.channel.id} /> |
        <Link to={'/'}>back</Link>
    </div>;

}
