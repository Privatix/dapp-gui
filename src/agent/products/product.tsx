import * as React from 'react';
import { withTranslation } from 'react-i18next';

import ProductView from './productView';
import CreateOffering from 'agent/offerings/createOffering/';


const translate = withTranslation(['offerings', 'offerings/offerings']);

class Product extends React.Component <any, any> {

    constructor(props:any) {
        super(props);
    }

    openModal = (evt:any) => {
        evt.preventDefault();
        const { t, render, product } = this.props;
        render(t('offerings/offerings:CreateOffering'), <CreateOffering product={product.id} />);
    }

    render () {

        const { product, t } = this.props;

        return <div className='container-fluid productModal'>
            <div className='card-box'>
                <div className='row'>
                    <div className='col-sm-12 m-b-20'>
                        <div className='btn-group'>
                            <button onClick={this.openModal}
                                  className='btn btn-default btn-custom waves-effect waves-light'>{t('offerings:CreateAnOffering')}</button>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-12'>
                        <ProductView product={product} dispatch={this.props.dispatch} />
                        <div id='editProduct'></div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default translate(Product);
