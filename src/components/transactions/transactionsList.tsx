import * as React from 'react';
import SortableTable from 'react-sortable-table-vilan';
import DateSorter from '../utils/sorters/sortingDates';
import ExternalLink from '../utils/externalLink';
import PgTime from '../utils/pgTime';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import {State} from '../../typings/state';
import Pagination from 'react-js-pagination';
import * as api from '../../utils/api';
import {LocalSettings} from '../../typings/settings';

@translate('transactions/transactionsList')

class Transactions extends React.Component<any, any>{

    constructor(props:any) {
        super(props);
        const { t } = props;

        this.state = {
            transactionsDataArr: [],
            handler: null,
            elementsPerPage: 0,
            totalItems: 0,
            activePage: 1,
            offset: 0,
            columns: [
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
            ]
        };
    }

    async componentDidMount() {
        await this.getElementsPerPage();
        this.startRefreshing();
    }

    async getElementsPerPage() {
        const settings = (await api.settings.getLocal()) as LocalSettings;
        this.setState({elementsPerPage: settings.elementsPerPage});
    }

    async getTransactions(activePage:number = 1) {
        const limit = this.state.elementsPerPage;
        const offset = activePage > 1 ? (activePage - 1) * limit : this.state.offset;

        const transactions = await this.props.ws.getTransactions('accountAggregated', this.props.accountId, offset, limit);
        const transactionsDataArr = this.getTransactionsDataArr(transactions.items);

        this.setState({
            transactionsDataArr,
            totalItems: transactions.totalItems,
            activePage: activePage
        });
    }

    getTransactionsDataArr(transactions: Array<Object>) {
        return transactions.map((transaction: any) => {
            const tx = `0x${transaction.hash}`;
            return {
                date: <PgTime time={transaction.issued} />,
                ethereumLink: <ExternalLink href={`https://${this.props.network === '' ? '' : this.props.network + '.'}etherscan.io/tx/${tx}`} text={tx} />
            };
        });
    }

    handlePageChange(pageNumber:number) {
        this.getTransactions(pageNumber);
    }

    startRefreshing(){
        this.getTransactions(this.state.activePage);
        this.setState({handler: setTimeout( ()=> {
                this.startRefreshing();
            }, 3000)});
    }

    stopRefreshing() {
        if (this.state.handler) {
            clearInterval(this.state.handler);
        }
    }

    componentWillUnmount() {
        this.stopRefreshing();
    }

    render() {
        const {t} = this.props;

        const pagination = this.state.totalItems <= this.state.elementsPerPage ? '' :
            <div>
                <Pagination
                    activePage={this.state.activePage}
                    itemsCountPerPage={this.state.elementsPerPage}
                    totalItemsCount={this.state.totalItems}
                    pageRangeDisplayed={10}
                    onChange={this.handlePageChange.bind(this)}
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
                                data={this.state.transactionsDataArr}
                                columns={this.state.columns} />
                        </div>

                        {pagination}
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect( (state: State) => ({ws: state.ws}) )(Transactions);
