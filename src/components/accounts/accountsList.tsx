import * as React from 'react';
import { Link } from 'react-router-dom';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';
import SortableTable from 'react-sortable-table';

function Loader() {

  return (<h2>Loading accounts ...</h2>);

}

async function AsyncAccounts (props: any){

    const endpoint = '/accounts';
    const accounts = await fetch(endpoint, {method: 'GET'});

    const accountsDataArr = [];
    (accounts as any).map((account: any) => {

        let isUse = account.inUse === true ? 'on' : 'off';
        let isDefault = account.isDefault === true ? 'on' : 'off';

        let row = {
            name: <Link to={`/account/${JSON.stringify(account)}`}>{account.name}</Link>,
            ethereumAddress: `0x${Buffer.from(account.ethAddr, 'base64').toString('hex')}`,
            eth: (account.ethBalance/1e8).toFixed(3),
            exchangeBalance: (account.ptcBalance/1e8).toFixed(3),
            serviceBalance: (account.psc_balance/1e8).toFixed(3),
            inUse: <span className={'fieldStatusLabel fieldStatus-' + isUse}><i className={'md md-check-box' + (isUse === 'off' ? '-outline-blank' : '')}></i></span>,
            isDefault: <span className={'fieldStatusLabel fieldStatus-' + isDefault}><i className={'md md-check-box' + (isDefault === 'off' ? '-outline-blank' : '')}></i></span>
        };

        accountsDataArr.push(row);
    });

    const columns = [
        {
            header: 'Name',
            key: 'name'
        },
        {
            header: 'Ethereum address',
            key: 'ethereumAddress'
        },
        {
            header: 'ETH',
            key: 'eth'
        },
        {
            header: 'Exchange Balance',
            key: 'exchangeBalance',
            headerStyle: {textAlign: 'center'},
            dataProps: {className: 'text-center'},
        },
        {
            header: 'Service balance',
            key: 'serviceBalance',
            headerStyle: {textAlign: 'center'},
            dataProps: { className: 'text-center'},
        },
        {
            header: 'In Use',
            key: 'inUse',
            headerStyle: {textAlign: 'center'},
            dataProps: { className: 'text-center'},
        },
        {
            header: 'Is Default',
            key: 'isDefault',
            headerStyle: {textAlign: 'center'},
            dataProps: { className: 'text-center'},
        }
    ];

    return <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <h3 className='page-title'>Accounts</h3>
                <div className='m-t-15'>
                    <Link to={'/addAccount'} className='btn btn-default btn-custom waves-effect waves-light m-r-15'>Create an account</Link>
                    <Link to={'#'} className='btn btn-default btn-custom waves-effect waves-light'>Refresh all</Link>
                </div>
            </div>
        </div>
        <div className='row'>
            <div className='col-12'>
                <div className='card-box'>
                    <div className='bootstrap-table bootstrap-table-sortable'>
                        <SortableTable
                            data={accountsDataArr}
                            columns={columns} />
                    </div>
                </div>
            </div>
        </div>
    </div>;
}

export default asyncReactor(AsyncAccounts, Loader);
