import * as React from 'react';
import { withRouter } from 'react-router-dom';

import SortableTable from 'react-sortable-table-vilan';

import { Id, Server, Client, ContractStatus, ServiceStatus, Usage, IncomePRIX, ServiceLastChanged } from 'common/tables/';

class ChannelsTable extends React.Component<any, any> {

    render() {

        const { data } = this.props;

        const sortedData = data.sort((a, b) => Date.parse(a.serviceChangedTime) >= Date.parse(b.serviceChangedTime) ? -1 : 1);

        const columns = [
            Id,
            Server,
            Client,
            ContractStatus,
            ServiceStatus,
            Usage,
            IncomePRIX,
            ServiceLastChanged
        ];

        return (
            <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                <SortableTable
                    data={sortedData}
                    columns={columns} />
            </div>
        );
    }
}

export default withRouter(ChannelsTable);
