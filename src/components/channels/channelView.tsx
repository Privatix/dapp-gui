import * as React from 'react';

import ChannelUsage from './channelUsage';
import AccessInfo from '../endpoints/accessInfo';
import ProductNameByOffering from '../products/productNameByOffering';

import ChannelStatusStyle from './channelStatusStyle';
import ContractStatus from './contractStatus';
// import ChannelStatus from './channelStatus';
// import EndpointView from '../endpoints/endpointView';

export default function(props:any){

    return <div className='col-lg-9 col-md-8 col-sm-12 col-xs-12 m-b-20'>
        <div className='card m-b-20'>
            <h5 className='card-header'>General info</h5>
            <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                <div className='card-body'>
                    <div className='table-responsive'>
                        <table className='table table-striped'>
                            <tbody>
                                <tr><td>Id:</td><td>{props.channel.id}</td></tr>
                                <tr><td>Server:</td><td><ProductNameByOffering offeringId={props.channel.offering} /></td></tr>
                                <tr><td>Offering:</td><td>{props.channel.offering}</td></tr>
                                <tr><td>Contract Status:</td><td><ContractStatus contractStatus={props.channel.channelStatus} /></td></tr>
                                <tr><td>Service Status:</td><td><ChannelStatusStyle serviceStatus={props.channel.serviceStatus} /></td></tr>
                                <tr><td>Usage:</td><td><ChannelUsage channelId={props.channel.id} /></td></tr>
                                <tr><td>Income:</td><td>{(props.channel.receiptBalance/1e8).toFixed(3)} PRIX</td></tr>
                                <tr><td>Deposit:</td><td>{(props.channel.totalDeposit/1e8).toFixed(3)} PRIX</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div className='card m-b-20'>
            <h5 className='card-header'>Access info</h5>
            <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                <div className='card-body'>
                    <AccessInfo channel={props.channel} />
                </div>
            </div>
        </div>
    </div>;
}
