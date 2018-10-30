import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { translate } from 'react-i18next';

import PgTime from '../utils/pgTime';
import ChannelStatusStyle from './channelStatusStyle';
import ContractStatus from './contractStatus';
import SortableTable from 'react-sortable-table-vilan';
import ModalPropTextSorter from '../utils/sorters/sortingModalByPropText';
import DateSorter from '../utils/sorters/sortingDate';
import ChannelUsage from './channelUsage';
import CopyToClipboard from '../copyToClipboard';

@translate(['channels/channelsListSortTable'])
class ChannelsTable extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            tableData: props.data
        };
    }

    static getDerivedStateFromProps(props:any, state:any) {
        return {
            tableData: props.data
        };
    }

    render() {

        const { t } = this.props;

        const columns = [
            {
                header: 'ID',
                key: 'id',
                dataProps: { className: 'shortTableTextTd' },
                descSortFunction: ModalPropTextSorter.desc,
                ascSortFunction: ModalPropTextSorter.asc
            },
            {
                header: t('Server'),
                key: 'server',
                descSortFunction: ModalPropTextSorter.desc,
                ascSortFunction: ModalPropTextSorter.asc
            },
            {
                header: t('Client'),
                key: 'client',
                dataProps: { className: 'shortTableTextTd' },
                render: (client) => {
                    const clientText = '0x' + client;
                    return <div>
                        <span className='shortTableText' title={clientText}>{clientText}</span>
                        <CopyToClipboard text={clientText} />
                    </div>;
                }
            },
            {
                header: t('ContractStatus'),
                key: 'contractStatus',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
                render: (channelStatus) => <ContractStatus contractStatus={channelStatus} />
            },
            {
                header: t('ServiceStatus'),
                key: 'serviceStatus',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
                render: (serviceStatus) => <ChannelStatusStyle serviceStatus={serviceStatus} />
            },
            {
                header: t('Usage'),
                key: 'usage',
                render: (channelId) => {return (typeof channelId as any)=== 'object'? <ChannelUsage channelId={channelId[0]} trafficLimit={channelId[1]}/>:<ChannelUsage channelId={channelId}/>;}
            },
            {
                header: t('Income'),
                key: 'incomePRIX',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
            },
            {
                header: t('ServiceChangedTime'),
                key: 'serviceChangedTime',
                defaultSorting: 'DESC',
                descSortFunction: DateSorter.desc,
                ascSortFunction: DateSorter.asc,
                render: (serviceChangedTime) => <PgTime time={serviceChangedTime} />
            }
        ];

        return <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
            <SortableTable
                data={this.state.tableData}
                columns={columns} />
        </div>;
    }

}

export default withRouter(ChannelsTable);
