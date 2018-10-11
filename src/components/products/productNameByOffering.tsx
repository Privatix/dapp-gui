import * as React from 'react';
import { connect } from 'react-redux';
import {asyncProviders} from '../../redux/actions';
import {State} from '../../typings/state';
import Product from './product';

class ProductName extends React.Component <any, any> {

    constructor(props:any) {
        super(props);

        this.state = {
            product: null
        };
    }

    async componentDidMount() {

        const offering = await (window as any).ws.getOffering(this.props.offeringId);

        this.props.dispatch(asyncProviders.updateProducts());
        const product = (this.props.products as any).filter(product => product.id === offering.product)[0];

        this.setState({product});
    }

    showProduct(evt: any){
        evt.preventDefault();
        this.props.render('Product', <Product product={this.state.product} {...this.props} />);
    }

    render() {
        if (!this.state.product) {
            return <span></span>;
        }
        if(this.props.mode === 'link'){
            return <a href='#' onClick={this.showProduct.bind(this)}>{this.state.product.name}</a>;
        }else{
            return <span>{this.state.product.name}</span>;
        }
    }
}

export default connect( (state: State) =>
    ({products: state.products})
)(ProductName);
