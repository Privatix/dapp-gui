import * as React from 'react';

export default class OfferingStatus extends React.Component<any, any>{

    handler: number;

    constructor(props: any){
        super(props);
    }

    get classes() {
        return {
            empty: {
                label: 'info',
                alias: 'Empty'
            },
            registering: {
                label: 'primary',
                alias: 'Registering'
            },
            registered: {
                label: 'success',
                alias: 'Registered'
            },
            removing: {
                label: 'pink',
                alias: 'Removing'
            },
            removed: {
                label: 'inverse',
                alias: 'Removed'
            },
            popping_up: {
                label: 'primary',
                alias: 'Popping up'
            },
            popped_up: {
                label: 'success',
                alias: 'Popped up'
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
