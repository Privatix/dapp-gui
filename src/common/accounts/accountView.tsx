import * as React from 'react';
import { translate } from 'react-i18next';

import Transactions from 'common/transactions/transactionsList';
import ConfirmPopupSwal from 'common/confirmPopupSwal';
import GasRange from 'common/etc/gasRange';

import * as api from 'utils/api';
import { WS, ws } from 'utils/ws';
import notice from 'utils/notice';

import { Account } from 'typings/accounts';

interface IProps {
    ws?: WS;
    t?: any;
    account: Account;
}

@translate(['accounts/accountView', 'utils/notice'])
class AccountView extends React.Component<IProps, any> {

    constructor(props: any) {
        super(props);
        this.state = {gasPrice: 6*1e9
                     ,amount: 0
                     ,destination: 'psc'
                     ,address: `0x${props.account.ethAddr}`
                     ,network: ''
        };
    }

    componentDidMount() {
        api.settings.getLocal()
            .then(settings => this.setState({network: settings.network}));
    }

    onGasPriceChanged = (evt: any) => {
        this.setState({gasPrice: Math.floor(evt.target.value*1e9)}); // Gwei = 1e9 wei
    }

    onTransferAmount = (evt: any) => {
        let amount = parseFloat(evt.target.value);
        if(amount !== amount){
            amount = 0;
        }
        amount = Math.floor(amount * 1e8);

        this.setState({amount});
    }

    checkUserInput = async () => {

        const { t, account } = this.props;

        let err = false;
        let msg = '';
        const settings = await api.settings.getLocal();

        if(this.state.amount <= 0){
            err = true;
            msg += t('ErrorMoreThanZero');
        }

        if(this.state.destination === 'psc' && account.ptcBalance < this.state.amount){
            err = true;
            msg += t('ErrorNotEnoughExchangeFunds');
        }

        if(this.state.destination === 'ptc' && account.pscBalance < this.state.amount){
            err = true;
            msg += t('ErrorNotEnoughServiceFunds');
        }

        if(settings.gas.transfer*this.state.gasPrice > account.ethBalance) {
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

    transferTokens = async () => {

        const { t, ws, account } = this.props;
        const { amount, destination, gasPrice } = this.state;

        try {
            await ws.transferTokens(account.id, destination, amount, gasPrice);
            notice({level: 'info', header: t('utils/notice:Attention!'), msg: t('SuccessMessage')});
        } catch ( e ) {
            // TODO something wrong !!!
            console.log('ERROR', e);
        }

    }

    changeTransferType = (evt: any) => {
        evt.preventDefault();
        this.setState({destination: evt.target.value === 'psc' ? 'ptc' : 'psc'});
    }

    render() {

        const { t, account } = this.props;
        const { destination, address, gasPrice, network } = this.state;

        return <div className='col-lg-9 col-md-8'>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('GeneralInfo')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('Name')}</label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={account.name} readOnly/>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('Address')}</label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={address} readOnly/>
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
                                <input type='text' className='form-control' value={account.ptcBalance/1e8} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                            </div>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('ServiceBalance')}</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={account.pscBalance/1e8} readOnly/>
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
                                            value={destination === 'psc' ? 'ptc' : 'psc'}
                                            onChange={this.changeTransferType}>
                                        <option value='ptc' >{t('ExchangeBalanceOption')}</option>
                                        <option value='psc' >{t('ServiceBalanceOption')}</option>
                                    </select>
                                </div>
                                <div className='col-4 col-form-label'>
                                    <span>{(destination === 'psc' ? account.ptcBalance : account.pscBalance)/1e8}</span> PRIX
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('To')}</label>
                        <div className='col-9'>
                            <input type='text'
                                   className='form-control'
                                   value={destination === 'psc' ? t('ServiceBalanceOption') : t('ExchangeBalanceOption')}
                                   readOnly/>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('Amount')}</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' onChange={this.onTransferAmount} className='form-control'/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                            </div>
                        </div>
                    </div>
                    <GasRange onChange={this.onGasPriceChanged} value={gasPrice/1e9} />
                    <div className='form-group row'>
                        <div className='col-12'>
                            <ConfirmPopupSwal
                                beforeAsking={this.checkUserInput}
                                done={this.transferTokens}
                                title={t('TransferBtn')}
                                text={<span>
                                        {destination === 'ptc' ? t('TransferSwalTextFromPscToPtc') : t('TransferSwalTextFromPtcToPsc')}
                                        <br />{t('TransferSwalTextPart2')}
                                        <br /><br />{t('TransferSwalTextPart3')}
                                      </span>}
                                class={'btn btn-default btn-block btn-custom waves-effect waves-light'}
                                swalType='warning'
                                swalConfirmBtnText={t('TransferConfirmBtn')}
                                swalTitle={t('TransferSwalTitle')} />
                        </div>
                    </div>
                </div>
            </div>

            <Transactions accountId={account.id} network={network} />
        </div>;
    }
}

export default ws<IProps>(AccountView);
