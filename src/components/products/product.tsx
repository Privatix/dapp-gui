import * as React from 'react';
import ProductView from './productView';
import ProductTools from './productTools';
import { Link } from 'react-router-dom';

declare const Custombox: any;

export default function(props:any){
    const product = JSON.parse(props.src ? props.src : props.match.params.product);
    return <div className='container-fluid'>
        <div className='card-box'>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <div className='btn-group pull-right col-3'>
                        <div className='text-center col-12'>
                            <Link to={'/createOffering'} className='btn btn-default waves-effect waves-light'>Create an Offering</Link>
                        </div>
                    </div>
                    <h3 className='page-title'>Server info</h3>
                </div>
            </div>
            <div className='row'>
                <div className='col-9'>
                    <ProductView product={product} />
                    <div id='editProduct'></div>
                </div>
                <div className='col-3'>
                    <ProductTools product={product} />
                </div>
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
