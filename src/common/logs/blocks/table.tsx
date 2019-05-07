import * as React from 'react';
import { translate } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import LogsStack from '../logsStack';
import LogsContext from '../logsContext';

import ModalWindow from 'common/modalWindow';
import { Level, LogsDate, Message, Context, Stack } from 'common/tables/';

import { Log } from 'typings/logs';

interface IProps {
    t?: any;
    logs: Log[];
    lang: string;
}

const translated = translate(['logs/logsList', 'common']);

function logsTable(props: IProps) {

    const { t, logs, lang } = props;

    const columns = [
        Level,
        LogsDate,
        Message,
        Context,
        Stack
    ];

    const noResults = logs.length === 0
        ? <p className='text-warning text-center m-t-20 m-b-20'>{t('common:NoResults')}</p>
        : null;

    const logsData = logs.map(log => (
        {
            level: log.level,
            date: [log.time, lang],
            message: log.message,
            context: Object.keys(log.context).length !== 0
                ? <ModalWindow customClass='btn btn-link waves-effect'
                               modalTitle={t('Context')}
                               text={t('ShowBtn')}
                               component={<LogsContext context={log.context}/>}
                />
                : null,
            stack: log.stack !== null
                ? <ModalWindow customClass='btn btn-link waves-effect'
                               modalTitle={t('StackTrace')}
                               text={t('ShowBtn')}
                               component={<LogsStack context={log.stack}/>}
                  />
                : null
        }
    ));

    return (
        <div className='bootstrap-table bootstrap-table-sortable m-b-30'>
            <SortableTable
                data={logsData}
                columns={columns}/>
            {noResults}
        </div>
    );
}

export default translated(logsTable);
