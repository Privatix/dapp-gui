import * as React from 'react';
import SortableTable from 'react-sortable-table-vilan';
import DateSorter from '../utils/sorters/sortingDates';
import ExternalLink from '../utils/externalLink';
import PgTime from '../utils/pgTime';
import { translate } from 'react-i18next';

@translate('transactions/transactionsList')

export default class Transactions extends React.Component<any, any>{

    render() {
        const {t} = this.props;

        const transactionsDataArr = (this.props.transactions as any).map((transaction: any) => {
            const tx = `0x${Buffer.from(transaction.hash, 'base64').toString('hex')}`;
            const row = {
                date: <PgTime time={transaction.issued} />,
                ethereumLink: <ExternalLink href={`https://${this.props.network === '' ? '' : this.props.network + '.'}etherscan.io/tx/${tx}`} text={tx} />
            };

            return row;
        });

        const columns = [
            {
                header: t('Date'),
                key: 'date',
                defaultSorting: 'DESC',
                descSortFunction: DateSorter.desc,
                ascSortFunction: DateSorter.asc
            },
            {
                header: t('EthereumLink'),
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
}
