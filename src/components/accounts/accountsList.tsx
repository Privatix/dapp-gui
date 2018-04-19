import * as React from 'react';
import { Link } from 'react-router-dom';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';
import AccountItem from './accountItem';


function Loader() {

  return (<h2>Loading accounts ...</h2>);

}

async function AsyncAccounts (props: any){

    const endpoint = '/accounts';
    const accounts = await fetch(endpoint, {method: 'GET'});
    const accountsDOM = (accounts as any).map((account: any) => <AccountItem account={account} />);
    return <div> 
        <h3>Accounts</h3>
        <hr />
        <Link to={'/addAccount'} >Create</Link>
        <br />
        <table>
            <thead>
                <tr>
                <td>Name</td><td>Ethereum address</td><td>ETH</td><td>Exchange Balance</td><td>Service balance</td><td>In Use</td><td>Is Default</td>
                </tr>
            </thead>
            <tbody>
                {accountsDOM}
            </tbody>
        </table>
    </div>;
}

export default asyncReactor(AsyncAccounts, Loader);
