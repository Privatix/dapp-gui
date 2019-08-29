import * as React from 'react';
import { translate } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';

import ModalWindow from 'common/modalWindow';
import { EthereumLink, TransactionActions } from 'common/tables/';
import ExternalLink from 'common/etc/externalLink';

import ResendTransaction from './resendTransaction';

import { Transaction } from 'typings/transactions';

interface IProps {
    t?: any;
    transactions: Transaction[];
    network: string;
}

const translated = translate(['transactions/transactionsList', 'common']);

function transactionsTable(props: IProps) {

    const { t, transactions, network } = props;

    const columns = [ EthereumLink, TransactionActions ];

    const noResults = transactions.length === 0
        ? <p className='text-warning text-center m-t-20 m-b-20'>{t('common:NoResults')}</p>
        : null;

    const transactionsData = transactions.map(transaction => {
        const tx = `0x${transaction.hash}`;
        return {
            ethereumLink: <ExternalLink href={`https://${network}etherscan.io/tx/${tx}`} text={tx} />,
            transactionActions: <ModalWindow customClass='btn btn-default btn-custom waves-effect waves-light m-b-30 m-r-20'
                                   modalTitle={t('TransactionsList')}
                                   text={t('Resend')}
                                   component={<ResendTransaction transaction={transaction} />}
                                />
        };
    });

    return (
        <div className='bootstrap-table bootstrap-table-sortable m-b-30'>
            <SortableTable
                data={transactionsData}
                columns={columns}/>
            {noResults}
        </div>
    );
}

export default translated(transactionsTable);
