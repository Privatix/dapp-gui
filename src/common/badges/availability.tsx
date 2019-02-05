import * as React from 'react';

export default class Availability extends React.Component<any, any>{

    constructor(props: any){
        super(props);
    }

    get classes() {
        return {
            available: {
                label: 'success',
                alias: 'Available'
            },
            unreachable: {
                label: 'danger',
                alias: 'Unreachable'
            },
            unknown: {
                label: 'warning',
                alias: 'Unknown'
            }
        };
    }

    render() {
        const availability = this.props.availability;

        return <span className={`label label-table label-${this.classes[availability].label ? this.classes[availability].label : 'inverse'}`} >
                {this.classes[availability].alias}
            </span>;
    }
}
