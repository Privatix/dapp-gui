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
    const shell = require('electron').shell;
    const products = await fetch('/products', {method: 'get'});
    const accounts = await fetch('/accounts/', {method: 'get'});
    const templates = await fetch(`/templates?id=${products[0].offerTplID}`, {method: 'get'});
    const template = templates[0];
    template.raw = JSON.parse(atob(template.raw));
    console.log(products, template);

    const selectProduct = <select className='form-control'>
        {(products as any).map((product:any) => <option key={product.id} value={product.id}>{product.name}</option>) }
    </select>;

    const selectAccount = <select className='form-control'>
        {(accounts as any).map((account:any) => <option key={account.id} value={account.id}>{account.name}</option>) }
    </select>;

    const changeGasPrice = (any:any) => {
        (document.getElementById('gasPrice') as HTMLInputElement).innerHTML = (document.getElementById('gasRange') as HTMLInputElement).value;
    };

    const openEthGasStation = (evt:any) => {
        evt.preventDefault();
        shell.openExternal('https://ethgasstation.info/');
    };

    return <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <h3 className='page-title'>Create Offering</h3>
            </div>
        </div>
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
                    <div className='card m-b-20 card-body'>
                        <h5 className='card-title'>General info</h5>
                        <div className='form-group row'>
                            <label className='col-2 col-form-label'>Name: </label>
                            <div className='col-6'>
                                <input type='text' className='form-control' placeholder='VPN Japan'/>
                            </div>
                        </div>
                        <div className='form-group row'>
                            <label className='col-2 col-form-label'>Description: </label>
                            <div className='col-6'>
                                <input type='text' className='form-control' placeholder='My very fist Offering'/>
                            </div>
                        </div>
                        <div className='form-group row'>
                            <label className='col-2 col-form-label'>Country: </label>
                            <div className='col-6'>
                                <input type='text' className='form-control' placeholder='Japan'/>
                            </div>
                        </div>
                        <div className='form-group row'>
                            <label className='col-2 col-form-label'>Supply: </label>
                            <div className='col-6'>
                                <input type='text' className='form-control autonumber' placeholder='3' data-v-max='999' data-v-min='0'/>
                                <span className='help-block'>
                                    <small>
                                        Maximum supply of services according to service offerings.
                                        It represents the maximum number of clients that can consume this service offering concurrently.
                                    </small>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='card m-b-20 card-body'>
                        <h5 className='card-title'>Billing info</h5>
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
                                    <input type='text' className='form-control' placeholder='0.03'/>
                                    <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                                </div>
                            </div>
                        </div>
                        <div className='form-group row'>
                            <label className='col-2 col-form-label'>Max billing unit lag:</label>
                            <div className='col-6'>
                                <div className='input-group bootstrap-touchspin'>
                                    <input type='text' className='form-control' placeholder='3'/>
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
                                    <input type='text' className='form-control' placeholder='100'/>
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
                                    <input type='text' className='form-control'/>
                                    <span className='input-group-addon bootstrap-touchspin-postfix'>Mb</span>
                                </div>
                                <span className='help-block'>
                                    <small>Used to specify maximum units of service that will be supplied. Can be empty.</small>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='card m-b-20 card-body'>
                        <h5 className='card-title'>Connection info</h5>
                        <div className='form-group row'>
                            <label className='col-2 col-form-label'>Max suspend time:</label>
                            <div className='col-6'>
                                <div className='input-group bootstrap-touchspin'>
                                    <input type='text' className='form-control' placeholder='1800'/>
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
                                    <input type='text' className='form-control' placeholder='60'/>
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
                    <div className='card m-b-20 card-body'>
                        <h5 className='card-title'>Publication price:</h5>
                        <div className='form-group row'>
                            <label className='col-2 col-form-label'>Account:</label>
                            <div className='col-6'>
                                {selectAccount}
                            </div>
                            <div className='col-4 col-form-label'>
                                Balance: <span id='accountBalance'>4125 PRIX / 5 ETH</span>
                            </div>
                        </div>
                        <div className='form-group row'>
                            <label className='col-2 col-form-label'>Deposit:</label>
                            <div className='col-6'>
                                <input type='text' className='form-control' value='' placeholder='3 PRIX' readOnly/>
                                <span className='help-block'>
                                    <small>This deposit will be locked while offering is active.
                                        To return deposit close your offering</small>
                                </span>
                            </div>
                        </div>
                        <div className='form-group row'>
                            <label className='col-2 col-form-label'>Gas price</label>
                            <div className='col-md-6'>
                                <input className='form-control' id='gasRange' onChange={changeGasPrice} type='range' name='range' min='0' max='20'/>
                            </div>
                            <div className='col-4 col-form-label'>
                                <span id='gasPrice'>20</span> Gwei
                            </div>
                        </div>
                        <div className='form-group row'>
                            <div className='col-12 col-form-label'>
                                <strong>Average publication time: <span id='averagePublicationTime'>2 min</span></strong>
                            </div>
                            <div className='col-12 col-form-label'>
                                <strong>More information: <a href='#' onClick={openEthGasStation}>https://ethgasstation.info/</a></strong>
                            </div>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <div className='col-md-8'>
                            <button type='submit' className='btn btn-default btn-block waves-effect waves-light'>Create and Publish</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>;

}

export default asyncReactor(AsyncCreateOffering, Loader);
