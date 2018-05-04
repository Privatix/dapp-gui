import * as React from 'react';
// import ChannelStatus from './channelStatus';
// import EndpointView from '../endpoints/endpointView';

export default function(props:any){
/*
    return <div> channel view component
        status: <ChannelStatus channelId={props.channel.id} /> <br />
        endpoint: <EndpointView channelId={props.channel.id} />
    </div>;
*/
    return <div><h5>Service</h5>
    <hr />
        <h3>General info</h3>
        <table>
          <tbody>
            <tr><td>Id:</td><td>{props.channel.id}</td></tr>
            <tr><td>Server:</td><td>[[ server ]]</td></tr>
            <tr><td>Offering:</td><td>{props.channel.offering}</td></tr>
            <tr><td>Contract Status:</td><td>{props.channel.channelStatus}</td></tr>
            <tr><td>Service Status:</td><td>{props.channel.serviceStatus}</td></tr>
            <tr><td>Usage:</td><td>[[ 120 Mb ]]</td></tr>
            <tr><td>Income:</td><td>[[ 14 PRIX ]]</td></tr>
            <tr><td>Deposit:</td><td>{props.channel.totalDeposit}</td></tr>
          </tbody>
        </table>
        <h3>Access info</h3>
        <table>
          <tbody>
            <tr><td>Country:</td><td><img src='images/country/ua.png' /></td></tr>
            <tr><td>Hostname:</td><td>[[ ip ]]</td></tr>
            <tr><td>port:</td><td>[[ 443 ]]</td></tr>
          </tbody>
        </table>
    </div>;
}
