import * as React from 'react';
import { translate } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import DateSorter from '../../sorters/sortingDate';
import LogsTime from '../../etc/logsTime';

const translated = translate(['logs/logsList', 'common']);

interface IProps {
    t?: any;
    lang: string;
    logsDataArr: Object[];
}

function logsTable(props: IProps) {
    const { t } = props;

    const labelClasses = {
        debug: 'primary',
        info: 'success',
        warning: 'warning',
        error: 'pink',
        fatal: 'danger'
    };

    const columns = [
        {
            header: t('Level'),
            key: 'level',
            render: (level) => {
                return <span className={`label label-table label-${labelClasses[level]}`}>{level}</span>;
            }
        },
        {
            header: t('Date'),
            key: 'date',
            dataProps: {className: 'minWidth160'},
            descSortFunction: DateSorter.desc,
            ascSortFunction: DateSorter.asc,
            render: (date) => <LogsTime time={date} lang={props.lang} />
        },
        {
            header: t('Message'),
            key: 'message',
            sortable: false
        },
        {
            header: t('Context'),
            key: 'context',
            sortable: false
        },
        {
            header: t('Stack'),
            key: 'stack',
            sortable: false

        }
    ];

    const { logsDataArr } = props;
    const noResults = logsDataArr.length === 0
        ? <p className='text-warning text-center m-t-20 m-b-20'>{t('common:NoResults')}</p>
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
