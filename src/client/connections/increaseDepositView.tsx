import * as React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import Select from 'react-select';

import ConfirmPopupSwal from 'common/confirmPopupSwal';
import GasRange from 'common/etc/gasRange';

import notice from 'utils/notice';
import toFixedN from 'utils/toFixedN';

import { asyncProviders } from 'redux/actions';

import { State } from 'typings/state';
import { ClientChannel } from 'typings/channels';

interface IProps {
    ws: State['ws'];
    accounts: State['accounts'];
    localSettings: State['localSettings'];
    channel: ClientChannel;
    gasPrice: number;
    dispatch: any;
    t?: any;
    closeModal?: any;
}

@translate(['client/connections/increaseDepositView', 'utils/notice'])
class IncreaseDepositView extends React.Component<IProps, any> {

    constructor(props: IProps) {

        super(props);
        const { gasPrice, channel, accounts } = props;

        this.state = {
            gasPrice: gasPrice ? gasPrice : 0,
            account: accounts.find(account => `0x${account.ethAddr.toLowerCase()}` === channel.client.toLowerCase()),
            deposit: channel.totalDeposit,
            offering: null,
            channelDeposit: channel.totalDeposit,
            inputStr: ''
        };
    }

    async componentDidMount(){

        const { channel, dispatch } = this.props;

        await this.getOffering(channel.offering );

        dispatch(asyncProviders.updateSettings());
    }

    static getDerivedStateFromProps(props: IProps, state: any) {
        return state.gasPrice === 0 && props.gasPrice ? {gasPrice: props.gasPrice} : null;
    }

    async getOffering(id: string) {

        const { ws } = this.props;

        const offering = await ws.getOffering(id);

        const depositTrafic = toFixedN({number: this.state.deposit/offering.unitPrice, fixed: 2});
        const depositMB = `${depositTrafic} ${offering.unitName}`;
        const inputStr = `${toFixedN({number: (this.state.deposit/1e8), fixed: 8})} / ${depositMB}`;
        this.setState({offering, inputStr});
    }

    onGasPriceChanged = (evt: any) => {
        this.setState({gasPrice: Math.floor(evt.target.value*1e9)}); // Gwei = 1e9 wei
    }

    checkUserInput = async () => {

        const { t, localSettings, channel } = this.props;
        const { account, offering, gasPrice } = this.state;

        let err = false;
        let msg = [];
        const deposit = this.getDeposit();

        if(!account || localSettings.gas.increaseDeposit*gasPrice > account.ethBalance) {
            err = true;
            msg.push(t('ErrorNotEnoughPublishFunds'));
        }

        if(!account || deposit > account.pscBalance){
            err = true;
            msg.push(t('ErrorNotEnoughPRIX'));
        }

        const maxDepositAddValue = offering.maxUnit - channel.totalDeposit / offering.unitPrice;
        const depositInUnits = deposit / offering.unitPrice;
        if (offering.maxUnit && (depositInUnits > maxDepositAddValue)) {
            err = true;
            msg.push(t('ErrorDepositGreaterThanMaxUnits', {units: maxDepositAddValue, unitName: offering.unitName}));
        }

        if(err){
            notice({level: 'error', header: t('utils/notice:Attention!'), msg: msg.join(' ')});
            return false;
        }else{
            return true;
        }
    }

    getDeposit(){
        return Math.floor(parseFloat(this.state.inputStr.split('/')[0].trim()) * 1e8);
    }

    onConfirm = async () => {

        const { ws, t, closeModal, channel } = this.props;
        const { gasPrice } = this.state;

        const deposit = this.getDeposit();

        try {
            await ws.topUp(channel.id, deposit, gasPrice);
            notice({level: 'info', header: t('utils/notice:Attention!'), msg: t('SuccessMessage')});
            closeModal();
        } catch ( e ) {
            notice({level: 'error', header: t('utils/notice:Attention!'), msg: t('SomethingWentWrong')});
        }
    }

    setCursor(cursor: number){
        (this.refs.input as any).selectionStart = cursor;
        (this.refs.input as any).selectionEnd = cursor;
    }

