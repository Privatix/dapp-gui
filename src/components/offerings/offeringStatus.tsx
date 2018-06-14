import * as React from 'react';

export default class OfferingStatus extends React.Component<any, any>{

    handler: number;

    constructor(props: any){
        super(props);
    }

    get classes() {
        return {register: 'success', remove: 'danger', empty: 'warning'};
    }

    render() {
        const status = this.props.status;
        return <span className={`label label-table label-${this.classes[status] ? this.classes[status] : 'inverse'}`} >
                {this.props.status}
            </span>;
    }
}
