import * as React from 'react';
import { translate } from 'react-i18next';

import ProductView from './productView';
// import ProductTools from './productTools';
import CreateOffering from '../offerings/createOffering';

declare const Custombox: any;

@translate(['offerings', 'offerings/offerings'])
class Product extends React.Component <any, any> {

    constructor(props:any) {
        super(props);
    }

    openModal(evt:any) {
        evt.preventDefault();
        const { t } = this.props;
        this.props.render(t('offerings/offerings:CreateOffering'), <CreateOffering product={this.props.product.id} />);
    }

    render () {

        const { product, t } = this.props;

        return <div className='container-fluid'>
            <div className='card-box'>
                <div className='row'>
                    <div className='col-sm-12 m-b-20'>
                        <div className='btn-group'>
                            <button onClick={this.openModal.bind(this)}
                                  className='btn btn-default btn-custom waves-effect waves-light'>{t('offerings:CreateAnOffering')}</button>
                        </div>
                        {/*<h3 className='page-title'>Server info</h3>*/}
                    </div>
                </div>
                <div className='row'>
                    <div className='col-12'>
                        <ProductView product={product} dispatch={this.props.dispatch} />
                        <div id='editProduct'></div>
                    </div>
                    {/*<div className='col-3'>*/}
                    {/*<ProductTools product={product} />*/}
                    {/*</div>*/}
                </div>
            </div>
            <div id='custom-modal' className='modal-demo'>
                <button type='button' className='close' onClick={() => Custombox.close()}>
                    <span>&times;</span><span className='sr-only'>Close</span>
                </button>
                <div className='custom-modal-text' id='editProductMessage'>Product edited</div>
            </div>
        </div>;
    }
}

export default Product;