    notValid(chunks: string[]){

        if(chunks.length !== 2){
            return true;
        }

        const unitReplacer = new RegExp(`${this.state.offering.unitName}$`);

        const moreThanOneZero = /^(0{2,}|0[0-9])/;
        if(chunks.some(chunk => moreThanOneZero.test(chunk.replace(unitReplacer, '').trim()))){
            return true;
        }

        const isFloatRegex = /^[0-9]*\.?[0-9]*$/;
        if(!chunks.every(chunk => isFloatRegex.test(chunk.replace(unitReplacer, '').trim()))){
            return true;
        }
    }

    depositChanged = (evt: any) => {

        const { offering, inputStr } = this.state;

        const cursor = evt.target.selectionStart;

        const chunks = evt.target.value.split('/');
        if(this.notValid(chunks)){
            this.setState({inputStr}, () => this.setCursor(cursor));
            return;
        }

        const [depositStr, traficStr ] = chunks;
        const prixStr = inputStr.split('/')[0].trim();

        if(depositStr.trim() === prixStr){
            const MBSTR = traficStr.replace(new RegExp(`${offering.unitName}$`), '').trim();
            const depositStr = MBSTR === '' ? '0' : toFixedN({number: (parseFloat(MBSTR)*offering.unitPrice)/1e8, fixed: 8});
            const inputStr = `${depositStr} / ${MBSTR} ${offering.unitName}`;
            this.setState({inputStr}, () => this.setCursor(cursor + (depositStr.length - prixStr.length)));
        }else{
            const depositTrafic = toFixedN({number: parseFloat(depositStr)*1e8/offering.unitPrice, fixed: 2});
            const depositMB = `${depositTrafic} ${offering.unitName}`;
            this.setState({inputStr: `${depositStr.trim()} / ${depositMB}`}, () => this.setCursor(cursor));
        }
    }

    render(){

        const { t, channel, accounts } = this.props;
        const { account, offering, gasPrice } = this.state;

        let value = '';
        if(offering){
            const trafic = toFixedN({number: channel.totalDeposit/offering.unitPrice, fixed: 2});
            value = `${trafic} ${offering.unitName}`;
        }

        const channelDeposit = `${toFixedN({number: (this.state.channelDeposit/1e8), fixed: 8})} / ${value}`;

        const selectAccount =  <Select className='form-control'
                                       value={account.id}
                                       searchable={false}
                                       clearable={false}
                                       disabled={true}
                                       options={accounts.map((account:any) => ({value: account.id, label: account.name}))}
        />;

        let maxUnitsHint = '';
        if (offering && offering.maxUnit !== null) {
            const maxUnits = offering.maxUnit;
            const maxDepositAddValue = maxUnits - channel.totalDeposit / offering.unitPrice;
            maxUnitsHint = t('MaxUnitsHint', {maxUnits, maxDepositAddValue, unitName: offering.unitName});
        }

        const ethBalance = account ? (toFixedN({number: (account.ethBalance / 1e18), fixed: 8})) : 0;
        const pscBalance = account ? (toFixedN({number: (account.pscBalance / 1e8), fixed: 8})) : 0;

        return <div className='col-lg-9 col-md-9'>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('DepositInfo')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-2 col-form-label'>{t('Deposit')}:</label>
                        <div className='col-6'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={ channelDeposit } readOnly/>
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
                                <input type='text' className='form-control' ref='input' onChange={this.depositChanged} value={ this.state.inputStr } />
                                <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                            </div>
                            <span className='help-block'><small>{maxUnitsHint}</small></span>
                        </div>
                    </div>
                    <GasRange onChange={this.onGasPriceChanged} value={gasPrice/1e9} averageTimeText={t('AverageTimeToAddTheDeposit')} />
                    <div className='form-group row'>
                        <div className='col-12'>
                            <ConfirmPopupSwal
                                beforeAsking={this.checkUserInput}
                                done={this.onConfirm}
                                title={t('IncreaseBtn')}
                                text={<div>{t('client/increaseDepositButton:ThisOperationWillIncrease')}<br />{t('WouldYouLikeToProceed')}</div>}
                                className={'btn btn-default btn-block btn-custom waves-effect waves-light'}
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

export default connect( (state: State) => {
    return {
    ws: state.ws
   ,accounts: state.accounts
   ,gasPrice: parseFloat(state.settings['eth.default.gasprice'])
   ,localSettings: state.localSettings
};} )(IncreaseDepositView);
