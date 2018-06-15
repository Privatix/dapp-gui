import * as React from 'react';

export default class ContractStatus extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    get classes() {
        return {
            pending: 'primary',
            active: 'success',
            wait_coop: 'warning',
            wait_challenge: 'warning',
            closed_coop: 'inverse',
            in_challenge: 'danger',
            wait_uncoop: 'danger',
            closed_uncoop: 'pink'
        };
    }

    render() {
        const status = this.props.contractStatus;
        return <span className={`label label-table label-${this.classes[status]}`}>{status}</span>;
    }
}
