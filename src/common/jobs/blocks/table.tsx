import * as React from 'react';
import { translate } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import JobDataComponent from '../jobData';

import Restart from './restartBtn';

import ModalWindow from 'common/modalWindow';
import { JobStatusSimple, CopyableId, JobType, JobCreatedAt, JobData, JobActions } from 'common/tables/';

import { Job } from 'typings/jobs';

interface IProps {
    t?: any;
    jobs: Job[];
}

const translated = translate(['jobs/jobsList', 'common']);

function jobsTable(props: IProps) {

    const { t, jobs } = props;

    const columns = [
        JobStatusSimple,
        CopyableId,
        JobType,
        JobCreatedAt,
        JobData,
        JobActions
    ];

    const noResults = jobs.length === 0
        ? <p className='text-warning text-center m-t-20 m-b-20'>{t('common:NoResults')}</p>
        : null;

    const jobsData = jobs.map(job => (
        {
            jobStatusSimple: job.status,
            id: job.id,
            jobType: job.jobtype,
            jobCreatedAt: job.createdAt,
            jobData:
                <ModalWindow customClass='btn btn-link waves-effect'
                             modalTitle={t('JobData')}
                             text={t('ShowBtn')}
                             component={<JobDataComponent job={job}/>}
                />,
            jobActions: <Restart jobId={job.id} />
        }
    ));

    return (
        <div className='bootstrap-table bootstrap-table-sortable m-b-30'>
            <SortableTable
                data={jobsData}
                columns={columns}/>
            {noResults}
        </div>
    );
}

export default translated(jobsTable);
