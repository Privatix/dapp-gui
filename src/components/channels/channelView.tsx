import * as React from 'react';
import ChannelStatus from './channelStatus';
import EndpointView from '../endpoints/endpointView';

export default function(props:any){

    return <div> channel view component
        status: <ChannelStatus channelId={props.channel.id} /> <br />
        endpoint: <EndpointView channelId={props.channel.id} />
    </div>;
}
