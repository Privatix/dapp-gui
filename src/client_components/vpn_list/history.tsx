import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import PgTime from '../../components/utils/pgTime';
import ContractStatus from '../../components/channels/contractStatus';
import ChannelStatus from '../../components/channels/channelStatusStyle';
import ServiceView from './serviceView';
import notice from '../../utils/notice';
import ModalWindow from '../../components/modalWindow';
import DateSorter from '../../components/utils/sorters/sortingDate';
import ModalPropTextSorter from '../../components/utils/sorters/sortingModalByPropText';
import JobStatus from '../connections/jobStatus';
import JobName from '../connections/jobName';
import CopyToClipboard from '../../components/copyToClipboard';

import { State } from 'typings/state';
import { ClientChannel } from 'typings/channels';

@translate(['client/history', 'utils/notice'])

class ClientHistory extends React.Component<any,any> {

    constructor(props:any) {

        super(props);

        this.state = {
            historyData: [],
            awaitForTerminateData: [],
            ids: [],
            subscribeId: null
        };
    }

    componentDidMount() {

        this.refresh();

    }

    componentWillUnmount(){

        const { ws } = this.props;

        ws.unsubscribe(this.state.subscribeId);

    }

    refresh = () => {

        this.getHistoryData();
        this.getAwaitForTerminateColumns();

    }

    onRefresh = () => {

        const { t } = this.props;

        this.refresh();
        notice({level: 'info', title: t('utils/notice:Congratulations!'), msg: t('SuccessfullyRefreshed')});

    }

    private getIds(channels: ClientChannel[]): string[]{

        return channels.map(channel => channel.id);

    }

    subscribe(channels: ClientChannel[]){

        const { ws } = this.props;
        const ids = this.state.ids.concat(this.getIds(channels)).filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);

        this.setState({ids});

        if(this.state.subsribeId){
            ws.unsubscribe(this.state.subscribeId);
        }

        this.setState({subscribeId: ws.subscribe('channel', ids, this.refresh)});
    }

    async getHistoryData() {

        const { t, ws } = this.props;
        const clientChannels = await ws.getClientChannels('', 'terminated', 0, 0);

        this.subscribe(clientChannels.items);

        const historyData = clientChannels.items.filter((channel) => {
            if (channel.channelStatus.channelStatus !== 'active') {
                return true;
            }
        }).map((channel) => {
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
                usage: channel.usage.current + ' ' + channel.usage.unit,
                cost: channel.usage.cost / 1e8,
                lastUsed: channel.channelStatus.lastChanged
            };
        });

        this.setState({historyData});
    }

    async getAwaitForTerminateColumns() {

        const { t, ws } = this.props;
        const clientChannels = await ws.getClientChannels('active', 'terminated', 0, 0);

        this.subscribe(clientChannels.items);

        const data = clientChannels.items.map((channel) => {
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
                usage: channel.usage.current + ' ' + channel.usage.unit + ' ' + t('of') + ' ' + channel.usage.maxUsage + ' ' + channel.usage.unit,
                cost: channel.usage.cost / 1e8
            };
        });

        this.setState({awaitForTerminateData: data});
    }

    render() {

        const { t } = this.props;
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
                key: 'usage'
            },
            {
                header: t('CostPRIX'),
                key: 'cost'
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
                key: 'usage'
            },
            {
                header: t('CostPRIX'),
                key: 'cost'
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
            <div className='m-t-5 m-b-20'>
                <button className='btn btn-default btn-custom waves-effect waves-light' onClick={this.onRefresh}>{t('Refresh')}</button>
            </div>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('AwaitForTerminate')}</h5>
                <div className='card-body'>
                    <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                        <SortableTable
                            data={this.state.awaitForTerminateData}
                            columns={awaitForTerminateColumns}/>
                    </div>
                </div>
            </div>

            <div className='card m-b-20'>
                <h5 className='card-header'>{t('History')}</h5>
                <div className='card-body'>
                    <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                        <SortableTable
                            data={this.state.historyData}
                            columns={historyColumns}/>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect((state: State) => ({ws: state.ws}))(ClientHistory);
