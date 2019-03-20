import * as React from 'react';
import { translate } from 'react-i18next';

interface IProps {
    t?: any;
    jobtype: string;
}

@translate('jobName')
class JobStatus extends React.Component<IProps, {}>{

    render() {

        const { t, jobtype } = this.props;

        return <span>{t(jobtype)}</span>;

    }
}

export default JobStatus;
