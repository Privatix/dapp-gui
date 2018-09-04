import * as React from 'react';
import Transactions from '../transactions/transactionsList';
import * as api from '../../utils/api';
import notice from '../../utils/notice';
import ConfirmPopupSwal from '../confirmPopupSwal';
import GasRange from '../utils/gasRange';
import { translate } from 'react-i18next';

@translate(['accounts/accountView', 'utils/notice'])

class AccountView extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {gasPrice: 6*1e9
                     ,amount: 0
                     ,destination: 'psc'
                     ,address: `0x${props.account.ethAddr}`
                     ,account: props.account
                     ,transactions: []
                     ,network: ''
        };
    }

    onGasPriceChanged(evt: any){
        this.setState({gasPrice: Math.floor(evt.target.value*1e9)}); // Gwei = 1e9 wei
    }

    onTransferAmount(evt: any){
        let amount = parseFloat(evt.target.value);
        if(amount !== amount){
            amount = 0;
        }
        amount = Math.floor(amount * 1e8);

        this.setState({amount});
    }

    async checkUserInput(){
        const { t } = this.props;

        let err = false;
        let msg = '';
        const settings = await api.getLocalSettings();

        if(this.state.amount <= 0){
            err = true;
            msg += t('ErrorMoreThanZero');
        }

        if(this.state.destination === 'psc' && this.state.account.ptcBalance < this.state.amount){
            err = true;
            msg += t('ErrorNotEnoughExchangeFunds');
        }

        if(this.state.destination === 'ptc' && this.state.account.psc_balance < this.state.amount){
            err = true;
            msg += t('ErrorNotEnoughServiceFunds');
        }

        if(settings.gas.transfer*this.state.gasPrice > this.state.account.ethBalance) {
            err = true;
            msg += t('ErrorNotEnoughPublishFunds');
        }

        if(err){
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
            return false;
        }else{
            return true;
        }
    }

    onTransferComplete(){
        const {t} = this.props;
        notice({level: 'info', header: t('utils/notice:Attention'), msg: t('SuccessMessage')});
    }

    async refreshTransactions(){
        const transactions = await api.getTransactionsByAccount(this.state.account.id);
        this.setState({transactions});
    }

    startRefreshing(){
        this.refreshTransactions();
        this.setState({handler: setTimeout( ()=> {
            this.startRefreshing();
        }, 3000)});
    }

    stopRefreshing(){
        if(this.state.handler){
            clearInterval(this.state.handler);
        }
    }

    componentDidMount(){
        this.startRefreshing();
        api.getLocalSettings()
           .then(settings => this.setState({network: settings.network}));
    }

    componentWillUnmount(){
        this.stopRefreshing();
    }

    changeTransferType(evt: any){
        evt.preventDefault();
        this.setState({destination: evt.target.value === 'psc' ? 'ptc' : 'psc'});
    }

    render(){
        const { t } = this.props;

        return <div className='col-lg-9 col-md-8'>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('GeneralInfo')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('Name')}</label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={this.state.account.name} readOnly/>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('Address')}</label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={this.state.address} readOnly/>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('BalanceInfo')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('ExchangeBalance')}</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={this.state.account.ptcBalance/1e8} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                            </div>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('ServiceBalance')}</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={this.state.account.psc_balance/1e8} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('Transfer')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('From')}</label>
                        <div className='col-9'>
                            <div className='row'>
                                <div className='col-8'>
                                    <select className='form-control'
                                            value={this.state.destination === 'psc' ? 'ptc' : 'psc'}
                                            onChange={this.changeTransferType.bind(this)}>
                                        <option value='ptc' >{t('ExchangeBalanceOption')}</option>
                                        <option value='psc' >{t('ServiceBalanceOption')}</option>
                                    </select>
                                </div>
                                <div className='col-4 col-form-label'>
                                    <span>{(this.state.destination === 'psc' ? this.state.account.ptcBalance : this.state.account.psc_balance)/1e8}</span> PRIX
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('To')}</label>
                        <div className='col-9'>
                            <input type='text'
                                   className='form-control'
                                   value={this.state.destination === 'psc' ? t('ServiceBalanceOption') : t('ExchangeBalanceOption')}
                                   readOnly/>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('Amount')}</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' onChange={this.onTransferAmount.bind(this)} className='form-control'/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                            </div>
                        </div>
                    </div>
                    <GasRange onChange={this.onGasPriceChanged.bind(this)} value={this.state.gasPrice/1e9} />
                    <div className='form-group row'>
                        <div className='col-12'>
                            <ConfirmPopupSwal
                                beforeAsking={this.checkUserInput.bind(this)}
                                endpoint={`/accounts/${this.state.account.id}/status`}
                                options={{method: 'put'
                                         ,body: {action: 'transfer'
                                                ,amount: this.state.amount
                                                ,destination: this.state.destination
                                                ,gasPrice: this.state.gasPrice
                                                }
                                }}
                                done={this.onTransferComplete.bind(this)}
                                title={t('TransferBtn')}
                                text={<span>{t('TransferSwalText1')} {this.state.destination === 'ptc' ? t('ServiceSwalBalanceFrom') : t('ExchangeSwalBalanceFrom')} {t('TransferSwalText2')} {this.state.destination === 'psc' ? t('ServiceSwalBalance') : t('ExchangeSwalBalance')} {t('TransferSwalText3')}<br />
                                    {t('TransferSwalText4')}<br /><br />{t('TransferSwalText5')}</span>}
                                class={'btn btn-default btn-block btn-custom waves-effect waves-light'}
                                swalType='warning'
                                swalConfirmBtnText={t('TransferConfirmBtn')}
                                swalTitle={t('TransferSwalTitle')} />
                        </div>
                    </div>
                </div>
            </div>
            <div className='card m-t-30'>
                <h5 className='card-header'>{t('TransactionLog')}</h5>
                <div className='card-body'>
                    <Transactions transactions={this.state.transactions} network={this.state.network} />
                </div>
            </div>
        </div>;
    }
}

export default AccountView;
