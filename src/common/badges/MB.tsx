import * as React from 'react';

import mb from 'utils/mb';

interface IProps {
    amount: number;
}

export default class MB extends React.Component<IProps, {}>{


    render(){

        const { amount } = this.props;

        if(amount === undefined || amount === null) {
            return null;
        }

        const {value, unit} = mb(amount);
        return `${value} ${unit}`;
    }
}
