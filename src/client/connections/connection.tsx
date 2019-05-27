import * as React from 'react';
import { translate } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import SortableTable from 'react-sortable-table-vilan';

import { WS, ws } from 'utils/ws';
import {ClientChannel} from 'typings/channels';

import { Id, Agent, Server, Offering as OfferingCol } from 'common/tables/';

import ChannelStatus from 'common/badges/channelStatus';
import ContractStatus from 'common/badges/contractStatus';

import ClientAccessInfo from 'client/endpoints/clientAccessInfo';
import Offering from 'client/vpn_list/acceptOffering';

import PgTime from 'common/etc/pgTime';
import toFixedN from 'utils/toFixedN';

import TerminateContractButton from './terminateContractButton';
import FinishServiceButton from './finishServiceButton';
import IncreaseDepositButton from './increaseDepositButton';

interface IProps{
    ws?: WS;
    t?: any;
    history?: any;
    connection: ClientChannel;
    render?: Function;
}

@translate('client/connections/connection')
class Connection extends React.Component<IProps, any>{

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

    async updateOffering(offeringId: string){

        const{  ws } = this.props;

        const offering = await ws.getOffering(offeringId);
        if(offering){
            this.setState({offering});
        }
    }

    showOffering(evt:any){
        evt.preventDefault();
        const { t, render } = this.props;
        render(t('Offering'), <Offering mode='view' offering={this.state.offering} />);
    }

    render(){

        const { t, render, connection } = this.props;
        const { channel, offering } = this.state;

        if(offering && connection.offering !== offering.id){
            this.updateOffering(connection.offering);
        }

        const sessionsColumns = [
            Id,
            Agent,
            Server,
            OfferingCol,
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

        const serviceStatus = channel.channelStatus.serviceStatus;
        const lastUsageTime = channel.channelStatus.lastChanged;

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
                                            <td>{channel.id}</td>
                                        </tr>
                                        <tr>
                                            <td>{t('OfferingT')}</td>
                                            <td>{offering
                                                ? <a href='#' onClick={this.showOffering.bind(this)}>
                                                    {offering.hash}
                                                  </a>
                                                : ''}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>{t('ContractStatusT')}</td>
                                            <td><ContractStatus contractStatus={channel.channelStatus.channelStatus} /></td>
                                        </tr>
                                        <tr>
                                            <td>{t('ServiceStatusT')}</td>
                                            <td><ChannelStatus serviceStatus={serviceStatus} /></td>
                                        </tr>
                                        <tr>
                                            <td>{t('TransferredT')}</td>
                                            <td>{channel.usage.current} {channel.usage.unit}</td>
                                        </tr>
                                        <tr>
                                            <td>{t('CostT')}</td>
                                            <td>{toFixedN({number: (channel.usage.cost / 1e8), fixed: 8})} PRIX</td>
                                        </tr>
                                        <tr>
                                            <td>{t('DepositT')}</td>
                                            <td>{toFixedN({number: (channel.totalDeposit / 1e8), fixed: 8})} PRIX</td>
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

                    <ClientAccessInfo channel={channel} />
                </div>


                <div className='col-4'>
                    {serviceStatus === 'active' ? <IncreaseDepositButton channel={channel} render={render} /> : '' }
                    { !['terminating', 'terminated'].includes(serviceStatus) ? <FinishServiceButton channel={channel} /> : ''}

                    <TerminateContractButton
                        status='disabled'
                        payment={channel.usage.cost}
                        channelId={channel.id}
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

export default ws<IProps>(withRouter(Connection));
