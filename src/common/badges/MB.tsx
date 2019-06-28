import * as React from 'react';

import toFixedN from 'utils/toFixedN';

interface IProps {
    amount: number;
}

export default class MB extends React.Component<IProps, {}>{


    render(){

        const { amount } = this.props;

        if(amount === undefined || amount === null) {
            return null;
        }

        switch(true) {
            case amount < 1024:
                return `${toFixedN({number: amount, fixed: 2})} MB`;
            case amount < 1024*1024:
                return `${toFixedN({number: amount/(1024), fixed: 2})} GB`;
            default:
                return `${toFixedN({number: amount/(1024*1024), fixed: 2})} TB`;
        }
    }
}
