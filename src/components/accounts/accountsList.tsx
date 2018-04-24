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
    return <div className='container-fluid'>
        <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <div className='btn-group pull-right m-t-15'>
                        <Link to={'/addAccount'} className='btn btn-default waves-effect waves-light'>Create</Link>
                    </div>
                    <h3 className='page-title'>Accounts</h3>
                </div>
        </div>
        <div className='row'>
            <div className='col-12'>
                <div className='card-box'>
                    <table className='table table-bordered table-striped'>
                        <thead>
                            <tr>
                            <td>Name</td><td>Ethereum address</td><td>ETH</td><td>Exchange Balance</td><td>Service balance</td><td>In Use</td><td>Is Default</td>
                            </tr>
                        </thead>
                        <tbody>
                            {accountsDOM}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>;
}

export default asyncReactor(AsyncAccounts, Loader);
