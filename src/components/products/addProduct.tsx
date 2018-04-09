import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as uuid from 'uuid/v4';
import {asyncReactor} from 'async-reactor';
import {ipcRenderer} from 'electron';
import {fetchFactory} from '../../fetch';

const fetch = fetchFactory(ipcRenderer);

function Loader() {

  return (<h2>Loading templates ...</h2>);

}

async function AsyncAddProduct(props:any){

    const onSubmit = (evt:any) => {
        evt.preventDefault();
        evt.stopPropagation();

        const body = {
            id: uuid(),
            name: (document.getElementById('productName') as HTMLInputElement).value,
            offerTplID: (document.getElementById('offerTplId') as HTMLInputElement).value,
            offerAccessID: (document.getElementById('offerAccessId') as HTMLInputElement).value,
            usageRepType: (document.getElementById('usagePerType') as HTMLInputElement).value
        };
        fetch('/products', {method: 'post', body}).then(res => {
            ReactDOM.unmountComponentAtNode(document.getElementById('product'));
            document.getElementById('product').innerHTML = 'product added!!!';
        });
    };

    const onClick = () => {
        ReactDOM.unmountComponentAtNode(document.getElementById('product'));
    };

    const templates = await fetch('/templates', {method: 'GET'});
    const offers = (templates as any).filter(template => template.kind === 'offer');
    const access = (templates as any).filter(template => template.kind === 'access');

    const offersSelect = offers.map(offer => <option value={offer.id}>{JSON.parse(atob(offer.raw)).schema.title}</option>);
    const accessSelect = access.map(access => <option value={access.id}>{JSON.parse(atob(access.raw)).schema.title}</option>);
    return <div>
        <hr />
        <form action='' id='addProduct'>
          <label>product name: <input type='text' name='name' id='productName'></input></label>
          <label> offering template <select id='offerTplId'>{offersSelect}</select></label>
          <label> access template <select id='offerAccessId'>{accessSelect}</select></label>
          <label> usage type<select id='usagePerType'>
            <option value='incremental'>incremental</option>
            <option value='total'>total</option>
          </select></label>
          <hr />
          <button type='button' onClick={onSubmit}>add product</button>
          <button type='button' onClick={onClick}>cancel</button>
        </form>
        <hr />
    </div>;
}

export default asyncReactor(AsyncAddProduct, Loader);
