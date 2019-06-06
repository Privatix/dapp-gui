import * as React from 'react';
import { translate } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import SortableTable from 'react-sortable-table-vilan';

import {ClientChannel} from 'typings/channels';

import { Id, Agent, Server, Offering as OfferingCol } from 'common/tables/';

import ChannelCommonInfo from 'client/components/channelCommonInfo';
import ClientAccessInfo from 'client/endpoints/clientAccessInfo';

import TerminateContractButton from './terminateContractButton';
import FinishServiceButton from './finishServiceButton';
import IncreaseDepositButton from './increaseDepositButton';

interface IProps{
    t?: any;
    history?: any;
    channel: ClientChannel;
    render?: Function;
}

@translate('client/connections/connection')
class Connection extends React.Component<IProps, {}>{

    render(){

        const { t, render, channel } = this.props;

        if(!channel){
            return null;
        }

        channel.usage.cost = channel.usage.cost || 0;
        channel.totalDeposit = channel.totalDeposit || 0;

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

        return <>
            <div className='row'>
                <div className='col-8'>
                    <ChannelCommonInfo channel={channel} render={render} />
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
        </>;
    }
}

export default withRouter(Connection);
