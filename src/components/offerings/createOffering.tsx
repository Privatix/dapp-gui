import * as React from 'react';
import Form from 'react-jsonschema-form';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<h2>Loading data ...</h2>);

}

async function AsyncCreateOffering (props: any){

    const onSubmit = ({formData}) => {
        // 
    };

    const products = await fetch('/products', {method: 'get'});
    const accounts = await fetch('/accounts/', {method: 'get'});
    const templates = await fetch(`/templates?id=${products[0].offerTplID}`, {method: 'get'});
    const template = templates[0];
    template.raw = JSON.parse(atob(template.raw));
    console.log(products, template);

    const selectProduct = <select>
        {(products as any).map((product:any) => <option key={product.id} value={product.id}>{product.name}</option>) }
    </select>;

    const selectAccount = <select>
        {(accounts as any).map((account:any) => <option key={account.id} value={account.id}>{account.name}</option>) }
    </select>;

    return <div>
        <h5>Create Offering</h5>
        <h3>Offering info</h3>
        <label>Server {selectProduct}</label>
        <Form schema={template.raw.schema} uiSchema={template.raw.uiSchema} onSubmit={onSubmit}>
            <h3>Publication price:</h3>
            <label>Account: {selectAccount} Balance: <span id='accountBalance'>4125 PRIX/ 5 ETH</span></label><br />
            <label>Deposit: <input type='text' value='3 PRIX' readOnly /></label><br />
            This deposit will be locked while offering is active. To return deposit close your offering<br />
            <label>Gas price <input type='range' min='0' max='20' step='any' /> <span id='gasPrice'>20 Gwei</span></label><br />
            Average publication time: <span id='averagePublicationTime'>2 min</span><br />
            <button type='submit'>Create and Publish</button>
        </Form>
    </div>;

}

export default asyncReactor(AsyncCreateOffering, Loader);
