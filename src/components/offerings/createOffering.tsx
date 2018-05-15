import * as React from 'react';
// import Form from 'react-jsonschema-form';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<h2>Loading data ...</h2>);

}

async function AsyncCreateOffering (props: any){
/*
    const onSubmit = ({formData}) => {
        // 
    };
*/
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
        <hr />
        <label>Server {selectProduct}</label>
        <h3>General info</h3>
        <label>Name: <input type='text' value='VPN'/></label><br />
        <label>Decsription: <input type='text' value='My very fist offering'/></label><br />
        <label>Country: <input type='text' value='Japan'/></label><br />
        <label>Supply: <input type='text' value='3'/></label><br />
        <div>Maximum supply of services according to service offerings. It represents the maximum number of clients that can consume this service offering concurrently.</div>
        <h3>Billing info</h3>
        <label>Unit type: <select readOnly><option value='Mb'>Mb</option></select></label><br />
        <label>Price per Mb: <input type='text' value='0.03'/></label><br />
        <label>Max billing unit lag: <input type='text' value='3'/></label><br />
        <div>Maximum payment lag  in  units after which Agent will suspend service usage</div>
        <label>Min units: <input type='text' value='100'/></label><br />
        <div>Used to calculate minimum deposit required</div>
        <label>Max units: <input type='text' value='100'/></label><br />
        <div>Used to specify maximum units of service that will be supplied. Can be empty.</div>
        <h3>Connection info</h3>
        <label>Max suspend time: <input type='text' value='1800'/></label><br />
        <div>Maximum time service can be in Suspended status due to payment log. After this time period service will be terminated, if no sufficient payment was recieved. Period is specified in seconds.</div>
        <label>Max inactive time: <input type='text' value='60'/></label><br />
        <div>Maximum time whithout service usage. Agent will consider that Client will not use service and stop providing it. Period is specified in seconds.</div>
        <h3>Publication price:</h3>
        <label>Account: {selectAccount} Balance: <span id='accountBalance'>4125 PRIX/ 5 ETH</span></label><br />
        <label>Deposit: <input type='text' value='3 PRIX' readOnly /></label><br />
        This deposit will be locked while offering is active. To return deposit close your offering<br />
        <label>Gas price <input type='range' min='0' max='20' step='any' /> <span id='gasPrice'>20 Gwei</span></label><br />
        Average publication time: <span id='averagePublicationTime'>2 min</span><br />
        <button type='submit'>Create and Publish</button>
    </div>;

}

export default asyncReactor(AsyncCreateOffering, Loader);
