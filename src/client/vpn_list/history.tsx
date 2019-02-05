import * as React from 'react';
import { translate } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import ServiceView from './serviceView';

import { Id, Agent, ContractStatus, ServiceStatus, JobStatus, Usage, CostPRIX, LastUsed } from 'common/tables/';

import ModalWindow from 'common/modalWindow';

import { ClientChannel } from 'typings/channels';

import { ws, WS } from 'utils/ws';

interface IProps {
    t?: any;
    ws?: WS;
}
interface IState {
    allTerminatedChannels: ClientChannel[];
}

@translate(['client/history', 'utils/notice'])
class ClientHistory extends React.Component<IProps, IState> {

    subscribeId = null;
    polling = null;

    constructor(props:IProps) {

        super(props);

        this.state = {allTerminatedChannels: []};
    }

    componentDidMount() {

        this.refresh();

    }

    componentWillUnmount(){

        const { ws } = this.props;

        if(this.subscribeId){
            ws.unsubscribe(this.subscribeId);
            this.subscribeId = null;
        }

        if(this.polling){
            clearTimeout(this.polling);
            this.polling = null;
        }

    }

    refresh = () => {

        this.getHistoryData();

    }

    async subscribe(channels: ClientChannel[]){

        const { ws } = this.props;

        if(this.subscribeId){
            await ws.unsubscribe(this.subscribeId);
        }
        const ids = channels.map(channel => channel.id);
        this.subscribeId = await ws.subscribe('channel', ids, this.refresh);
        this.updateUsage();
    }

    async getHistoryData() {

        const { ws } = this.props;
        const allTerminatedChannels = (await ws.getClientChannels([], ['terminated'], 0, 0)).items;

        const allClientChannels = await ws.getClientChannels([], [], 0, 0);
        this.subscribe(allClientChannels.items);

        this.setState({allTerminatedChannels});
    }

    updateUsage = async () => {

        const { ws } = this.props;
        const { allTerminatedChannels } = this.state;

        const ids = allTerminatedChannels.map(channel => channel.id);
        const usages = await ws.getChannelsUsage(ids);
        const updatedChannels = allTerminatedChannels.map(channel => Object.assign({}, channel, {usage: usages[channel.id]}));

        this.setState({allTerminatedChannels: updatedChannels});

        this.polling = setTimeout(this.updateUsage, 2000);
    }

    render() {

        const { t } = this.props;
        const { allTerminatedChannels } = this.state;

        const historyChannels = allTerminatedChannels.filter(channel => channel.channelStatus.channelStatus !== 'active');
        const activeContractChannels = allTerminatedChannels.filter(channel => channel.channelStatus.channelStatus === 'active');

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

export default ws<IProps>(ClientHistory);
