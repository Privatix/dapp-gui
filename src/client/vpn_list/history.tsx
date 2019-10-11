import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import ServiceView from './serviceView';

import { Id, Agent, ContractStatus, ServiceStatus, JobStatus, Usage, CostPRIX, LastUsed } from 'common/tables/';

import ModalWindow from 'common/modalWindow';

import { ClientChannel, ClientChannelUsage } from 'typings/channels';

import { ws, WS } from 'utils/ws';

interface IProps extends WithTranslation {
    ws?: WS;
}
interface IState {
    allTerminatedChannels: ClientChannel[];
}

class ClientHistory extends React.Component<IProps, IState> {

    subscribeId = null;
    mounted = false;

    constructor(props:IProps) {

        super(props);

        this.state = {allTerminatedChannels: []};
    }

    componentDidMount() {
        this.mounted = true;
        this.refresh();

    }

    componentWillUnmount(){
        this.mounted = false;
        const { ws } = this.props;

        if(this.subscribeId){
            ws.unsubscribe(this.subscribeId);
            this.subscribeId = null;
        }
    }

    refresh = async () => {

        const { ws } = this.props;

        const allTerminatedChannels = (await ws.getClientChannels([], ['terminated'], 0, 0)).items;
        const allClientChannels = (await ws.getClientChannels([], [], 0, 0)).items;

        if(this.mounted){
            this.subscribe(allClientChannels);
            this.setState({allTerminatedChannels});
        }
    }

    eventDispatcher = (event: any) => {
        if('job' in event){
            this.refresh();
        }else{
            this.updateUsage(event);
        }
    }

    async subscribe(channels: ClientChannel[]){

        const { ws } = this.props;

        if(this.subscribeId){
            await ws.unsubscribe(this.subscribeId);
        }
        const ids = channels.map(channel => channel.id);
        if(ids.length){
            this.subscribeId = await ws.subscribe('channels', ids, this.eventDispatcher);
        }
    }

    updateUsage(usages: {[key: string]: ClientChannelUsage}){

        if(this.mounted){
            const { allTerminatedChannels } = this.state;

            const updatedChannels = allTerminatedChannels.map(channel => Object.assign({}, channel, {usage: usages[channel.id]}));

            this.setState({allTerminatedChannels: updatedChannels});
        }
    }

    render() {

        const { t } = this.props;
        const { allTerminatedChannels } = this.state;

        const activeStatuses = ['active', 'wait_coop', 'wait_challenge', 'in_challenge', 'wait_coop'];
        const historyChannels = allTerminatedChannels.filter(channel => !activeStatuses.includes(channel.channelStatus.channelStatus));
        const activeContractChannels = allTerminatedChannels.filter(channel => activeStatuses.includes(channel.channelStatus.channelStatus));

        const historyChannelsView = historyChannels.map(channel => {
            return {
                id: <ModalWindow
                    customClass='shortTableText'
                    modalTitle={t('Service')}
                    text={channel.id}
                    copyToClipboard={true}
                    component={<ServiceView service={channel}/>}
                />,
                agent: channel.agent,
                contractStatus: channel.channelStatus.channelStatus,
                usage: channel.usage,
                costPRIX: channel.usage,
                lastUsedTime: channel.channelStatus.lastChanged
            };
        });

        const activeContractChannelsView = activeContractChannels.map((channel) => {

            return {
                id: <ModalWindow
                    customClass='shortTableText'
                    modalTitle={t('Service')}
                    text={channel.id}
                    copyToClipboard={true}
                    component={<ServiceView service={channel} />}
                />,
                agent: channel.agent,
                contractStatus: channel.channelStatus.channelStatus,
                serviceStatus: channel.channelStatus.serviceStatus,
                jobStatus: channel.job,
                usage: channel.usage,
                costPRIX: channel.usage,
            };
        });

        const awaitForTerminateColumns = [
            Id,
            Agent,
            ContractStatus,
            ServiceStatus,
            JobStatus,
            Usage,
            CostPRIX
        ];

        const historyColumns = [
            Id,
            Agent,
            ContractStatus,
            Usage,
            CostPRIX,
            LastUsed
        ];

        return <div className='col-lg-12 col-md-12'>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('AwaitForTerminate')}</h5>
                <div className='card-body'>
                    <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                        <SortableTable
                            data={activeContractChannelsView}
                            columns={awaitForTerminateColumns}/>
                    </div>
                </div>
            </div>

            <div className='card m-b-20'>
                <h5 className='card-header'>{t('History')}</h5>
                <div className='card-body'>
                    <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                        <SortableTable
                            data={historyChannelsView}
                            columns={historyColumns}/>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default ws<IProps>(withTranslation(['client/history', 'utils/notice'])(ClientHistory));
