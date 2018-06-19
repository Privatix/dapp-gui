import * as React from 'react';
import {fetch} from '../../utils/fetch';
import { withRouter } from 'react-router-dom';
import {asyncReactor} from 'async-reactor';
import GasRange from '../../components/utils/gasRange';

function Loader() {
    return (<h2>Loading data ...</h2>);
}

async function AsyncAcceptOffering (props:any){
    const accounts = await fetch('/accounts/', {method: 'get'});
    const offering = props.offering;

    const onChangeAccount = async function(){
        const selectAccount = document.getElementById('selectAccount');
        const accountId = (selectAccount as any).options[(selectAccount as any).selectedIndex].value;
        const account = await fetch(`/accounts?id=${accountId}`, {method: 'get'}) as any;
        document.getElementById('accountBalance').innerHTML = `${(account[0].ptcBalance/1e8).toFixed(3)} PRIX / ${(account[0].ethBalance/1e8).toFixed(3)} ETH`;
    };

    const selectAccount = <select className='form-control' id='selectAccount' onChange={onChangeAccount}>
        {(accounts as any).map((account:any) => <option key={account.id} value={account.id}>{account.name}</option>) }
    </select>;

    let gasPrice = 6*1e9;
    const changeGasPrice = (evt:any) => {
        gasPrice = Math.floor(evt.target.value * 1e9);
    };

    return <div className='col-lg-12 col-md-12'>
        <div className='card m-b-20'>
            <h5 className='card-header'>VPN Info</h5>
            <div className='card-body'>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Country: </label>
                    <div className='col-9'>
                        <input type='text' className='form-control' value={offering.country} readOnly/>
                    </div>
                </div>
            </div>
        </div>

        <div className='card m-b-20'>
            <h5 className='card-header'>Billing Info</h5>
            <div className='card-body'>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Price per Mb:</label>
                    <div className='col-9'>
                        <div className='input-group bootstrap-touchspin'>
                            <input type='text' className='form-control' value={offering.unitPrice} readOnly/>
                            <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className='card m-b-20'>
            <h5 className='card-header'>Connection Info</h5>
            <div className='card-body'>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Max inactive time:</label>
                    <div className='col-9'>
                        <div className='input-group bootstrap-touchspin'>
                            <input type='text' className='form-control' value={offering.maxInactiveTimeSec} readOnly/>
                            <span className='input-group-addon bootstrap-touchspin-postfix'>sec</span>
                        </div>
                        <span className='help-block'>
                            <small>Maximum time without service usage.
                                Agent will consider that Client will not use service and stop providing it.
                                Period is specified in seconds.</small>
                        </span>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-3 col-form-label'>Automatically connect to VPN:</label>
                    <div className='col-9'>
                        <label className='switch'>
                            <input type='checkbox' id='autoConnect' />
                                <span className='slider round'></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div className='card m-b-20'>
            <h5 className='card-header'>Pay Info:</h5>
            <div className='card-body'>
                <div className='form-group row'>
                    <label className='col-2 col-form-label'>Account:</label>
                    <div className='col-6'>
                        {selectAccount}
                    </div>
                    <div className='col-4 col-form-label'>
                        Balance: <span id='accountBalance'>{(accounts[0].ptcBalance).toFixed(3)} PRIX / {(accounts[0].ethBalance/1e8).toFixed(3)} ETH</span>
                    </div>
                </div>
                <div className='form-group row'>
                    <label className='col-2 col-form-label'>Deposit:</label>
                    <div className='col-6'>
                        <input id='offeringDeposit' type='text' className='form-control' value='' placeholder='PRIX' readOnly/>
                        <span className='help-block'>
                            <small>After the end of using, the unused PRIX will be returned.</small>
                        </span>
                    </div>
                </div>
                <GasRange onChange={changeGasPrice} value={gasPrice/1e9}
                          extLinkText='Information about Gas price' averageTimeText={'acceptance'} />
                <div className='form-group row'>
                    <div className='col-2 col-form-label font-18'><strong>Acceptance Price:</strong></div>
                    <div className='col-6 col-form-label font-18'>
                        <strong>3 PRIX</strong>
                    </div>
                </div>
            </div>
        </div>

        <div className='form-group row'>
            <div className='col-md-12'>
                <button type='submit' className='btn btn-default btn-lg btn-custom btn-block waves-effect waves-light'>Accept</button>
            </div>
        </div>
    </div>;
}

export default withRouter(asyncReactor(AsyncAcceptOffering, Loader));
