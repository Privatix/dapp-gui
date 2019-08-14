import * as React from 'react';
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { withRouter } from 'react-router-dom';

import Select from 'react-select';

import notice from 'utils/notice';
import prix from 'utils/prix';
import eth from 'utils/eth';

import GasRange from 'common/etc/gasRange';

import countryByIso from 'utils/countryByIso';
import { ipTypesAssoc } from 'utils/ipTypes';

import { State } from 'typings/state';
import { Offering } from 'typings/offerings';
import { Account } from 'typings/accounts';
import { LocalSettings } from 'typings/settings';
import { WS } from 'utils/ws';

interface IProps{
    ws?: WS;
    t?: any;
    localSettings?: LocalSettings;
    accounts?: Account[];
    history?: any;
    offering: Offering;
    mode?: string;
    serviceName?: string;
}

interface IState{
    deposit: number;
    customDeposit: number;
    gasPrice: number;
    account: Account;
    thereAreActiveChannels: boolean;
}

@translate(['client/acceptOffering', 'offerings/createOffering', 'utils/gasRange', 'utils/notice', 'common'])
class AcceptOffering extends React.Component<IProps, IState>{

    acceptBtn = null;

    constructor(props:IProps){
        super(props);

        const { offering, accounts } = props;

        this.acceptBtn = React.createRef();

        this.state = {
            deposit: offering.unitPrice * offering.minUnits,
            customDeposit: offering.unitPrice * offering.minUnits,
            gasPrice: 1,
            account: accounts.find((account: Account) => account.isDefault),
            thereAreActiveChannels: false
        };
    }

    async componentDidMount(){

        const { ws } = this.props;

        try {
            const gasPrice = await ws.suggestGasPrice();
            this.setState({gasPrice});
        }catch(e){
            // DO NOTHING
        }

        this.getNotTerminatedConnections();
    }

    async getNotTerminatedConnections() {

        const { ws } = this.props;

        const activeChannels = await ws.getNotTerminatedClientChannels();
        this.setState({thereAreActiveChannels: activeChannels.length > 0});

    }

    onAccountChanged = (selectedAccount: any) => {

        const { accounts } = this.props;

        const account = accounts.find((account: Account) => account.id === selectedAccount.value);
        this.setState({account});
    }

    onGasPriceChanged = (evt:any) => {
        this.setState({gasPrice: Math.floor(evt.target.value * 1e9)});
    }

    changeDepositHandler = (evt:any) => {
        let customDeposit = evt.target.value * 1e8;
        this.setState({customDeposit});
    }

    onSubmit = async (evt: any) => {

        evt.preventDefault();

        this.acceptBtn.current.setAttribute('disabled', 'disabled');
        let err = false;
        let msg = '';

        const { t, ws, localSettings, offering } = this.props;
        const { deposit, customDeposit, account, gasPrice } = this.state;

        if(customDeposit < deposit) {
            err=true;
            msg += ' ' + t('DepositMustBeMoreThan') + ' ' + prix(deposit) + ' PRIX.';
        }

        if(offering.maxUnit && offering.maxUnit > 0) {
            const topDepositLimit = offering.maxUnit * offering.unitPrice;
            if (customDeposit > topDepositLimit) {
                err = true;
                msg += ' ' + t('DepositMustBeLessOrEqualThan') + ' ' + prix(topDepositLimit) + ' PRIX.';
            }
        }

        if(account.pscBalance < customDeposit){
            err=true;
            msg += ' ' + t('NotEnoughPrixForDeposit');
        }

        if(account.ethBalance < localSettings.gas.acceptOffering*gasPrice){
            err=true;
            msg += ' ' + t('NotEnoughToPublishTransaction');
        }

        if(err){
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
            this.acceptBtn.current.removeAttribute('disabled');
            return;
        }

        try {
            const acceptRes = await ws.acceptOffering(account.ethAddr, offering.id, customDeposit, gasPrice);
            if (typeof acceptRes === 'string') {
                notice({level: 'info', header: t('utils/notice:Congratulations!'), msg: t('OfferingAccepted')});
                this.acceptBtn.current.removeAttribute('disabled');
                document.body.classList.remove('modal-open');
                this.props.history.push('/client-dashboard-connecting');
            }
        } catch (e) {
            msg = t('ErrorAcceptingOffering');
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
            this.acceptBtn.current.removeAttribute('disabled');
        }

    }


