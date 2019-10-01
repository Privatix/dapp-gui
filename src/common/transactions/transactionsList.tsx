import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import Pagination from 'react-js-pagination';

import SortableTable from 'react-sortable-table-vilan';

import ExternalLink from 'common/etc/externalLink';
import PgTime from 'common/etc/pgTime';

import { DateCol, EthereumLink, Actions } from 'common/tables/';
import Restart from './blocks/restartBtn';

import { WS } from 'utils/ws';
import { State } from 'typings/state';
import { LocalSettings } from 'typings/settings';
import { Transaction } from 'typings/transactions';

interface IProps{
    ws?: WS;
    t?: any;
    localSettings?: LocalSettings;
    accountId: string;
}

interface IState{
    transactions: Transaction[];
    totalItems: number;
    activePage: number;
}

@translate('transactions/transactionsList')
class Transactions extends React.Component<IProps, IState>{

    handler = null;

    get columns() {
        return [ DateCol, EthereumLink, Actions ];
    }

    constructor(props: IProps) {

        super(props);

        this.state = {
            transactions: [],
            totalItems: 0,
            activePage: 1
        };
    }

    async componentDidMount() {
        this.startRefreshing();
    }

    async getTransactions() {

        const { ws, accountId, localSettings } = this.props;
        const { activePage } = this.state;

        const limit = localSettings.paging.transactions;
        const offset = (activePage - 1) * limit;

        const transactions = await ws.getTransactions(accountId ? 'accountAggregated' : '', accountId ? accountId : '', offset, limit);

        this.setState({
            transactions: transactions.items,
            totalItems: transactions.totalItems,
            activePage: activePage
        });
    }

    handlePageChange = (activePage:number) => {
        this.setState({activePage});
        this.getTransactions();
    }

    startRefreshing = () => {
        this.getTransactions();
        this.handler = setTimeout(this.startRefreshing, 3000);
    }

    stopRefreshing() {
        if (this.handler) {
            clearInterval(this.handler);
            this.handler = null;
        }
    }

    componentWillUnmount() {
        this.stopRefreshing();
    }

    getTransactionsDataArr(transactions: Transaction[]) {
        const { localSettings } = this.props;
        return transactions.map((transaction: Transaction) => {
            const tx = `0x${transaction.hash}`;
            const network = localSettings.network === 'mainnet' ? '' : `${localSettings.network}.`;
            return {
                date: <PgTime time={transaction.issued} />,
                ethereumLink: <ExternalLink href={`https://${network}etherscan.io/tx/${tx}`} text={tx} />,
                actions: transaction.status === 'sent' ? <Restart transaction={transaction} /> : null
            };
        });
    }

    render() {

        const { t, localSettings } = this.props;
        const { transactions, activePage, totalItems } = this.state;
        const elementsPerPage = localSettings.paging.transactions;

        const transactionsDataArr = this.getTransactionsDataArr(transactions);

        const pagination = totalItems <= elementsPerPage
            ? null
            : <div>
                <Pagination
                    activePage={activePage}
                    itemsCountPerPage={elementsPerPage}
                    totalItemsCount={totalItems}
                    pageRangeDisplayed={10}
                    onChange={this.handlePageChange}
                    prevPageText='‹'
                    nextPageText='›'
                />
            </div>;

        return <div className='card m-t-30'>
            <h5 className='card-header'>{t('TransactionLog')}</h5>
            <div className='card-body'>
                <div className='row'>
                    <div className='col-12'>
                        <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                            <SortableTable
                                data={transactionsDataArr}
                                columns={this.columns} />
                        </div>

                        {pagination}
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect( (state: State) => ({ws: state.ws, localSettings: state.localSettings}) )(Transactions);
