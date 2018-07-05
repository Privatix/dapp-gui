import * as React from 'react';
import * as uuid from 'uuid/v4';
import { withRouter } from 'react-router-dom';
import {asyncReactor} from 'async-reactor';
import {fetch} from '../../utils/fetch';
import { Link } from 'react-router-dom';

function Loader() {

  return (<h2>Loading templates ...</h2>);

}

const AsyncAddProduct = async (props:any) => {

    const onSubmit = (evt:any) => {
        evt.preventDefault();
        evt.stopPropagation();

        const body = {
            id: uuid(),
            name: (document.getElementById('productName') as HTMLInputElement).value,
            offerTplID: (document.getElementById('offerTplId') as HTMLInputElement).value,
            offerAccessID: (document.getElementById('offerAccessId') as HTMLInputElement).value,
            usageRepType: (document.getElementById('usagePerType') as HTMLInputElement).value,
            clientIdent: 'by_channel_id',
            config: Buffer.from('{}').toString('base64')
        };
        fetch('/products', {method: 'post', body}).then(res => {
            // ReactDOM.unmountComponentAtNode(document.getElementById('product'));
            // document.getElementById('product').innerHTML = 'product added!!!';
            props.history.push('/products');
        });
    };

    const templates = await fetch('/templates', {method: 'GET'});
    const offers = (templates as any).filter(template => template.kind === 'offer');
    const access = (templates as any).filter(template => template.kind === 'access');

    const offersSelect = offers.map(offer => <option value={offer.id}>{JSON.parse(atob(offer.raw)).schema.title}</option>);
    const accessSelect = access.map(access => <option value={access.id}>{JSON.parse(atob(access.raw)).schema.title}</option>);

    return <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <h3 className='page-title'>Create a product</h3>
            </div>
        </div>
        <div className='row'>
            <div className='col-sm-12'>
                <div className='card-box'>
                    <form action='' id='addProduct'>
                        <div className='form-group row'>
                            <label className='col-4 col-md-3 col-sm-3 col-form-label'>Product name:</label>
                            <div className='col-8 col-md-9 col-sm-9'>
                                <input type='text' name='name' id='productName' />
                            </div>
                        </div>
                        <div className='form-group row'>
                            <label className='col-4 col-md-3 col-sm-3 col-form-label'>Offering template</label>
                            <div className='col-8 col-md-9 col-sm-9'>
                                <select id='offerTplId'>{offersSelect}</select>
                            </div>
                        </div>
                        <div className='form-group row'>
                            <label  className='col-4 col-md-3 col-sm-3 col-form-label'>Access template</label>
                            <div className='col-8 col-md-9 col-sm-9'>
                                <select id='offerAccessId'>{accessSelect}</select>
                            </div>
                        </div>
                        <div className='form-group row'>
                            <label className='col-4 col-md-3 col-sm-3 col-form-label'>Usage type</label>
                            <div className='col-8 col-md-9 col-sm-9'>
                                <select id='usagePerType'>
                                    <option value='incremental'>incremental</option>
                                    <option value='total'>total</option>
                                </select>
                            </div>
                        </div>
                      <button type='button' className='btn btn-success waves-effect waves-light m-r-15' onClick={onSubmit}>Create</button>
                      <Link to='/products' className='btn btn-primary waves-effect waves-light'>Cancel</Link>
                    </form>
                </div>
            </div>
        </div>
    </div>;
};

export default  withRouter(asyncReactor(AsyncAddProduct, Loader));
