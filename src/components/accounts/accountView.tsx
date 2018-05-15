import * as React from 'react';
import Transactions from '../transactions/transactionsList';
import { Link } from 'react-router-dom';

export default function(props:any){

    const transferToServiceBalance = function(evt:any){
        evt.preventDefault();
        console.log('TRANSFER TO SERVICE!!!');
    };

    const transferToExchangeBalance = function(evt:any){
        evt.preventDefault();
        console.log('TRANSFER TO EXCHANGE!!!');
    };

    const setAsDefault = function(evt:any){
        evt.preventDefault();
        console.log('SET AS DEFAULT!!!');
    };

    const deleteAccount = function(evt:any){
        evt.preventDefault();
        console.log('DELETE ACCOUNT!!!');
    };

    const account = JSON.parse(props.match.params.account);

    return <div className='container-fluid'>
        <div className='card-box'>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <div className='btn-group pull-right'>
                        <Link to={'/accounts'} className='btn btn-default waves-effect waves-light'>&lt;&lt;&lt; Back</Link>
                    </div>
                    <h3 className='page-title'>Account</h3>
                </div>
            </div>
            <div className='row justify-content-between'>
                <div className='col-md-6'>
                    <form className='form-horizontal m-t-20'>
                        <fieldset className='form-group'>
                            <legend className=''>Address</legend>
                            0x{Buffer.from(account.ethAddr, 'base64').toString('hex')}
                        </fieldset>
                    </form>
                    <form className='form-horizontal m-t-20'>
                        <button type='button' className='btn btn-default waves-effect waves-light' onClick={setAsDefault}>Set as default</button>
                    </form>
                </div>
                <div className='col-md-4 col-sm-3 col-4 col-xl-3'>
                    <form className='form-horizontal m-t-20'>
                        <fieldset className='form-group text-center'>
                            <legend>Warning area</legend>
                            <button type='button' className='btn btn-danger waves-effect waves-light' onClick={deleteAccount}>Delete</button>
                        </fieldset>
                    </form>
                </div>
            </div>

            <form className='form-horizontal m-t-20'>
                <div className='form-group row acExchange'>
                        <label className=''>Exchange balance</label>
                        <input type='text' id='fromExchangeBalance' />
                        <label className=''>transfer to Service balance</label>
                        <input type='text' id='toServiceBalance' />
                        <button type='button' className='btn btn-default waves-effect waves-light' onClick={transferToServiceBalance}>Transfer</button>
                </div>
            </form>
            <form className='form-horizontal m-t-20'>
                <div className='form-group row acExchange'>
                    <label>Service balance</label>
                    <input type='text' id='fromServiceBalance' />
                    <label>transfer to Exchange balance</label><input type='text' id='toExchangeBalance' />
                    <button type='button' className='btn btn-default waves-effect waves-light' onClick={transferToExchangeBalance}>Transfer</button>
                </div>
            </form>
            <h3 className='text-center'>Transaction Log</h3>
            <Transactions account={account.id} />
        </div>
    </div>;
}
