import * as React from 'react';

import SortableTable from 'react-sortable-table-vilan';
import { CopyableId, Started, Stopped, PlainUsage, LastUsed, ClientIP } from 'common/tables/';

export default class SessionsTable extends React.Component <any,any> {


    render() {

        const { data } = this.props;

        const columns = [
            CopyableId,
            Started,
            Stopped,
            PlainUsage,
            LastUsed,
            ClientIP,
        ];

        return <div className='bootstrap-table bootstrap-table-sortable'>
            <SortableTable
                data={data}
                columns={columns} />
        </div>;
    }
}
