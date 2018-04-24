import * as React from 'react';
import ChannelStatus from './channelStatus';
// import EndpointView from '../endpoints/endpointView';

export default function(props:any){
/*
    return <div> channel view component
        status: <ChannelStatus channelId={props.channel.id} /> <br />
        endpoint: <EndpointView channelId={props.channel.id} />
    </div>;
*/
    const channelPropsDom = Object.keys(props.channel).map(key => <tr><td>{key}</td><td>{props.channel[key]}</td></tr>);
    return <div><h3>Channel</h3>
        status: <ChannelStatus channelId={props.channel.id} /> <br />
    <hr />
    <table>
        {channelPropsDom}
    </table>
    </div>;
}
