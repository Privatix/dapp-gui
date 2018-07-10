import * as React from 'react';
import { withRouter } from 'react-router-dom';

import ChannelUsage from '../../../components/channels/channelUsage';
import LinkToProductByOfferingId from '../../../components/products/linkToProductByOfferingId';
import ProductNameByOffering from '../../../components/products/productNameByOffering';
import PgTime from '../../../components/utils/pgTime';
import ChannelStatusStyle from '../../../components/channels/channelStatusStyle';
import ContractStatus from '../../../components/channels/contractStatus';
import Channel from '../../../components/channels/channel';
import ModalWindow from '../../../components/modalWindow';

export default withRouter(function(props:any){

    const elem = <tr>
        <td><ModalWindow customClass='' modalTitle='Service' text={props.channel.id} component={<Channel channel={props.channel} />} /></td>
        <td><LinkToProductByOfferingId offeringId={props.channel.offering} ><ProductNameByOffering offeringId={props.channel.offering} /></LinkToProductByOfferingId></td>
        <td>{props.channel.client}</td>
        <td> <ContractStatus contractStatus={props.channel.channelStatus} /></td>
        <td><ChannelStatusStyle serviceStatus={props.channel.serviceStatus} /></td>
        <td><ChannelUsage channelId={props.channel.id} /></td>
        <td>{(props.channel.receiptBalance/1e8).toFixed(3)}</td>
        <td><PgTime time={props.channel.serviceChangedTime} /></td>
    </tr>;
    return (elem);
});
