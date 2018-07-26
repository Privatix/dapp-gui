import * as React from 'react';

import ChannelUsage from './channelUsage';
import AgentAccessInfo from '../endpoints/agentAccessInfo';
import ProductNameByOffering from '../products/productNameByOffering';

import ChannelStatusStyle from './channelStatusStyle';
import ContractStatus from './contractStatus';
import toFixed8 from '../../utils/toFixed8';
import * as api from '../../utils/api';
import Offering from '../offerings/offeringView';

export default class ChannelView extends React.Component<any, any> {

    constructor(props:any){
        super(props);
        this.state = {offering: null};
        this.updateOffering(props.channel.offering);
    }

    updateOffering(offeringId: string){

        api.getOfferingById(offeringId)
           .then(offering => {
               if(offering){
                   this.setState({offering});
               }
           });
    }

    showOffering(evt:any){
        evt.preventDefault();
        console.log(this.props);
        this.props.render('Offering', <Offering offering={this.state.offering} />);
    }

    render(){

        if(this.state.offering && this.props.channel.offering !== this.state.offering.id){
            this.updateOffering(this.props.channel.offering);
        }

        return <div className='col-lg-9 col-md-8 col-sm-12 col-xs-12 m-b-20'>
            <div className='card m-b-20'>
                <h5 className='card-header'>General info</h5>
                <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                    <div className='card-body'>
                        <div className='table-responsive'>
                            <table className='table table-striped'>
                                <tbody>
                                    <tr><td>Id:</td><td>{this.props.channel.id}</td></tr>
                                    <tr><td>Server:</td><td><ProductNameByOffering offeringId={this.props.channel.offering} /></td></tr>
                                    <tr>
                                        <td>Offering:</td>
                                        <td>{this.state.offering
                                                ? <a href='#' onClick={this.showOffering.bind(this)}>
                                                    { new Buffer(this.state.offering.hash, 'base64').toString('hex') }
                                                  </a>
                                                : ''}
                                        </td>
                                    </tr>
                                    <tr><td>Contract Status:</td><td><ContractStatus contractStatus={this.props.channel.channelStatus} /></td></tr>
                                    <tr><td>Service Status:</td><td><ChannelStatusStyle serviceStatus={this.props.channel.serviceStatus} /></td></tr>
                                    <tr><td>Usage:</td><td><ChannelUsage channelId={this.props.channel.id} /></td></tr>
                                    <tr><td>Income:</td><td>{toFixed8({number: this.props.channel.receiptBalance/1e8})} PRIX</td></tr>
                                    <tr><td>Deposit:</td><td>{toFixed8({number: this.props.channel.totalDeposit/1e8})} PRIX</td></tr>
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
                        <AgentAccessInfo channel={this.props.channel} />
                    </div>
                </div>
            </div>
        </div>;
    }
}
