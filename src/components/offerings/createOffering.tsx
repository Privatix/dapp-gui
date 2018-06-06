import * as React from 'react';
// import Form from 'react-jsonschema-form';
import {fetch} from '../../utils/fetch';
// import { withRouter } from 'react-router-dom';
import {asyncReactor} from 'async-reactor';
import GasRange from '../utils/gasRange';

function Loader() {

  return (<h2>Loading data ...</h2>);

}

let ethBalance = 0;
let prixBalance = 0;
let globalTemplate = '';
let gasPrice = 6*1e9;

async function AsyncCreateOffering (props: any){

    const depositChanged = function(){
        let price = (document.getElementById('offeringPricePerUnit') as any).value;
        let units = parseInt((document.getElementById('offeringMinUnits') as any).value, 10);
        price = price ? price : 0;
        units = units ? units : 0;
        (document.getElementById('offeringDeposit') as any).placeholder = `${price*units} PRIX`;
    };

    const onChangeAccount = async function(){
        const selectAccount = document.getElementById('selectAccount');
        const accountId = (selectAccount as any).options[(selectAccount as any).selectedIndex].value;
        const account = await fetch(`/accounts?id=${accountId}`, {method: 'get'}) as any;
        ethBalance = account[0].ethBalance;
        prixBalance = account[0].ptcBalance;
        document.getElementById('accountBalance').innerHTML = `${(account[0].ptcBalance/1e8).toFixed(3)} PRIX / ${(account[0].ethBalance/1e18).toFixed(3)} ETH`;

    };

    const onSubmit = (evt:any) => {
        evt.preventDefault();
        const payload = {} as any;
        const selectProduct = document.getElementById('selectProduct');
        payload.product = (selectProduct as any).options[(selectProduct as any).selectedIndex].value;
        payload.serviceName = (document.getElementById('offeringName') as any).value;
        payload.description = (document.getElementById('offeringDescription') as any).value;
        payload.country = (document.getElementById('offeringCountry') as any).value;
        payload.supply = parseInt((document.getElementById('offeringSupply') as any).value, 10);

        payload.unitName = 'Mb';
        payload.unitType = 'units';
        payload.billingType = 'prepaid';
        payload.billingInterval = 1;
        payload.setupPrice = 0;
        payload.freeUnits = 0;
        payload.template = globalTemplate;
        payload.additionalParams = Buffer.from('{}').toString('base64');

        payload.unitPrice = Math.floor(1e8 * (document.getElementById('offeringPricePerUnit') as any).value);
        payload.maxBillingUnitLag = parseInt((document.getElementById('offeringMaxBillingLag') as any).value, 10);
        payload.minUnits = parseInt((document.getElementById('offeringMinUnits') as any).value, 10);
        payload.deposit = payload.unitPrice * payload.minUnits;
        payload.maxUnit = parseInt((document.getElementById('offeringMaxUnits') as any).value, 10);
        if(payload.maxUnit && payload.maxUnit < payload.minUnits){
            console.log('maxUnits must be more or equal minUnits');
            return;
        }
        payload.maxSuspendTime = parseInt((document.getElementById('offeringMaxSuspendTime') as any).value, 10);
        payload.maxInactiveTimeSec = parseInt((document.getElementById('offeringMaxInactiveTime') as any).value, 10);

        const selectAccount = document.getElementById('selectAccount');
        if(ethBalance === 0 || prixBalance === 0){
            console.log('select account with non zero balance');
            return;
        }
        payload.agent = (selectAccount as any).options[(selectAccount as any).selectedIndex].value;
        payload.gasPrice = gasPrice;

        console.log('creating offering', payload);
        fetch('/offerings/', {method: 'post', body: payload}).then(res => {
            console.log('offering created', res);
            fetch(`/offerings/${(res as any).id}/status`, {method: 'put', body: {action: 'publish', gasPrice: payload.gasPrice}}).then(res => {
                console.log('offering published', res);
               if(typeof props.done === 'function'){
                   props.done();
               }
            // props.history.push('/offerings/all');
            });
        });
    };

    const products = await fetch('/products', {method: 'get'});
    const accounts = await fetch('/accounts/', {method: 'get'});
    const templates = await fetch(`/templates?id=${products[0].offerTplID}`, {method: 'get'});
    globalTemplate = products[0].offerTplID;

    console.log(products, accounts, templates);
    const template = templates[0];
    template.raw = JSON.parse(atob(template.raw));
    console.log(products, template, 'accounts', accounts);

    const selectProduct = <select className='form-control' id='selectProduct'>
        {(products as any).map((product:any) => <option selected={props.product && props.product === product.id ? true : false } key={product.id} value={product.id}>{product.name}</option>) }
    </select>;

    let selectAccount;
    if((accounts as any).length){
        ethBalance = accounts[0].ethBalance;
        prixBalance = accounts[0].ptcBalance;
        selectAccount =  <select className='form-control' id='selectAccount' onChange={onChangeAccount}>
            {(accounts as any).map((account:any) => <option key={account.id} value={account.id}>{account.name}</option>) }
        </select>;
    }else{
        selectAccount = [];
    }


    const changeGasPrice = (evt:any) => {
        // 
        gasPrice = Math.floor(evt.target.value * 1e9);
    };

    return <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12'>
                <form action='' id='addOffering'>
                    <div className='card m-b-20 card-body'>
                        <div className='form-group row'>
                            <label className='col-2 col-form-label'>Server:</label>
                            <div className='col-6'>
                                {selectProduct}
                            </div>
                        </div>
                    </div>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>General info</h5>
                        <div className='card-body'>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Name: </label>
                                <div className='col-6'>
                                    <input type='text' className='form-control' placeholder={template.raw.schema.properties.serviceName.title} id='offeringName' />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Description: </label>
                                <div className='col-6'>
                                    <input type='text' className='form-control' placeholder={'description'} id='offeringDescription' />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Country: </label>
                                <div className='col-6'>
                                    <input type='text' className='form-control' placeholder={template.raw.uiSchema.country['ui:help']} id='offeringCountry' />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Supply: </label>
                                <div className='col-6'>
                                    <input type='text' className='form-control autonumber' placeholder='3' data-v-max='999' data-v-min='0' id='offeringSupply' />
                                    <span className='help-block'>
                                        <small>
                                            Maximum supply of services according to service offerings.
                                            It represents the maximum number of clients that can consume this service offering concurrently.
                                        </small>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>Billing info</h5>
                        <div className='card-body'>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Unit type:</label>
                                <div className='col-6'>
                                    <select className='form-control' disabled>
                                        <option value='Mb'>Mb</option>
                                    </select>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Price per Mb:</label>
                                <div className='col-6'>
                                    <div className='input-group bootstrap-touchspin'>
                                        <input type='text' className='form-control' placeholder='0.03' id='offeringPricePerUnit' onChange={depositChanged} />
                                        <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                                    </div>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Max billing unit lag:</label>
                                <div className='col-6'>
                                    <div className='input-group bootstrap-touchspin'>
                                        <input type='text' className='form-control' placeholder='3' id='offeringMaxBillingLag' />
                                        <span className='input-group-addon bootstrap-touchspin-postfix'>Mb</span>
                                    </div>
                                    <span className='help-block'>
                                        <small>Maximum payment lag in units after which Agent will suspend service usage.</small>
                                    </span>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Min units:</label>
                                <div className='col-6'>
                                    <div className='input-group bootstrap-touchspin'>
                                        <input type='text' className='form-control' placeholder='100' id='offeringMinUnits' onChange={depositChanged} />
                                        <span className='input-group-addon bootstrap-touchspin-postfix'>Mb</span>
                                    </div>
                                    <span className='help-block'>
                                        <small>Used to calculate minimum deposit required.</small>
                                    </span>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Max units:</label>
                                <div className='col-6'>
                                    <div className='input-group bootstrap-touchspin'>
                                        <input type='text' className='form-control' id='offeringMaxUnits' />
                                        <span className='input-group-addon bootstrap-touchspin-postfix'>Mb</span>
                                    </div>
                                    <span className='help-block'>
                                        <small>Used to specify maximum units of service that will be supplied. Can be empty.</small>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>Connection info</h5>
                        <div className='card-body'>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Max suspend time:</label>
                                <div className='col-6'>
                                    <div className='input-group bootstrap-touchspin'>
                                        <input type='text' className='form-control' placeholder='1800' id='offeringMaxSuspendTime' />
                                        <span className='input-group-addon bootstrap-touchspin-postfix'>sec</span>
                                    </div>
                                    <span className='help-block'>
                                        <small>Maximum time service can be in Suspended status due to payment log.
                                            After this time period service will be terminated, if no sufficient payment was received.
                                            Period is specified in seconds.</small>
                                    </span>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Max inactive time:</label>
                                <div className='col-6'>
                                    <div className='input-group bootstrap-touchspin'>
                                        <input type='text' className='form-control' placeholder='60' id='offeringMaxInactiveTime' />
                                        <span className='input-group-addon bootstrap-touchspin-postfix'>sec</span>
                                    </div>
                                    <span className='help-block'>
                                        <small>Maximum time without service usage.
                                            Agent will consider that Client will not use service and stop providing it.
                                            Period is specified in seconds.</small>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>Publication price:</h5>
                        <div className='card-body'>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Account:</label>
                                <div className='col-6'>
                                    {selectAccount}
                                </div>
                                <div className='col-4 col-form-label'>
                                    Balance: <span id='accountBalance'>{(accounts as any).length ? (accounts[0].ptcBalance/1e8).toFixed(3) : 0} PRIX / {(accounts as any).length ? (accounts[0].ethBalance/1e18).toFixed(3) : 0} ETH</span>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Deposit:</label>
                                <div className='col-6'>
                                    <input id='offeringDeposit' type='text' className='form-control' value='' placeholder='PRIX' readOnly/>
                                    <span className='help-block'>
                                        <small>This deposit will be locked while offering is active.
                                            To return deposit close your offering</small>
                                    </span>
                                </div>
                            </div>
                            <GasRange onChange={changeGasPrice} value={gasPrice/1e9} />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <div className='col-md-8'>
                            <button type='submit' onClick={onSubmit} className='btn btn-default btn-custom btn-block waves-effect waves-light'>Create and Publish</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>;

}

export default asyncReactor(AsyncCreateOffering, Loader);
