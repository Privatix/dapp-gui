import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import Select from 'react-select';

import ConfirmPopupSwal from 'common/confirmPopupSwal';
import GasRange from 'common/etc/gasRange';

import * as api from 'utils/api';
import notice from 'utils/notice';
import toFixedN from 'utils/toFixedN';

import {State} from 'typings/state';

@translate(['client/connections/increaseDepositView', 'utils/notice'])
class IncreaseDepositView extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        console.log(props);
        this.state = {
            gasPrice: 6*1e9,
            account: props.accounts.find(account => `0x${account.ethAddr.toLowerCase()}` === props.channel.client.toLowerCase()),
        };
        props.ws.getOffering(props.channel.offering)
            .then(offering => {
                this.setState({offering});
            });

        this.depositChanged = this.depositChanged.bind(this);
    }

    onGasPriceChanged(evt: any){
        this.setState({gasPrice: Math.floor(evt.target.value*1e9)}); // Gwei = 1e9 wei
    }

    async checkUserInput(){

        const { t } = this.props;

        let err = false;
        let msg = '';
        const settings = await api.settings.getLocal();

        if(settings.gas.increaseDeposit*this.state.gasPrice > this.state.account.ethBalance) {
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

    onConfirm = async () => {

        const { ws, t, closeModal } = this.props;

        try {
            await ws.topUp(this.props.channel.id, this.state.gasPrice);
            notice({level: 'info', header: t('utils/notice:Attention!'), msg: t('SuccessMessage')});
            closeModal();
        } catch ( e ) {
            notice({level: 'error', header: t('utils/notice:Attention!'), msg: t('SomethingWentWrong')});
        }
    }

    depositChanged(evt: any) {
        this.setState({
            deposit: evt.target.value
        });
    }

    render(){

        const { t } = this.props;
        let value = '';
        if(this.state.offering){
            const trafic = toFixedN({number: this.props.channel.deposit/this.state.offering.unitPrice, fixed: 2});
            value = `${trafic} ${this.state.offering.unitName}`;
        }

        // TODO ek: mb it should be 'addToDeposit' instead of 'deposit'
        this.setState({
            deposit: `${toFixedN({number: (this.props.channel.deposit/1e8), fixed: 8})} / ${value}`
        });

        const selectAccount =  <Select className='form-control'
                                       value={this.state.account.id}
                                       searchable={false}
                                       clearable={false}
                                       disabled={true}
                                       options={this.props.accounts.map((account:any) => ({value: account.id, label: account.name}))}
        />;

        const ethBalance = this.state.account ? (toFixedN({number: (this.state.account.ethBalance / 1e18), fixed: 8})) : 0;
        const pscBalance = this.state.account ? (toFixedN({number: (this.state.account.pscBalance / 1e8), fixed: 8})) : 0;

        let deposit = this.state.deposit;

        return <div className='col-lg-9 col-md-9'>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('DepositInfo')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-2 col-form-label'>{t('Deposit')}:</label>
                        <div className='col-6'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={ deposit } readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('IncreaseDeposit')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-2 col-form-label'>{t('Account')}:</label>
                        <div className='col-6'>
                            {selectAccount}
                        </div>
                        <div className='col-4 col-form-label'>
                            Balance: <span>{ pscBalance } PRIX / { ethBalance } ETH</span>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-2 col-form-label'>{t('AddToDeposit')}</label>
                        <div className='col-6'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' onChange={this.depositChanged} value={ deposit } />
                                <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                            </div>
                        </div>
                    </div>
                    <GasRange onChange={this.onGasPriceChanged.bind(this)} value={this.state.gasPrice/1e9} averageTimeText={t('AverageTimeToAddTheDeposit')} />
                    <div className='form-group row'>
                        <div className='col-12'>
                            <ConfirmPopupSwal
                                beforeAsking={this.checkUserInput.bind(this)}
                                done={this.onConfirm}
                                title={t('IncreaseBtn')}
                                text={<div>{t('client/increaseDepositButton:ThisOperationWillIncrease')}<br />{t('WouldYouLikeToProceed')}</div>}
                                class={'btn btn-default btn-block btn-custom waves-effect waves-light'}
                                swalType='warning'
                                swalConfirmBtnText={t('IncreaseConfirmBtn')}
                                swalTitle={t('IncreaseSwalTitle')} />
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect( (state: State) => ({ws: state.ws, accounts: state.accounts}) )(IncreaseDepositView);
