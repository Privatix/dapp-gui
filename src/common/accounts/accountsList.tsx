import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { translate } from 'react-i18next';
import { remote } from 'electron';

import { asyncProviders } from 'redux/actions';

import SortableTable from 'react-sortable-table-vilan';

import ModalWindow from 'common/modalWindow';
import Account from './accountView';

import notice from 'utils/notice';
import * as api from 'utils/api';

import {State} from 'typings/state';

import eth from 'utils/eth';
import prix from 'utils/prix';
import addFileExt from 'utils/addFileExt';

import { Name, EthereumAddress, AccountBalance, Marketplace, Escrow, Actions } from 'common/tables/';

interface IProps {
    accounts?: State['accounts'];
    t?: any;
    ws?: State['ws'];
    dispatch: any;
}

@translate(['accounts/accountsList', 'auth/backup', 'utils/notice'])
class Accounts extends React.Component<IProps, {}> {

    componentDidMount(){
        const { dispatch } = this.props;
        dispatch(asyncProviders.updateAccounts());
    }

    async onRefresh(accountId:string, evt: any){

        evt.preventDefault();

        const { t, ws } = this.props;

        try{
            await ws.updateBalance(accountId);
            notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t('RefreshingAccountBalanceMsg')});
        }catch(e){
            notice({level: 'warning', header: t('utils/notice:Attention!'), msg: t('RefreshingAccountBalanceErrorMsg')});
        }
    }

    async onBackup(accountId:string, evt: any){

        evt.preventDefault();

        const { t, ws } = this.props;
        let fileName = remote.dialog.showSaveDialog({
            filters: [{
                name: 'json',
                extensions: ['json']
            }]
        });

        fileName = addFileExt('json', fileName);

        if(fileName){
            try {
                const acc = await ws.exportAccount(accountId);
                const response = await api.fs.saveAs(fileName, atob(acc));
                if(response.err){
                    throw new Error();
                }
                notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t('BackupSuccessMsg')});
            }catch(e){
                notice({level: 'error', header: t('utils/notice:Error!'), msg: t('auth/backup:SomeErrorOccured')});
            }
        }
    }

    async onSetAsDefault(account: any){

        const { ws } = this.props;

        try{
            await ws.updateAccount(account.id, account.name, true, account.inUse);
        }catch(e){
            //
        }
    }

    render(){

        const { t, accounts } = this.props;

        const accountsDataArr = accounts.map(account => {

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
                account: <>{prix(account.ptcBalance)} PRIX&nbsp;&nbsp;{eth(account.ethBalance)} ETH</>,
                marketplace: prix(account.pscBalance) + ' PRIX',
                escrow: prix(account.escrow) + ' PRIX',
                actions: <>
                             <Link to={'#'}
                                   onClick={this.onRefresh.bind(this, account.id)}
                                   className='btn btn-default btn-custom waves-effect waves-light'
                             >
                                 {t('CheckBalanceBtn')}
                             </Link>
                             <Link to={'#'}
                                   onClick={this.onBackup.bind(this, account.id)}
                                   className='btn btn-default btn-custom waves-effect waves-light'
                                   style={ {marginLeft: '5px'} }
                             >
                                 {t('BackupBtn')}
                             </Link>
                         </>
            };

        });

        const columns = [
            Name,
            EthereumAddress,
            AccountBalance,
            Marketplace,
            Escrow,
            Actions
        ];

        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12 m-b-15'>
                    <h3 className='page-title'>{t('Title')}</h3>
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
