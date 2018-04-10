import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {asyncReactor} from 'async-reactor';
import {ipcRenderer} from 'electron';
import {fetchFactory} from '../../fetch';
const fetch = fetchFactory(ipcRenderer);

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
            usageRepType: (document.getElementById('usagePerType') as HTMLInputElement).value
        };
        fetch('/products', {method: 'put', body}).then(res => {
            ReactDOM.unmountComponentAtNode(document.getElementById('editProduct'));
            document.getElementById('editProduct').innerHTML = 'product edited!!!';
        });
    };

    const templates = await fetch('/templates', {method: 'GET'});
    const offers = (templates as any).filter(template => template.kind === 'offer');
    const access = (templates as any).filter(template => template.kind === 'access');

    const offersSelect = offers.map(offer => <option key={offer.id} value={offer.id}>{JSON.parse(atob(offer.raw)).schema.title}</option>);
    const accessSelect = access.map(access => <option key={access.id} value={access.id}>{JSON.parse(atob(access.raw)).schema.title}</option>);
    console.log(accessSelect);
// export default function(props:any){
    return <form action=''>
        <label>product name: <input type='text' id='productName' defaultValue={props.product.name} /></label><br />
        <label>product id: <input type='text' id='productId' readOnly value={props.product.id} /></label><br />
        <label>offer template id: <select id='offerTplId' defaultValue={props.product.offerTplID}>{offersSelect}</select></label><br />
        <label>offer access template: <select id='offerAccessId' defaultValue={props.product.offerAccessID}>{accessSelect}</select></label><br />
        <label>usage per type: <input type='text' id='usagePerType' readOnly value={props.product.usageRepType} /></label><br />
        <button type='button' onClick={onSubmit}>save</button>
    </form>;
}

export default asyncReactor(AsyncEditProduct, Loader);
