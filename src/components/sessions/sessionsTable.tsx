import * as React from 'react';
import SortableTable from 'react-sortable-table-vilan';
import PgTime from '../utils/pgTime';
import { translate } from 'react-i18next';

@translate(['sessions/sessionsList'])

export default class SessionsTable extends React.Component <any,any> {
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
                sortable: false
            },
            {
                header: t('Started'),
                key: 'started',
                sortable: false,
                render: (started) => <PgTime time={started} />
            },
            {
                header: t('Stopped'),
                key: 'stopped',
                sortable: false,
                render: (stopped) => <PgTime time={stopped} />
            },
            {
                header: t('Usage'),
                key: 'usage',
                sortable: false
            },
            {
                header: t('LastUsageTime'),
                key: 'lastUsageTime',
                sortable: false,
                render: (lastUsageTime) => <PgTime time={lastUsageTime} />
            },
            {
                header: t('ClientIP'),
                key: 'clientIP',
                sortable: false
            },
        ];

        return <div className='bootstrap-table bootstrap-table-sortable'>
            <SortableTable
                data={this.state.tableData}
                columns={columns} />
        </div>;
    }

}
