import * as React from 'react';
import { translate } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import { Level, LogsDate, Message, Context, Stack } from 'common/tables/';

const translated = translate(['common']);

interface IProps {
    t?: any;
    logsDataArr: Object[];
}

function logsTable(props: IProps) {

    const { t } = props;

    const columns = [
        Level,
        LogsDate,
        Message,
        Context,
        Stack
    ];

    const { logsDataArr } = props;
    const noResults = logsDataArr.length === 0
        ? <p className='text-warning text-center m-t-20 m-b-20'>{t('NoResults')}</p>
        : null;

    return (
        <div className='bootstrap-table bootstrap-table-sortable m-b-30'>
            <SortableTable
                data={logsDataArr}
                columns={columns}/>
            {noResults}
        </div>
    );
}

export default translated(logsTable);
