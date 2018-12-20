import * as React from 'react';
import { translate } from 'react-i18next';

import { WS, ws } from 'utils/ws';
import {Channel} from 'typings/channels';

import AgentAccessInfo from 'agent/endpoints/agentAccessInfo';
import ProductNameByOffering from 'agent/products/productNameByOffering';

import ChannelUsage from 'common/badges/channelUsage';
import ChannelStatus from 'common/badges/channelStatus';
import ContractStatus from 'common/badges/contractStatus';

import toFixedN from 'utils/toFixedN';
import Offering from 'agent/offerings/offeringView';

interface IProps{
    ws?: WS;
    t?: any;
    render?: Function;
    channel: Channel;
}

@translate('channels/channelView')
class ChannelView extends React.Component<IProps, any> {

    constructor(props: IProps){
        super(props);
        this.state = {offering: null};
        this.updateOffering(props.channel.offering);
    }

    async updateOffering(offeringId: string){

        const { ws } = this.props;

        const offering = await ws.getOffering(offeringId);
        if(offering){
            this.setState({offering});
        }
    }

    showOffering = (evt:any) => {
        evt.preventDefault();
        const { t, render } = this.props;
        render(t('Offering'), <Offering offering={this.state.offering} />);
    }

    render(){
        const { t, channel, render } = this.props;

        if(this.state.offering && channel.offering !== this.state.offering.id){
            this.updateOffering(channel.offering);
        }

        return <div className='col-lg-9 col-md-8 col-sm-12 col-xs-12 m-b-20'>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('GeneralInfo')}</h5>
                <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                    <div className='card-body'>
                        <div className='table-responsive'>
                            <table className='table table-striped'>
                                <tbody>
                                    <tr><td>{t('Id')}</td><td>{channel.id}</td></tr>
                                    <tr>
                                        <td>{t('Server')}</td>
                                        <td>
                                            <ProductNameByOffering mode='link'
                                                                   offeringId={channel.offering}
                                                                   render={render}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>{t('OfferingTd')}</td>
                                        <td>{this.state.offering
                                                ? <a href='#' onClick={this.showOffering}>
                                                    { this.state.offering.hash }
                                                  </a>
                                                : ''}
                                        </td>
                                    </tr>
                                    <tr><td>{t('ContractStatus')}</td><td><ContractStatus contractStatus={channel.channelStatus} /></td></tr>
                                    <tr><td>{t('ServiceStatus')}</td><td><ChannelStatus serviceStatus={channel.serviceStatus} /></td></tr>
                                    <tr><td>{t('Usage')}</td><td><ChannelUsage channelId={this.props.channel.id} channelStatus={channel.serviceStatus} mode='unit'/></td></tr>
                                    <tr><td>{t('Income')}</td><td>{toFixedN({number: channel.receiptBalance/1e8, fixed: 8})} PRIX</td></tr>
                                    <tr><td>{t('Deposit')}</td><td>{toFixedN({number: channel.totalDeposit/1e8, fixed: 8})} PRIX</td></tr>
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
                        <AgentAccessInfo channel={channel} />
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default ws<IProps>(ChannelView);
