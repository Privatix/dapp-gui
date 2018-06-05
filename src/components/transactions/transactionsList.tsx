import * as React from 'react';
import {fetch} from '../../utils/fetch';
import {asyncReactor} from 'async-reactor';
import SortableTable from 'react-sortable-table';
import ExternalLink from '../utils/externalLink';
import PgTime from '../utils/pgTime';

function Loader() {

  return (<h2>Loading transactions ...</h2>);

}

async function AsyncTransactions (props: any){

    const endpoint = '/transactions' + (props.account === 'all' ? '' : `?relatedId=${props.account}&relatedType=account`);
    const transactions = await fetch(endpoint, {method: 'GET'});
    console.log(endpoint, transactions);

    const transactionsDataArr = [];
    (transactions as any).map((transaction: any) => {
        const tx = `0x${Buffer.from(transaction.hash, 'base64').toString('hex')}`;
        let row = {
            date: <PgTime time={transaction.issued} />,
            ethereumLink: <ExternalLink href={`https://etherscan.io/tx/${tx}`} text={tx} />
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
