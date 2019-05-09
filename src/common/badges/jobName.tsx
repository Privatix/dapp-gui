import * as React from 'react';
import { translate } from 'react-i18next';

interface IProps {
    t?: any;
    jobtype: string;
    className?: string;
}

@translate('jobName')
class JobStatus extends React.Component<IProps, {}>{

    render() {

        const { t, jobtype, className } = this.props;

        return <span className={className}>{t(jobtype)}</span>;

    }
}

export default JobStatus;
