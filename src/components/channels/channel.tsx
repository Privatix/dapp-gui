import * as React from 'react';
import { Link } from 'react-router-dom';
import ChannelView from './channelView';
import ChannelTools from './channelTools';

export default function(props:any){

const channel = JSON.parse(props.match.params.channel);

    return <div> channel workplace<br />
        <ChannelView channel={channel} /> <hr />
        channel toolbar <br />
        <ChannelTools channel={channel} /> <br />
        <Link to={'/'}>back</Link>
    </div>;

}
