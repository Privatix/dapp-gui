import * as React from 'react';
import ChannelView from './channelView';
import ChannelTools from './channelTools';
import SessionList from '../sessions/sessionsList';

export default function(props:any){

const channel = JSON.parse(props.match.params.channel);

    return <div> channel workplace<br />
        <ChannelView channel={channel} />
        <hr />
        <ChannelTools channel={channel} />
        <hr />
        <h3>Sessions</h3>
        <SessionList channel={channel.id}/>
    </div>;

}
