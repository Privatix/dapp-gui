import * as React from 'react';

interface IProps {
    jobStatus: string;
}

export default class JobStatus extends React.Component<IProps, {}>{

    get classes() {
        return {
            active: {
                label: 'primary',
                alias: 'active'
            },
            done: {
                label: 'success',
                alias: 'done'
            },
            failed: {
                label: 'danger',
                alias: 'failed'
            },
            canceled: {
                label: 'inverse',
                alias: 'canceled'
            },
        };
    }

    render() {

        const { jobStatus } = this.props;

        return <span className={`label label-table label-${this.classes[jobStatus].label ? this.classes[jobStatus].label : 'inverse'}`} >
                {this.classes[jobStatus].alias}
            </span>;
    }
}
