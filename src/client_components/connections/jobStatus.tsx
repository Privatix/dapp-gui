import * as React from 'react';

export default class JobStatus extends React.Component<any, any>{

    constructor(props: any){
        super(props);
    }

    get classes() {
        return {
            active: {
                label: 'primary',
                alias: 'Active'
            },
            done: {
                label: 'success',
                alias: 'Done'
            },
            failed: {
                label: 'danger',
                alias: 'Failed'
            },
            canceled: {
                label: 'inverse',
                alias: 'Canceled'
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
