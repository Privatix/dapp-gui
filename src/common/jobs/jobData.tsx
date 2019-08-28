import * as React from 'react';

import { Job } from 'typings/jobs';

interface IProps {
    job: Job;
}

export default class JobData extends React.Component <IProps, {}> {

    render() {

        const { job } = this.props;

        return <div>
            <pre className='padding20'>{JSON.stringify(job, null, '    ')}</pre>
        </div>;
    }
}
