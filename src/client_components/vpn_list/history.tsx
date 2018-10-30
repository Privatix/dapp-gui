import * as React from 'react';
import {fetch} from '../../utils/fetch';
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
import { translate } from 'react-i18next';
import CopyToClipboard from '../../components/copyToClipboard';

@translate(['client/history', 'utils/notice'])

export default class ClientHistory extends React.Component<any,any> {

    constructor(props:any) {
        super(props);

        this.state = {
            historyData: [],
            awaitForTerminateData: []
        };
    }

    componentDidMount() {
        this.getHistoryData();
        this.getAwaitForTerminateColumns();
    }

    refresh() {
        this.getHistoryData();
        this.getAwaitForTerminateColumns();
        const { t } = this.props;
        notice({level: 'info', title: t('utils/notice:Congratulations!'), msg: t('SuccessfullyRefreshed')});
    }

    getHistoryData() {
        let endpoint = '/client/channels?serviceStatus=terminated';
        const { t } = this.props;
        fetch(endpoint, {}).then(async (clientChannels) => {
            const historyData = (clientChannels as any).filter((channel) => {
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
        });
    }

    getAwaitForTerminateColumns() {
        let endpoint = '/client/channels?channelStatus=active&serviceStatus=terminated';
        const { t } = this.props;
        fetch(endpoint, {}).then(async (clientChannels) => {
            const data = (clientChannels as any).map((channel) => {
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
        });
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
                <button className='btn btn-default btn-custom waves-effect waves-light' onClick={this.refresh.bind(this)}>{t('Refresh')}</button>
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
