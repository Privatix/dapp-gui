import * as React from 'react';
import {fetch} from 'Utils/fetch';
import {asyncReactor} from 'async-reactor';
import ExternalLink from '../utils/externalLink';
import SortableTable from 'react-sortable-table';

function Loader() {

  return (<h2>Loading transactions ...</h2>);

}

async function AsyncTransactions (props: any){

    const endpoint = '/transactions' + (props.account === 'all' ? '' : `?account=${props.account}`);
    const transactions = await fetch(endpoint, {method: 'GET'});

    const transactionsDataArr = [];
    (transactions as any).map((transaction: any) => {
        let row = {
            date: transaction.date,
            ethereumLink: <ExternalLink href={`https://etherscan.io/address/0x${transaction.ethAddr}`} text={`0x${transaction.ethAddr}`} />
        };

        transactionsDataArr.push(row);
    });

    const columns = [
        {
            header: 'Date',
            key: 'date'
        },
        {
            header: 'Ethereum link',
            key: 'ethereumLink',
            sortable: false
        }
    ];

    return <div className='row'>
        <div className='col-12'>
            <div className='bootstrap-table bootstrap-table-sortable'>
                <SortableTable
                    data={transactionsDataArr}
                    columns={columns} />
            </div>
        </div>
    </div>;
}

export default asyncReactor(AsyncTransactions, Loader);
