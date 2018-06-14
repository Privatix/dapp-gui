import * as React from 'react';

export default class ChannelStatusStyle extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    get classes() {
        return {
            pending: 'primary',
            active: 'success',
            suspended: 'warning',
            terminated: 'inverse'
        };
    }

    render() {
        const status = this.props.serviceStatus;
        return <span className={`label label-table label-${this.classes[status]}`}>{status}</span>;
    }
}
