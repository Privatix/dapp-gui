import * as React from 'react';
import Transactions from '../transactions/transactionsList';

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

    return <div><h3>Account</h3>
    <form>
        <fieldset>
            <legend>Address</legend>
            0x{account.ethAddr}
        </fieldset>
    </form>
    <form>
        <button type='button' onClick={setAsDefault}>Set as default</button>
    </form>
    <form>
        <fieldset>
            <legend>Warning area</legend>
            <button type='button' onClick={deleteAccount}>Delete</button>
        </fieldset>
    </form>
    <form>
        <label>Exchange balance <input type='text' id='fromExchangeBalance' /></label>
        <label>transfer to Service balance <input type='text' id='toServiceBalance' /></label>
        <button type='button' onClick={transferToServiceBalance}>Transfer</button>
    </form>
    <form>
        <label>Service balance <input type='text' id='fromServiceBalance' />Transfer</label>
        <label>transfer to Exchange balance <input type='text' id='toExchangeBalance' /></label>
        <button type='button' onClick={transferToExchangeBalance}>Transfer</button>
    </form>
    <h3>Transaction Log</h3>
    <Transactions account={account.id} />
    <hr />
    </div>;
}
