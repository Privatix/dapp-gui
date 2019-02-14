import * as React from 'react';

interface IProps {
    offeringStatus: string;
}

interface IState {

}

export default class OfferingStatus extends React.Component<IProps, IState>{

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

        const { offeringStatus } = this.props;

        return <span className={`label label-table label-${this.classes[offeringStatus].label ? this.classes[offeringStatus].label : 'inverse'}`} >
                {this.classes[offeringStatus].alias}
            </span>;
    }
}
