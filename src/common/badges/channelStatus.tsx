import * as React from 'react';

export default class ChannelStatusStyle extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    get classes() {
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
        const status = this.props.serviceStatus;
        return <span className={`label label-table label-${this.classes[status]}`}>{status}</span>;
    }
}
