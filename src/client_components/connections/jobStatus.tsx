import * as React from 'react';

export default class JobStatus extends React.Component<any, any>{

    constructor(props: any){
        super(props);
    }

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
        const status = this.props.status;

        return <span className={`label label-table label-${this.classes[status].label ? this.classes[status].label : 'inverse'}`} >
                {this.classes[status].alias}
            </span>;
    }
}
