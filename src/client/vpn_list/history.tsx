import * as React from 'react';
import { translate } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import ContractStatus from 'common/badges/contractStatus';
import ChannelStatus from 'common/badges/channelStatus';
import JobStatus from 'common/badges/jobStatus';
import JobName from 'common/badges/jobName';
import Usage from 'common/badges/channelUsage';

import ServiceView from './serviceView';

import PgTime from 'common/etc/pgTime';
import ModalWindow from 'common/modalWindow';
import DateSorter from 'common/sorters/sortingDate';
import ModalPropTextSorter from 'common/sorters/sortingModalByPropText';
import CopyToClipboard from 'common/copyToClipboard';

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
        const updatedChannels = allTerminatedChannels.map((channel, i) => Object.assign({}, channel, {usage: usages[i]}));

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
                usage: [channel.id, channel.usage],
                cost: [channel.id, channel.usage],
                lastUsed: channel.channelStatus.lastChanged
            };
        });

        const activeContractChannelsView = activeContractChannels.map((channel) => {
            let jobTimeRaw = new Date(Date.parse(channel.job.createdAt));
            let jobTime = jobTimeRaw.getHours() + ':' + (jobTimeRaw.getMinutes() < 10 ? '0' : '') + jobTimeRaw.getMinutes();
            const jobStatus = <JobStatus status={channel.job.status} />;

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
                jobStatus: <span><JobName jobtype={channel.job.jobtype} /> ({jobStatus} {jobTime})</span>,
                usage: [channel.id, channel.usage],
                cost: [channel.id, channel.usage],
            };
        });

        const awaitForTerminateColumns = [
            {
                header: t('Id'),
                key: 'id',
                dataProps: { className: 'shortTableTextTd' },
                descSortFunction: ModalPropTextSorter.desc,
                ascSortFunction: ModalPropTextSorter.asc
            },
            {
                header: t('Agent'),
                key: 'agent',
                dataProps: { className: 'shortTableTextTd' },
                render: (agent) => {
                    return <div>
                        <span className='shortTableText' title={agent}>{agent}</span>
                        <CopyToClipboard text={agent} />
                    </div>;
                }

            },
            {
                header: t('ContractStatus'),
                key: 'contractStatus',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
                render: (contractStatus) => <ContractStatus contractStatus={contractStatus} />
            },
            {
                header: t('ServiceStatus'),
                key: 'serviceStatus',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
                render: (serviceStatus) => <ChannelStatus serviceStatus={serviceStatus} />
            },
            {
                header: t('JobStatus'),
                key: 'jobStatus',
                sortable: false
            },
            {
                header: t('Usage'),
                key: 'usage',
                render: ([channelId, usage]) => <Usage usage={usage} mode='unit' />
            },
            {
                header: t('CostPRIX'),
                key: 'cost',
                render: ([channelId, usage]) => <Usage usage={usage} mode='prix' />
            }
        ];

        const historyColumns = [
            {
                header: t('Id'),
                key: 'id',
                dataProps: { className: 'shortTableTextTd' },
                descSortFunction: ModalPropTextSorter.desc,
                ascSortFunction: ModalPropTextSorter.asc
            },
            {
                header: t('Agent'),
                key: 'agent',
                dataProps: { className: 'shortTableTextTd' },
                render: (agent) => {
                    return <div>
                        <span className='shortTableText' title={agent}>{agent}</span>
                        <CopyToClipboard text={agent} />
                    </div>;
                }
            },
            {
                header: t('ContractStatus'),
                key: 'contractStatus',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
                render: (contractStatus) => <ContractStatus contractStatus={contractStatus} />
            },
            {
                header: t('Usage'),
                key: 'usage',
                render: ([channelId, usage]) => <Usage usage={usage} channelId={channelId} mode='unit' />
            },
            {
                header: t('CostPRIX'),
                key: 'cost',
                render: ([channelId, usage]) => <Usage usage={usage} channelId={channelId} mode='prix' />
            },
            {
                header: t('LastUsed'),
                key: 'lastUsed',
                render: (lastUsed) => <PgTime time={lastUsed} />,
                descSortFunction: DateSorter.desc,
                ascSortFunction: DateSorter.asc

            }
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
