import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { Product } from '../../typings/products';
import ProductItem from './productItem';
import { State } from '../../typings/state';
import {asyncProviders} from '../../redux/actions';

interface Props {
    products: Product[];
    dispatch: any;
    showCreateOfferingModal: string;
    productId: string;
    t: any;
}

@translate(['products/productsList'])
class Products extends React.Component<Props, any>{

    constructor(props:any) {
        super(props);
    }

    componentDidMount() {
        this.props.dispatch(asyncProviders.updateProducts());
    }

    render() {

        const { t } = this.props;
        const list = this.props.products.map((product:Product) => <ProductItem key={product.id} product={product} {...this.props} /> );

        return (
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-12 m-b-15'>
                        <h3 className='page-title'>{t('ServersList')}</h3>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-12'>
                        <div className='card-box'>
                            <div className='table-responsive'>
                                <table className='table table-bordered table-striped'>
                                    <thead>
                                    <tr>
                                        <th>{t('Name')}</th>
                                        <th>{t('OfferingTemplate')}</th>
                                        <th>{t('AccessTemplate')}</th>
                                        <th>{t('OfferingCount')}</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {list}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect( (state: State, onProps: Props) => {
    return (Object.assign({}, {products: state.products}, onProps));
} )(Products);
