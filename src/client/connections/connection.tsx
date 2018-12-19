import * as React from 'react';
import { translate } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import SortableTable from 'react-sortable-table-vilan';

import ChannelStatus from 'common/badges/channelStatus';
import ContractStatus from 'common/badges/contractStatus';

import ClientAccessInfo from 'client/endpoints/clientAccessInfo';
import Offering from 'client/vpn_list/acceptOffering';

import PgTime from 'common/etc/pgTime';
import toFixedN from 'utils/toFixedN';

import TerminateContractButton from './terminateContractButton';
import FinishServiceButton from './finishServiceButton';
import IncreaseDepositButton from './increaseDepositButton';

@translate('client/connections/connection')

class Connection extends React.Component<any, any>{

    constructor(props:any) {
        super(props);
        this.state = {
            channel: props.connection,
            offering: null
        };

        this.updateOffering(props.connection.offering);
    }

    static getDerivedStateFromProps(props:any, state:any) {
        return {channel: props.connection};
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
        this.props.render(t('Offering'), <Offering mode='view' offering={this.state.offering} />);
    }

    render(){
        const { t, render } = this.props;

        if(this.state.offering && this.props.connection.offering !== this.state.offering.id){
            this.updateOffering(this.props.connection.offering);
        }

        const sessionsColumns = [
            {
                header: t('Id'),
                key: 'id'
            },
            {
                header: t('Agent'),
                key: 'agent'
            },
            {
                header: t('Server'),
                key: 'server'
            },
            {
                header: t('Offering'),
                key: 'offering'
            },
            {
                header: t('Started'),
                key: 'started'
            },
            {
                header: t('Stopped'),
                key: 'stopped'
            },
            {
                header: t('Usage'),
                key: 'usage'
            },
            {
                header: t('CostPRIX'),
                key: 'cost'
            },
            {
                header: t('LastUsageTime'),
                key: 'lastUsageTime'
            },
            {
                header: t('ClientIP'),
                key: 'clientIP'
            }
        ];
        const sessionsData = [];

        const lastUsageTime = this.state.channel.channelStatus.lastChanged;
        const isValidLastUsageTime = (lastUsageTime !== '' && typeof(lastUsageTime) !== 'undefined' && lastUsageTime !== null);

        return <div>
            <div className='row'>
                <div className='col-8'>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>{t('CommonInfo')}</h5>
                        <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                            <div className='card-body'>
                                <table className='table table-bordered table-striped'>
                                    <tbody>
                                        <tr>
                                            <td>{t('IdT')}</td>
                                            <td>{this.state.channel.id}</td>
                                        </tr>
                                        <tr>
                                            <td>{t('OfferingT')}</td>
                                            <td>{this.state.offering
                                                ? <a href='#' onClick={this.showOffering.bind(this)}>
                                                    {this.state.offering.hash}
                                                  </a>
                                                : ''}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>{t('ContractStatusT')}</td>
                                            <td><ContractStatus contractStatus={this.state.channel.channelStatus.channelStatus} /></td>
                                        </tr>
                                        <tr>
                                            <td>{t('ServiceStatusT')}</td>
                                            <td><ChannelStatus serviceStatus={this.state.channel.channelStatus.serviceStatus} /></td>
                                        </tr>
                                        <tr>
                                            <td>{t('TransferredT')}</td>
                                            <td>{this.state.channel.usage.current} {this.state.channel.usage.unit}</td>
                                        </tr>
                                        <tr>
                                            <td>{t('CostT')}</td>
                                            <td>{toFixedN({number: (this.state.channel.usage.cost / 1e8), fixed: 8})} PRIX</td>
                                        </tr>
                                        <tr>
                                            <td>{t('DepositT')}</td>
                                            <td>{toFixedN({number: (this.state.channel.deposit / 1e8), fixed: 8})} PRIX</td>
                                        </tr>
                                        <tr>
                                            <td>{t('LastUsageTimeT')}</td>
                                            <td>{ isValidLastUsageTime ? <PgTime time={lastUsageTime} /> : ''}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <ClientAccessInfo channel={this.state.channel} />
                </div>


                <div className='col-4'>
                    {this.state.channel.channelStatus.serviceStatus === 'active' ? <IncreaseDepositButton channel={this.state.channel} render={render} /> : '' }
                    <FinishServiceButton channel={this.state.channel} />
                    <TerminateContractButton
                        status='disabled'
                        payment={this.state.channel.usage.cost}
                        channelId={this.state.channel.id}
                        done={() => this.props.history.push('/client-history')}
                    />
                </div>
            </div>

            <div className='row m-t-30'>
                <div className='col-12'>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>{t('Sessions')}</h5>
                        <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                            <div className='card-body'>
                                <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                                    <SortableTable
                                        data={sessionsData}
                                        columns={sessionsColumns}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default withRouter(Connection);
