import * as React from 'react';
import prix from 'utils/prix';

interface IProps {
    amount: number;
}

export default class PRIX extends React.Component<IProps, {}>{
    render(){
        const { amount } = this.props;
        return <>{prix(amount)}</>;
    }
}
