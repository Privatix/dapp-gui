import * as React from 'react';

export default class ContractStatus extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    get classes() {
        return {
            terminated: 'default',
            pending: 'primary',
            suspended: 'primary',
            active: 'success'
        };
    }

    render() {
        const status = this.props.status;
        return <span className={`label label-table label-${this.classes[status]}`}>{status}</span>;
    }
}
