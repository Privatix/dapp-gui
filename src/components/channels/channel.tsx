import * as React from 'react';
import ChannelView from './channelView';
import ChannelTools from './channelTools';

export default function(props:any){

const channel = JSON.parse(props.match.params.channel);

    return <div> channel workplace<br />
        <ChannelView channel={channel} />
        <hr />
        <ChannelTools channel={channel} />
    </div>;

}
