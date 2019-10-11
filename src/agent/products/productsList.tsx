import * as React from 'react';
import { connect } from 'react-redux';
import { WithTranslation, withTranslation } from 'react-i18next';

import ProductItem from './productItem';

import { Product } from 'typings/products';
import { State } from 'typings/state';

interface IProps extends WithTranslation {
    products?: Product[];
    dispatch?: any;
}

const translate = withTranslation(['products/productsList']);

class Products extends React.Component<IProps, {}>{

    render() {

        const { t, products } = this.props;
        const list = products.map((product:Product) => <ProductItem key={product.id} product={product} /> );

        return (
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('ServersList')}</h5>
                <div className='card-body'>
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
        );
    }
}

export default connect( (state: State) => ({products: state.products}))(translate(Products));
