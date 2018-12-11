import * as React from 'react';

// TODO move to vocabulary
const channelStatusDescription = {
    'pending': 'pending',
    'active': 'active',
    'wait_coop': 'closing normaly',
    'closed_coop': 'normally closed',
    'wait_challenge': 'opening dispute',
    'in_challenge': 'dispute opened',
    'wait_uncoop': 'closing dispute',
    'closed_uncoop': 'dispute closed'
};

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
        return <span className={`label label-table label-${this.classes[status]}`}>{channelStatusDescription[status]}</span>;
    }
}
