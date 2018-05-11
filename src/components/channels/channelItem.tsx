import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ChannelUsage from './channelUsage';
import LinkToProductByOfferingId from '../products/linkToProductByOfferingId';
import ProductNameByOffering from '../products/productNameByOffering';
import PgTime from '../utils/pgTime';
export default withRouter(function(props:any){
    /*
    const elem = <li>
        <Link to={`/channel/${JSON.stringify(props.channel)}`}>{props.channel.id}</Link> |
        <ChannelStatus channelId={props.channel.id} /> | <Link to={`/endpoint/${props.channel.id}`}>Endpoint</Link> | <Link to={`/sessions/${props.channel.id}`}>Sessions</Link>
    </li>;
   */

    const elem = <tr>
        <td><Link to={`/channel/${JSON.stringify(props.channel)}/`}>{props.channel.id}</Link></td>
        <td><LinkToProductByOfferingId offeringId={props.channel.offering} ><ProductNameByOffering offeringId={props.channel.offering} /></LinkToProductByOfferingId></td>
        <td>{props.channel.client}</td>
        <td>{props.channel.channelStatus}</td>
        <td>{props.channel.serviceStatus}</td>
        <td><ChannelUsage channelId={props.channel.id} /></td>
        <td>{props.channel.receiptBalance}</td>
        <td><PgTime time={props.channel.serviceChangedTime} /></td>
    </tr>;
    return (elem);
});
