import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import Pagination from 'react-js-pagination';

import SortableTable from 'react-sortable-table-vilan';

import ExternalLink from 'common/etc/externalLink';
import PgTime from 'common/etc/pgTime';

import { DateCol, EthereumLink } from 'common/tables/';

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
    offset: number;
}

@translate('transactions/transactionsList')
class Transactions extends React.Component<IProps, IState>{

    handler = null;

    get columns() {
        return [ DateCol, EthereumLink ];
    }

    constructor(props: IProps) {

        super(props);

        this.state = {
            transactions: [],
            totalItems: 0,
            activePage: 1,
            offset: 0
        };
    }

    async componentDidMount() {
        this.startRefreshing();
    }

    async getTransactions(activePage:number = 1) {

        const { ws, accountId, localSettings } = this.props;

        const limit = localSettings.elementsPerPage;
        const offset = activePage > 1 ? (activePage - 1) * limit : this.state.offset;

        const transactions = await ws.getTransactions('accountAggregated', accountId, offset, limit);

        this.setState({
            transactions: transactions.items,
            totalItems: transactions.totalItems,
            activePage: activePage
        });
    }

    handlePageChange = (pageNumber:number) => {
        this.getTransactions(pageNumber);
    }

    startRefreshing = () => {
        this.getTransactions(this.state.activePage);
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
                ethereumLink: <ExternalLink href={`https://${network}etherscan.io/tx/${tx}`} text={tx} />
            };
        });
    }

    render() {

        const { t, localSettings } = this.props;
        const { transactions, activePage, totalItems } = this.state;
        const { elementsPerPage } = localSettings;

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
