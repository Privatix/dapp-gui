import * as React from 'react';

import { JobType } from 'typings/jobs';

interface IProps {
    job: JobType;
}

export default class JobData extends React.Component <IProps, {}> {

    render() {

        const { job } = this.props;

        const data = JSON.parse(atob(job.Data));
        // data.data = JSON.parse(atob(data.data));
        return <div>
            <pre className='padding20'>{JSON.stringify(data, null, '    ')}</pre>
        </div>;
    }
}
