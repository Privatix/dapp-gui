import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import SortableTable from 'react-sortable-table-vilan';

import { WS, ws } from 'utils/ws';

import { ClientChannel } from 'typings/channels';

import { Id, Agent, Server, Started, Stopped, LastUsed, ClientIP } from 'common/tables/';

import ChannelCommonInfo from 'client/components/channelCommonInfo';
import ClientAccessInfo from 'client/endpoints/clientAccessInfo';

import TerminateContractButton from './terminateContractButton';
import FinishServiceButton from './finishServiceButton';
import IncreaseDepositButton from './increaseDepositButton';

interface IProps extends WithTranslation {
    ws?: WS;
    history?: any;
    channel: ClientChannel;
    render?: Function;
}

interface IState {
    sessions: any[];
}

class Connection extends React.Component<IProps, IState>{

    constructor(props: IProps){
        super(props);
        this.state = {sessions: []};
    }

    async componentDidMount(){
        const { ws, channel } = this.props;
        const sessionsRaw = await ws.getSessions(channel.id);
        const offering = await ws.getOffering(channel.offering);
        if (!offering) {
            return false;
        }
        const sessions = sessionsRaw.map(session => (
            {
                id: session.channel,
                agent: channel.agent,
                server: offering.serviceName,
                started: session.started,
                stopped: session.stopped,
                usage: session.unitsUsed,
                cost: (session.unitsUsed * offering.unitPrice)/1e8,
                lastUsedTime: session.lastUsageTime,
                clientIP: session.clientIP
            })
        );
        this.setState({sessions});
    }

    render(){

        const { t, render, channel } = this.props;
        const { sessions } = this.state;

        if(!channel){
            return null;
        }

        channel.usage.cost = channel.usage.cost || 0;
        channel.totalDeposit = channel.totalDeposit || 0;

        const sessionsColumns = [
            Id,
            Agent,
            Server,
            Started,
            Stopped,
            {
                header: t('Usage'),
                key: 'usage'
            },
            {
                header: t('tables:CostPRIX'),
                key: 'cost'
            },
            LastUsed,
            ClientIP
        ];

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
                                        data={sessions}
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

export default ws<IProps>(withRouter(withTranslation(['client/connections/connection', 'tables'])(Connection)));
