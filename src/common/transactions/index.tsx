import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import Pagination from 'react-js-pagination';

import {State} from 'typings/state';
import { Transaction } from 'typings/transactions';

import TransactionsTable from './blocks/table';

interface IProps {
    t?: any;
    localSettings: State['localSettings'];
    ws: State['ws'];
}

interface IState {
    transactionsData: Transaction[];
    activePage: number;
    pages: number;
    offset: number;
    limit: number;
    totalItems: number;
}

@translate(['transactions/transactionsList', 'common'])
class Transactions extends React.Component <IProps, IState> {

    constructor(props:IProps) {

        super(props);

        const { localSettings } = this.props;

        this.state = {
            transactionsData: [],
            activePage: 1,
            pages: 1,
            offset: 0,
            limit: localSettings.paging.transactions,
            totalItems: 0,
        };
    }

    componentDidMount() {
        const { offset, limit } = this.state;
        this.getTransactionsData(offset, limit);
    }

    async getTransactionsData(offset: number, limit: number) {

        const { ws } = this.props;

        const transactions = await ws.getTransactions('', '', offset, limit);
        const pages = Math.ceil(transactions.totalItems / limit);
        this.setState({
            transactionsData: transactions.items ? transactions.items : [],
            pages,
            totalItems: transactions.totalItems
        });

    }

    handlePageChange = (activePage:number) => {

        const { limit } = this.state;

        this.getTransactionsData((activePage-1)*limit, limit);

        this.setState({activePage});
    }

    render() {

        const { t, localSettings } = this.props;
        const { totalItems
              , activePage
              , limit
              , transactionsData
              } = this.state;

        const pagination = totalItems <= limit
            ? null
            : <Pagination
                activePage={activePage}
                itemsCountPerPage={limit}
                totalItemsCount={totalItems}
                pageRangeDisplayed={10}
                onChange={this.handlePageChange}
                prevPageText='‹'
                nextPageText='›'
            />;

        const network = localSettings.network === 'mainnet' ? '' : `${localSettings.network}.`;

        return (
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-12 m-b-15'>
                        <h3 className='page-title'>{t('TransactionsHeader')}</h3>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-12'>
                        <div className='card-box'>

                            <TransactionsTable transactions={transactionsData} network={network} />

                            <div>{pagination}</div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect( (state: State) => ({ws: state.ws, localSettings: state.localSettings}) )(Transactions);
