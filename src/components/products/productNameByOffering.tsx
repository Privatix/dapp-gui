import * as React from 'react';
import {fetch} from '../../utils/fetch';
import { connect } from 'react-redux';
import {asyncProviders} from '../../redux/actions';
import {State} from '../../typings/state';

class ProductName extends React.Component <any, any> {

    constructor(props:any) {
        super(props);

        this.state = {
            product: null
        };
    }

    async componentDidMount() {
        const endpoint = `/offerings?id=${this.props.offeringId}`;
        const offerings = await fetch(endpoint, {method: 'GET'});

        this.props.dispatch(asyncProviders.updateProducts());
        const product = (this.props.products as any).filter(product => product.id === offerings[0].product)[0];

        this.setState({product});
    }

    render() {
        if (!this.state.product) {
            return <span></span>;
        }
        return <span>{this.state.product.name}</span>;
    }
}

export default connect( (state: State) =>
    ({products: state.products})
)(ProductName);
