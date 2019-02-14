import * as React from 'react';

interface AvailabilityStatuses {
    available: any;
    unreachable: any;
    unknown: any;
}

interface IProps {
    availability: keyof AvailabilityStatuses;
}

interface IState {

}

export default class Availability extends React.Component<IProps, IState>{

    get classes(): AvailabilityStatuses {
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

        const { availability } = this.props;

        return <span className={`label label-table label-${this.classes[availability].label ? this.classes[availability].label : 'inverse'}`} >
                {this.classes[availability].alias}
            </span>;
    }
}