    render(){

        const { t, offering, accounts, serviceName } = this.props;
        const { account, customDeposit, thereAreActiveChannels } = this.state;

        const acceptOfferingBtnBl = thereAreActiveChannels
            ? <div className='form-group row'>
                  <div className='col-md-12'>
                      <div className='text-danger'>
                          <Trans i18nKey='CanHaveOneServiceConnection' values={{serviceName}} >
                              Note. You can have only one {{serviceName}} connection. To accept another, terminate the current connection.
                          </Trans>
                      </div>
                  </div>
              </div>
            : <div className='form-group row'>
                <div className='col-md-12'>
                    <button type='submit'
                            onClick={this.onSubmit}
                            ref={this.acceptBtn}
                            className='btn btn-default btn-lg btn-custom btn-block waves-effect waves-light'
                    >
                        {t('Accept')}
                    </button>
                </div>
            </div>;

        const selectAccount =  <Select className='form-control'
            value={account ? account.id : ''}
            searchable={false}
            clearable={false}
            options={accounts.map((account:Account) => ({value: account.id, label: account.name}))}
            onChange={this.onAccountChanged} />;

        return <div className='col-lg-12 col-md-12'>
            <div className='card m-b-20'>
                <h5 className='card-header'>
                    <Trans i18nKey='ServiceInfo' values={{serviceName}} >
                        {{serviceName}} info
                    </Trans>
                </h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('Country')}</label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={countryByIso(offering.country)} readOnly/>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('common:IPType')}</label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={ipTypesAssoc[offering.ipType]} readOnly/>
                        </div>
                    </div>
                </div>
            </div>

            <div className='card m-b-20'>
                <h5 className='card-header'>{t('BillingInfo')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('PricePerMB')}</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={prix(offering.unitPrice)} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='card m-b-20'>
                <h5 className='card-header'>{t('ConnectionInfo')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('MaxInactiveTime')}</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={Math.ceil(offering.maxInactiveTimeSec / 60)} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>{t('min')}</span>
                            </div>
                            <span className='help-block'>
                                <small>{t('MaxTimeWithoutServiceSmallText')}</small>
                            </span>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('offerings/createOffering:MinUnits')}:</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={Math.ceil(offering.minUnits)} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>{offering.unitName}</span>
                            </div>
                            <span className='help-block'>
                                <small>{t('MinUnitsText')}</small>
                            </span>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('offerings/createOffering:MaxUnits')}:</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={Math.ceil(offering.maxUnit) === 0 ? t('unlimited') : Math.ceil(offering.maxUnit) } readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>{offering.unitName}</span>
                            </div>
                            <span className='help-block'>
                                <small>{t('MaxUnitsText')}</small>
                            </span>
                        </div>
                    </div>
                    {/*
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>Automatically connect to VPN:</label>
                        <div className='col-9'>
                            <label className='switch'>
                                <input type='checkbox' id='autoConnect' />
                                    <span className='slider round'></span>
                            </label>
                        </div>
                    </div>
                   */}
                </div>
            </div>
            {this.props.mode === 'view'
                ? ''
                : <div>
                    <div className='card m-b-20'>
                        <h5 className='card-header'>{t('PayInfo')}</h5>
                        <div className='card-body'>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>{t('Account')}</label>
                                <div className='col-6'>
                                    {selectAccount}
                                </div>
                                <div className='col-4 col-form-label'>
                                    {t('Balance')} <span>{account ? prix(account.pscBalance) : 0} PRIX / {account ? eth(account.ethBalance) : 0} ETH</span>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>{t('Deposit')}</label>
                                <div className='col-6'>
                                    <div className='input-group bootstrap-touchspin'>
                                        <input id='offeringDeposit' type='number' className='form-control' min='0' step='0.01'
                                               value={prix(customDeposit)}
                                               onChange={this.changeDepositHandler}/>
                                        <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                                    </div>
                                    <span className='help-block'>
                                        <small>
                                            <Trans i18nKey='UnusedPrixWillBeReturnedSmallText' values={{serviceName}} >
                                                After the end of using, the unused PRIX will be returned.
                                            </Trans>
                                        </small>
                                    </span>
                                </div>
                            </div>
                            <GasRange onChange={this.onGasPriceChanged} value={Math.floor(this.state.gasPrice/1e9)}
                                      extLinkText='Information about Gas price' averageTimeText={t('utils/gasRange:AverageAcceptanceTimeText')} />
                            <div className='form-group row'>
                                <div className='col-2 col-form-label font-18'><strong>{t('AcceptancePrice')}</strong></div>
                                <div className='col-6 col-form-label font-18'>
                                    <strong>{prix(customDeposit)} PRIX</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {acceptOfferingBtnBl}
                </div>
            }
        </div>;
    }
}

export default connect( (state: State, ownProps: IProps) => {
    return Object.assign({}, {
    ws: state.ws
   ,localSettings: state.localSettings
   ,accounts: state.accounts
   ,serviceName: state.serviceName
}, ownProps);} )(withRouter(AcceptOffering));
