import * as React from 'react';
import { translate } from 'react-i18next';

interface IProps {
    t?: any;
    jobtype: string;
}

interface IState {

}

@translate('jobName')
class JobStatus extends React.Component<IProps, IState>{

    render() {

        const { t, jobtype } = this.props;

        return <span>{t(jobtype)}</span>;

    }
}

export default JobStatus;
