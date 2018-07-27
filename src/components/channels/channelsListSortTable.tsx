import * as React from 'react';
import { withRouter } from 'react-router-dom';
import PgTime from '../utils/pgTime';
import ChannelStatusStyle from './channelStatusStyle';
import ContractStatus from './contractStatus';
import SortableTable from 'react-sortable-table-vilan';
import ModalPropTextSorter from '../utils/sorters/sortingModalByPropText';
import DateSorter from '../utils/sorters/sortingDate';
import ChannelUsage from './channelUsage';

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
        const columns = [
            {
                header: 'ID',
                key: 'id',
                descSortFunction: ModalPropTextSorter.desc,
                ascSortFunction: ModalPropTextSorter.asc
            },
            {
                header: 'Server',
                key: 'server',
                descSortFunction: ModalPropTextSorter.desc,
                ascSortFunction: ModalPropTextSorter.asc
            },
            {
                header: 'Client',
                key: 'client'
            },
            {
                header: 'Contract Status',
                key: 'contractStatus',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
                render: (channelStatus) => <ContractStatus contractStatus={channelStatus} />
            },
            {
                header: 'Service Status',
                key: 'serviceStatus',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
                render: (serviceStatus) => <ChannelStatusStyle serviceStatus={serviceStatus} />
            },
            {
                header: 'Usage',
                key: 'usage',
                render: (channelId) => {return (typeof channelId as any)=== 'object'? <ChannelUsage channelId={channelId[0]} trafficLimit={channelId[1]}/>:<ChannelUsage channelId={channelId}/>;}
            },
            {
                header: 'Income (PRIX)',
                key: 'incomePRIX',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
            },
            {
                header: 'Service Changed Time',
                key: 'serviceChangedTime',
                defaultSorting: 'DESC',
                descSortFunction: DateSorter.desc,
                ascSortFunction: DateSorter.asc,
                render: (serviceChangedTime) => <PgTime time={serviceChangedTime} />
            }
        ];

        return <div className='bootstrap-table bootstrap-table-sortable'>
            <SortableTable
                data={this.state.tableData}
                columns={columns} />
        </div>;
    }

}

export default withRouter(ChannelsTable);
