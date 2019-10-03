import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

interface IProps extends WithTranslation {
    jobtype: string;
    className?: string;
}

const translate = withTranslation('jobName');

class JobStatus extends React.Component<IProps, {}>{

    render() {

        const { t, jobtype, className } = this.props;

        return <span className={className}>{t(jobtype)}</span>;

    }
}

export default translate(JobStatus);
