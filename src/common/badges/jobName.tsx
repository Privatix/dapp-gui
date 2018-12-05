import * as React from 'react';
import { translate } from 'react-i18next';

@translate('jobName')
class JobStatus extends React.Component<any, any>{

    constructor(props: any){
        super(props);
    }

    render() {

        const { t, jobtype } = this.props;

        return <span>{t(jobtype)}</span>;

    }
}

export default JobStatus;
