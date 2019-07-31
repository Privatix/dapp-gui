import * as React from 'react';
import rating from 'utils/rating';

interface IProps {
    amount: number;
}

export default class Rating extends React.Component<IProps, {}>{
    render(){
        const { amount } = this.props;
        return <>{rating(amount)}</>;
    }
}
