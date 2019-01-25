import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { translate } from 'react-i18next';

import SortableTable from 'react-sortable-table-vilan';

import ModalWindow from 'common/modalWindow';
import Account from './accountView';
import CopyToClipboard from 'common/copyToClipboard';

import notice from 'utils/notice';
import { WS } from 'utils/ws';

import {State} from 'typings/state';
import {Account as AccountType} from 'typings/accounts';

interface IProps {
    accounts?: AccountType[];
    t?: any;
    ws?: WS;
}

interface IState {

}

@translate(['accounts/accountsList', 'utils/notice'])
class Accounts extends React.Component<IProps, IState> {

    constructor(props: IProps) {

        super(props);
    }

    async onRefresh(accountId:any, evt: any){
        evt.preventDefault();
        const { t, ws } = this.props;
        await ws.updateBalance(accountId);
        notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t('RefreshingAccountBalanceMsg')});
    }

    render(){

        const { t, accounts } = this.props;

        const accountsDataArr = accounts.map((account: AccountType) => {

            const isDefault = account.isDefault === true ? 'on' : 'off';

            const ethereumAddress = `0x${account.ethAddr}`;
            return {
                name: <ModalWindow key={ethereumAddress}
                                   visible={false}
                                   customClass=''
                                   modalTitle={t('ModalTitle')}
                                   text={account.name}
                                   component={<Account account={account} />}
                      />,
                ethereumAddress,
                eth: (account.ethBalance/1e18).toFixed(3),
                exchangeBalance: (account.ptcBalance/1e8).toFixed(3),
                serviceBalance: (account.pscBalance/1e8).toFixed(3),
                isDefault: <span className={'fieldStatusLabel fieldStatus-' + isDefault}>
                               <i className={'md md-check-box' + (isDefault === 'off' ? '-outline-blank' : '')}></i>
                           </span>,
                actions: <Link to={'#'}
                               onClick={this.onRefresh.bind(this, account.id)}
                               className='btn btn-default btn-custom waves-effect waves-light'
                         >
                             {t('CheckBalanceBtn')}
                         </Link>
            };

        });

        const columns = [
            {
                header: t('Name'),
                key: 'name'
            },
            {
                header: t('EthereumAddress'),
                key: 'ethereumAddress',
                dataProps: { className: 'shortTableTextTd' },
                render: (ethereumAddress) => {
                    return <div>
                        <span className='shortTableText' title={ethereumAddress}>{ethereumAddress}</span>
                        <CopyToClipboard text={ethereumAddress} />
                    </div>;
                }
            },
            {
                header: t('ETH'),
                key: 'eth'
            },
            {
                header: t('ExchangeBalance'),
                key: 'exchangeBalance',
                headerStyle: {textAlign: 'center'},
                dataProps: {className: 'text-center'},
            },
            {
                header: t('ServiceBalance'),
                key: 'serviceBalance',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
            }
            ,
            {
                header: t('IsDefault'),
                key: 'isDefault',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
                sortable: false
            },
            {
                header: t('Actions'),
                key: 'actions',
                headerStyle: {textAlign: 'center'},
                dataProps: { className: 'text-center'},
                sortable: false
            }
        ];

        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <h3 className='page-title'>{t('Title')}</h3>
                    <div className='m-t-15'>
                        <Link to={'/setAccount'} className='btn btn-default btn-custom waves-effect waves-light m-r-15'>
                            {t('CreateBtn')}
                        </Link>
                    </div>
                </div>
            </div>
            <div className='row'>
                <div className='col-12'>
                    <div className='card-box'>
                        <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                            <SortableTable
                                data={accountsDataArr}
                                columns={columns}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect( (state: State) => ({accounts: state.accounts, ws: state.ws}) )(Accounts);
