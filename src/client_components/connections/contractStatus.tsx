import * as React from 'react';

export default class ContractStatus extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }

    get classes() {
        return {
            unpublished: 'default',
            bchain_publishing: 'primary',
            bchain_published: 'primary',
            msg_channel_published: 'success'
        };
    }

    render() {
        const status = this.props.contractStatus;
        return <span className={`label label-table label-${this.classes[status]}`}>{status}</span>;
    }
}
