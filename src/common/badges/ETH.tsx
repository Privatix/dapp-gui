import * as React from 'react';
import eth from 'utils/eth';

interface IProps {
    amount: number;
}

export default class ETH extends React.Component<IProps, {}>{
    render(){
        const { amount } = this.props;
        return <>{eth(amount)}</>;
    }
}
