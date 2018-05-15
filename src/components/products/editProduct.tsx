import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {asyncReactor} from 'async-reactor';
import {fetch} from 'utils/fetch';

declare const Custombox;

function Loader() {

  return (<h2>Loading templates ...</h2>);

}

async function AsyncEditProduct(props:any){

    const onSubmit = (evt:any) => {
        evt.preventDefault();
        evt.stopPropagation();

        const body = {
            id: (document.getElementById('productId') as HTMLInputElement).value,
            name: (document.getElementById('productName') as HTMLInputElement).value,
            offerTplID: (document.getElementById('offerTplId') as HTMLInputElement).value,
            offerAccessID: (document.getElementById('offerAccessId') as HTMLInputElement).value,
            usageRepType: (document.getElementById('usagePerType') as HTMLInputElement).value,
            clientIdent: 'by_channel_id',
            config: props.product.config
        };
        fetch('/products', {method: 'put', body}).then(res => {
            document.getElementById('editProductMessage').innerHTML = 'Product edited';
            Custombox.open({
                target: '#custom-modal',
                effect: 'fadein',
                close: function(){
                    ReactDOM.unmountComponentAtNode(document.getElementById('editProduct'));
                }
            });
        });
    };

    const onCancel = function(evt:any){
        evt.preventDefault();
        evt.stopPropagation();
        ReactDOM.unmountComponentAtNode(document.getElementById('editProduct'));
    };

    const templates = await fetch('/templates', {method: 'GET'});
    const offers = (templates as any).filter(template => template.kind === 'offer');
    const access = (templates as any).filter(template => template.kind === 'access');

    const offersSelect = offers.map(offer => <option key={offer.id} value={offer.id}>{JSON.parse(atob(offer.raw)).schema.title}</option>);
    const accessSelect = access.map(access => <option key={access.id} value={access.id}>{JSON.parse(atob(access.raw)).schema.title}</option>);

    return <form className='form-horizontal m-t-20'>
        <div className='form-group row'>
            <label className='col-3 col-form-label'>Product name: </label>
            <div className='col-9'><input type='text' id='productName' defaultValue={props.product.name} /></div>
        </div>
        <div className='form-group row'>
            <label className='col-3 col-form-label'>Product id:</label>
            <div className='col-9'><input type='text' id='productId' readOnly value={props.product.id} /></div>
        </div>
        <div className='form-group row'>
            <label className='col-3 col-form-label'>Offer template id:</label>
            <div className='col-9'>
                <select id='offerTplId' defaultValue={props.product.offerTplID}>{offersSelect}</select>
            </div>
        </div>
        <div className='form-group row'>
            <label className='col-3 col-form-label'>Offer access template:</label>
            <div className='col-9'><select id='offerAccessId' defaultValue={props.product.offerAccessID}>{accessSelect}</select></div>
        </div>
        <div className='form-group row'>
            <label className='col-3 col-form-label'>Usage per type:</label>
            <div className='col-9'><input type='text' id='usagePerType' readOnly value={props.product.usageRepType} /></div>
        </div>
        <button type='button'  className='btn btn-default waves-effect waves-light m-r-15' onClick={onSubmit}>save</button>
        <button type='button' className='btn btn-primary waves-effect waves-light' onClick={onCancel}>Cancel</button>

    </form>;
}

export default asyncReactor(AsyncEditProduct, Loader);
