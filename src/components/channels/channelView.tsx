import * as React from 'react';

import ChannelUsage from './channelUsage';
import AgentAccessInfo from '../endpoints/agentAccessInfo';
import ProductNameByOffering from '../products/productNameByOffering';

import ChannelStatusStyle from './channelStatusStyle';
import ContractStatus from './contractStatus';
import toFixedN from '../../utils/toFixedN';
import Offering from '../offerings/offeringView';
import { translate } from 'react-i18next';

@translate('channels/channelView')

export default class ChannelView extends React.Component<any, any> {

    constructor(props:any){
        super(props);
        this.state = {offering: null};
        this.updateOffering(props.channel.offering);
    }

    updateOffering(offeringId: string){

        (window as any).ws.getOffering(offeringId)
           .then(offering => {
               if(offering){
                   this.setState({offering});
               }
           });
    }

    showOffering(evt:any){
        evt.preventDefault();
        const { t } = this.props;
        this.props.render(t('Offering'), <Offering offering={this.state.offering} />);
    }

    render(){
        const { t } = this.props;

        if(this.state.offering && this.props.channel.offering !== this.state.offering.id){
            this.updateOffering(this.props.channel.offering);
        }

        return <div className='col-lg-9 col-md-8 col-sm-12 col-xs-12 m-b-20'>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('GeneralInfo')}</h5>
                <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                    <div className='card-body'>
                        <div className='table-responsive'>
                            <table className='table table-striped'>
                                <tbody>
                                    <tr><td>{t('Id')}</td><td>{this.props.channel.id}</td></tr>
                                    <tr>
                                        <td>{t('Server')}</td>
                                        <td>
                                            <ProductNameByOffering mode='link'
                                                                   offeringId={this.props.channel.offering}
                                                                   render={this.props.render}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>{t('OfferingTd')}</td>
                                        <td>{this.state.offering
                                                ? <a href='#' onClick={this.showOffering.bind(this)}>
                                                    { this.state.offering.hash }
                                                  </a>
                                                : ''}
                                        </td>
                                    </tr>
                                    <tr><td>{t('ContractStatus')}</td><td><ContractStatus contractStatus={this.props.channel.channelStatus} /></td></tr>
                                    <tr><td>{t('ServiceStatus')}</td><td><ChannelStatusStyle serviceStatus={this.props.channel.serviceStatus} /></td></tr>
                                    <tr><td>{t('Usage')}</td><td><ChannelUsage channelId={this.props.channel.id} /></td></tr>
                                    <tr><td>{t('Income')}</td><td>{toFixedN({number: this.props.channel.receiptBalance/1e8, fixed: 8})} PRIX</td></tr>
                                    <tr><td>{t('Deposit')}</td><td>{toFixedN({number: this.props.channel.totalDeposit/1e8, fixed: 8})} PRIX</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className='card m-b-20'>
                <h5 className='card-header'>{t('AccessInfo')}</h5>
                <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                    <div className='card-body'>
                        <AgentAccessInfo channel={this.props.channel} />
                    </div>
                </div>
            </div>
        </div>;
    }
}
