import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import SortableTable from 'react-sortable-table-vilan';

import { ws } from 'utils/ws';

import { State } from 'typings/state';

import { Id, Agent, Server, Started, Stopped, LastUsed, ClientIP } from 'common/tables/';

import ChannelCommonInfo from 'client/components/channelCommonInfo';
import ClientAccessInfo from 'client/endpoints/clientAccessInfo';

import TerminateContractButton from './terminateContractButton';
import FinishServiceButton from './finishServiceButton';
import IncreaseDepositButton from './increaseDepositButton';

interface IProps extends WithTranslation {
    ws?: State['ws'];
    history?: any;
    channel: State['channel'];
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
        const sessionsRaw = await ws.getSessions(channel.model.id);
        const offering = await ws.getOffering(channel.model.offering);
        if (!offering) {
            return false;
        }
        const sessions = sessionsRaw.map(session => (
            {
                id: session.channel,
                agent: channel.model.agent,
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

        const usage = channel.getUsage();
        const channelModel = channel.model;
        channelModel.totalDeposit = channelModel.totalDeposit || 0;

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

        const serviceStatus = channelModel.channelStatus.serviceStatus;

        return <>
            <div className='row'>
                <div className='col-8'>
                    <ChannelCommonInfo channel={channel.model} render={render} />
                    <ClientAccessInfo channel={channel.model} />
                </div>
                <div className='col-4'>
                    {serviceStatus === 'active' ? <IncreaseDepositButton channel={channelModel} render={render} /> : '' }
                    { !['terminating', 'terminated'].includes(serviceStatus) ? <FinishServiceButton channel={channel} usage={usage} /> : ''}

                    <TerminateContractButton
                        status='disabled'
                        payment={usage.cost}
                        channelId={channelModel.id}
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
