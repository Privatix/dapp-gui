import * as React from 'react';

interface ServiceStatuses {
    pending: string;
    activating: string;
    active: string;
    suspending: string;
    suspended: string;
    terminating: string;
    terminated: string;
}

interface IProps {
    serviceStatus: keyof ServiceStatuses;
}

export default class ChannelStatusStyle extends React.Component<IProps, {}> {

    get classes(): ServiceStatuses {
        return {
            pending: 'primary',
            activating: 'primary',
            active: 'success',
            suspending: 'warning',
            suspended: 'warning',
            terminating: 'inverse',
            terminated: 'inverse'
        };
    }

    render() {
        const {serviceStatus } = this.props;
        return <span className={`label label-table label-${this.classes[serviceStatus]}`}>{serviceStatus}</span>;
    }
}
