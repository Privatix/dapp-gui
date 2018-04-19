import * as React from 'react';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';
import TransactionItem from './transactionItem';


function Loader() {

  return (<h2>Loading transactions ...</h2>);

}

async function AsyncTransactions (props: any){

    const endpoint = '/transactions' + (props.account === 'all' ? '' : `?account=${props.account}`);
    const transactions = await fetch(endpoint, {method: 'GET'});
    const transactionsDOM = (transactions as any).map((transaction: any) => <TransactionItem transaction={transaction} account={props.account}/>);
    return <div> 
        <hr />
        <table>
            <thead>
                <tr>
                <td>Date</td><td>Ethereum link</td>
                </tr>
            </thead>
            <tbody>
                {transactionsDOM}
            </tbody>
        </table>
    </div>;
}

export default asyncReactor(AsyncTransactions, Loader);
