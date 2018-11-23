import * as React from 'react';
import ModalWindow from '../../components/modalWindow';
import Connection from './connection';
import ContractStatus from '../../components/channels/contractStatus';
import ChannelStatus from '../../components/channels/channelStatusStyle';
import JobStatus from './jobStatus';
import JobName from './jobName';
import Usage from './usage';
import { withRouter } from 'react-router-dom';
import toFixedN from '../../utils/toFixedN';
import { translate } from 'react-i18next';
import CopyToClipboard from '../../components/copyToClipboard';
import ModalPropTextSorter from '../../components/utils/sorters/sortingModalByPropText';
import SortableTable from 'react-sortable-table-vilan';
import OfferingById from './offeringById';

@translate('client/connections/active')

class ActiveConnection extends React.Component<any, any>{

    constructor(props: any){
        super(props);

        this.state = {
            popup: false,
        };
    }

    private getColumns(){

        const { t } = this.props;

        return [
            {
                header: t('Id'),
                key: 'id',
                dataProps: { className: 'shortTableTextTd' },
                descSortFunction: ModalPropTextSorter.desc,
                ascSortFunction: ModalPropTextSorter.asc
            },
            {
                header: t('Offering'),
                key: 'offering',
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
                render: (status) => { return <ContractStatus contractStatus={status}/>; }
            },
            {
                header: t('ServiceStatus'),
                key: 'serviceStatus',
                render: (status) => { return <ChannelStatus serviceStatus={status}/>; }
            },
            {
                header: t('JobStatus'),
                key: 'jobStatus',
                render: ([jobtype, jobStatus, jobTime]) => { return <div><JobName jobtype={jobtype} /> ({jobStatus} {jobTime})</div>;}
            },
            {
                header: t('Usage'),
                key: 'usage',
                render: (usage) => { return <Usage usage={usage} />; }
            },
            {
                header: t('CostPRIX'),
                key: 'costPRIX'
            }
        ];
    }

    render() {

        const { t, channels } = this.props;

        const connections = channels.map((channel: any) => {

            const jobTimeRaw = new Date(Date.parse(channel.job.createdAt));
            const jobTime = jobTimeRaw.getHours() + ':' + (jobTimeRaw.getMinutes() < 10 ? '0' : '') + jobTimeRaw.getMinutes();
            const jobStatus = <JobStatus status={channel.job.status} />;

            return {
                id: <ModalWindow
                    visible={this.state.popup}
                    customClass='shortTableText'
                    modalTitle={t('Connection')}
                    text={channel.id}
                    copyToClipboard={true}
                    component={<Connection connection={channel} />}
                />,
                offering: <ModalWindow
                    visible={this.state.popup}
                    customClass='shortTableText'
                    modalTitle={t('Offering')}
                    text={channel.offeringHash}
                    copyToClipboard={true}
                    component={<OfferingById offeringId={channel.offering} />}
                />,
                agent: channel.agent,
                contractStatus: channel.channelStatus.channelStatus,
                serviceStatus: channel.channelStatus.serviceStatus,
                jobStatus: [channel.job.jobtype, jobStatus, jobTime],
                usage: channel.usage,
                costPRIX: toFixedN({number: (channel.usage.cost / 1e8), fixed: 8})
            };
        });

        return <div className='row'>
            <div className='col-12'>
                <div className='card m-b-20'>
                    <h5 className='card-header'>{t('ActiveConnection')}</h5>
                    <div className='col-md-12 col-sm-12 col-xs-12 p-0'>
                        <div className='card-body'>
                            <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                                <SortableTable
                                    data={connections}
                                    columns={this.getColumns()}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default withRouter(ActiveConnection);
