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
        notice({level: 'info', title: 'Congratulations!', msg: 'Page was successfully refreshed!'});
    }

    getHistoryData() {
        let endpoint = '/client/channels?serviceStatus=terminated';
        fetch(endpoint, {}).then(async (clientChannels) => {
            const historyData = (clientChannels as any).filter((channel) => {
                if (channel.channelStatus.channelStatus !== 'active') {
                    return true;
                }
            }).map((channel) => {
                return {
                    id: <ModalWindow customClass='' modalTitle='Service' text={channel.id}
                                     component={<ServiceView service={channel}/>}/>,
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
        fetch(endpoint, {}).then(async (clientChannels) => {
            const data = (clientChannels as any).map((channel) => {
                let jobTimeRaw = new Date(Date.parse(channel.job.createdAt));
                let jobTime = jobTimeRaw.getHours() + ':' + (jobTimeRaw.getMinutes() < 10 ? '0' : '') + jobTimeRaw.getMinutes();

                return {
                    id: <ModalWindow customClass='' modalTitle='Service' text={channel.id} component={<ServiceView service={channel} />} />,
                    agent: channel.agent,
                    contractStatus: channel.channelStatus.channelStatus,
                    serviceStatus: channel.channelStatus.serviceStatus,
                    jobStatus: channel.job.jobtype + ' (' +channel.job.status.charAt(0).toUpperCase() + channel.job.status.slice(1) +' ' + jobTime + ')',
                    usage: channel.usage.current + ' ' + channel.usage.unit + ' of ' + channel.usage.maxUsage + ' ' + channel.usage.unit,
                    cost: channel.usage.cost / 1e8
                };
            });

            this.setState({awaitForTerminateData: data});
        });
    }

    render() {
        const awaitForTerminateColumns = [
            {
                header: 'Id',
                key: 'id',
                descSortFunction: ModalPropTextSorter.desc,
                ascSortFunction: ModalPropTextSorter.asc
            },
            {
                header: 'Agent',
                key: 'agent'
            },
            {
                header: 'Contract status',
                key: 'contractStatus',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
                render: (contractStatus) => { return <ContractStatus contractStatus={contractStatus} />; }
            },
            {
                header: 'Service status',
                key: 'serviceStatus',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
                render: (serviceStatus) => { return <ChannelStatus serviceStatus={serviceStatus} />; }
            },
            {
                header: 'Job status',
                key: 'jobStatus',
                sortable: false
            },
            {
                header: 'Usage',
                key: 'usage'
            },
            {
                header: 'Cost (PRIX)',
                key: 'cost'
            }
        ];

        const historyColumns = [
            {
                header: 'Id',
                key: 'id',
                descSortFunction: ModalPropTextSorter.desc,
                ascSortFunction: ModalPropTextSorter.asc
            },
            {
                header: 'Agent',
                key: 'agent'
            },
            {
                header: 'Contract status',
                key: 'contractStatus',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
                render: (contractStatus) => { return <ContractStatus contractStatus={contractStatus} />; }
            },
            {
                header: 'Usage',
                key: 'usage'
            },
            {
                header: 'Cost (PRIX)',
                key: 'cost'
            },
            {
                header: 'Last used',
                key: 'lastUsed',
                render: (lastUsed) => { return <PgTime time={lastUsed} />; },
                descSortFunction: DateSorter.desc,
                ascSortFunction: DateSorter.asc

            }
        ];

        return <div className='col-lg-12 col-md-12'>
            <div className='m-t-5 m-b-20'>
                <button className='btn btn-default btn-custom waves-effect waves-light' onClick={this.refresh.bind(this)}>Refresh</button>
            </div>
            <div className='card m-b-20'>
                <h5 className='card-header'>Awaite for terminate</h5>
                <div className='card-body'>
                    <div className='bootstrap-table bootstrap-table-sortable'>
                        <SortableTable
                            data={this.state.awaitForTerminateData}
                            columns={awaitForTerminateColumns}/>
                    </div>
                </div>
            </div>

            <div className='card m-b-20'>
                <h5 className='card-header'>History</h5>
                <div className='card-body'>
                    <div className='bootstrap-table bootstrap-table-sortable'>
                        <SortableTable
                            data={this.state.historyData}
                            columns={historyColumns}/>
                    </div>
                </div>
            </div>
        </div>;
    }
}
