import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { translate } from 'react-i18next';
import { remote } from 'electron';

import SortableTable from 'react-sortable-table-vilan';

import ModalWindow from 'common/modalWindow';
import Account from './accountView';

import notice from 'utils/notice';
import * as api from 'utils/api';

import {State} from 'typings/state';

import { Name, EthereumAddress, ETH, ExchangeBalance, ServiceBalance, IsDefault, Actions } from 'common/tables/';

interface IProps {
    accounts?: State['accounts'];
    t?: any;
    ws?: State['ws'];
}

@translate(['accounts/accountsList', 'auth/backup', 'utils/notice'])
class Accounts extends React.Component<IProps, {}> {

    async onRefresh(accountId:string, evt: any){

        evt.preventDefault();

        const { t, ws } = this.props;

        await ws.updateBalance(accountId);
        notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t('RefreshingAccountBalanceMsg')});
    }

    async onBackup(accountId:string, evt: any){

        evt.preventDefault();

        const { t, ws } = this.props;
        const fileName = remote.dialog.showSaveDialog({});

        if(fileName){
            ws.exportAccount(accountId, (res: any) => {
                api.fs.saveAs(fileName, atob(res.result))
                    .then((res:any) => {
                        if(res.err){
                            notice({level: 'error', header: t('utils/notice:Error!'), msg: t('auth/backup:SomeErrorOccured')});
                        }else{
                            notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t('BackupSuccessMsg')});
                        }
                    });
            });
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
                isDefault: <span className={'fieldStatusLabel fieldStatus-' + isDefault} onClick={account.isDefault ? null : this.onSetAsDefault.bind(this, account)}>
                               <i className={'md md-check-box' + (isDefault === 'off' ? '-outline-blank' : '')}></i>
                           </span>,
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
            ETH,
            ExchangeBalance,
            ServiceBalance,
            IsDefault,
            Actions
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
