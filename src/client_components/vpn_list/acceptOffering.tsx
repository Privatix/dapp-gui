import * as React from 'react';
import Select from 'react-select';
import * as api from '../../utils/api';
import {fetch} from '../../utils/fetch';
import notice from '../../utils/notice';
import { withRouter } from 'react-router-dom';
import GasRange from '../../components/utils/gasRange';
import {LocalSettings} from '../../typings/settings';
import toFixed8 from '../../utils/toFixed8';
import { translate } from 'react-i18next';

@translate(['client/acceptOffering', 'utils/gasRange', 'utils/notice'])

class AcceptOffering extends React.Component<any, any>{

    constructor(props:any){
        super(props);

        const { t } = props;

        const acceptOfferingBtnBl = <div className='form-group row'>
            <div className='col-md-12'>
                <button type='submit'
                        onClick={this.onSubmit.bind(this)}
                        className='btn btn-default btn-lg btn-custom btn-block waves-effect waves-light'
                >
                    {t('Accept')}
                </button>
            </div>
        </div>;

        this.state = {
            accounts: [],
            gasPrice: 6*1e9,
            deposit: props.offering.unitPrice * props.offering.minUnits,
            customDeposit: props.offering.unitPrice * props.offering.minUnits,
            acceptOfferingBtnBl: acceptOfferingBtnBl
        };
    }

    async componentDidMount(){

        const accounts = await api.accounts.getAccounts();
        const account = accounts.find((account: any) => account.isDefault);
        this.getNotTerminatedConnections();
        this.setState({accounts, account});
    }

    async getNotTerminatedConnections() {
        const pendingChannelsReq = fetch('/client/channels?serviceStatus=pending', {});
        const activeChannelsReq = fetch('/client/channels?serviceStatus=active', {});
        const suspendedChannelsReq = fetch('/client/channels?serviceStatus=suspended', {});

        const [pendingChannels, activeChannels, suspendedChannels] = await Promise.all([pendingChannelsReq, activeChannelsReq, suspendedChannelsReq]);

        if((activeChannels as any).length > 0
            || (suspendedChannels as any).length > 0
            || (pendingChannels as any).length > 0) {
            const { t } = this.props;

            this.setState({
                acceptOfferingBtnBl: <div className='form-group row'>
                    <div className='col-md-12'>
                        <div className='text-danger'>{t('CanHaveOneVPNConnection')}</div>
                    </div>
                </div>
            });
        }
    }

    onAccountChanged(selectedAccount: any) {
        const account = this.state.accounts.find((account: any) => account.id === selectedAccount.value);
        this.setState({account});
    }

    onGasPriceChanged(evt:any){
        this.setState({gasPrice: Math.floor(evt.target.value * 1e9)});
    }

    changeDepositHandler(evt:any) {
        let customDeposit = evt.target.value * 1e8;
        this.setState({customDeposit});
    }

    async onSubmit(evt: any){
        evt.preventDefault();
        let err = false;
        let msg = '';
        const settings = (await api.settings.getLocal()) as LocalSettings;
        const { t } = this.props;

        if(this.state.customDeposit < this.state.deposit) {
            err=true;
            msg += ' ' + t('DepositMustBeMoreThan') + ' ' + toFixed8({number: (this.state.deposit / 1e8)}) + ' PRIX.';
        }

        if(this.props.offering.maxUnit && parseFloat(this.props.offering.maxUnit) > 0) {
            const topDepositLimit = this.props.offering.maxUnit * this.props.offering.unitPrice;
            if (this.state.customDeposit > topDepositLimit) {
                err = true;
                msg += ' ' + t('DepositMustBeLessOrEqualThan') + ' ' + toFixed8({number: (topDepositLimit / 1e8)}) + ' PRIX.';
            }
        }


        if(this.state.account.psc_balance < this.state.deposit){
            err=true;
            msg += ' ' + t('NotEnoughPrixForDeposit');
        }

        if(this.state.account.ethBalance < settings.gas.acceptOffering*this.state.gasPrice){
            err=true;
            msg += ' ' + t('NotEnoughToPublishTransaction');
        }

        if(err){
            notice({level: 'error', title: t('utils/notice:Attention!'), msg});
            return;
        }

        api.offerings.changeClientOfferingsStatus(this.props.offering.id, 'accept', this.state.account.id, this.state.gasPrice, this.state.customDeposit)
            .then((res) =>{
                notice({level: 'info', title: t('utils/noticeCongratulations!'), msg: t('OfferingAccepted')});
                document.body.classList.remove('modal-open');
                this.props.history.push('/client-dashboard-connecting');
            });
    }


    render(){
        const {t} = this.props;
        const offering = this.props.offering;

        const selectAccount =  <Select className='form-control'
            value={this.state.account ? this.state.account.id : ''}
            searchable={false}
            clearable={false}
            options={this.state.accounts.map((account:any) => ({value: account.id, label: account.name}))}
            onChange={this.onAccountChanged.bind(this)} />;

        return <div className='col-lg-12 col-md-12'>
            <div className='card m-b-20'>
                <h5 className='card-header'>{t('VPNInfo')}</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>{t('Country')}</label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={offering.country} readOnly/>
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
                                <input type='text' className='form-control' value={toFixed8({number: (offering.unitPrice / 1e8)})} readOnly/>
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
                                <input type='text' className='form-control' value={offering.maxInactiveTimeSec} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>{t('sec')}</span>
                            </div>
                            <span className='help-block'>
                                <small>{t('MaxTimeWithoutServiceSmallText')}</small>
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
                                    {t('Balance')} <span>{this.state.account ? toFixed8({number: (this.state.account.psc_balance / 1e8)}) : 0} PRIX / {this.state.account ? toFixed8({number: (this.state.account.ethBalance / 1e18)}) : 0} ETH</span>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>{t('Deposit')}</label>
                                <div className='col-6'>
                                    <div className='input-group bootstrap-touchspin'>
                                        <input id='offeringDeposit' type='number' className='form-control' min='0' step='0.01'
                                               value={toFixed8({number: (this.state.customDeposit / 1e8)})}
                                               onChange={this.changeDepositHandler.bind(this)}/>
                                        <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                                    </div>
                                    <span className='help-block'>
                                        <small>{t('UnusedPrixWillBeReturnedSmallText')}</small>
                                    </span>
                                </div>
                            </div>
                            <GasRange onChange={this.onGasPriceChanged.bind(this)} value={Math.floor(this.state.gasPrice/1e9)}
                                      extLinkText='Information about Gas price' averageTimeText={t('utils/gasRange:AverageAcceptanceTimeText')} />
                            <div className='form-group row'>
                                <div className='col-2 col-form-label font-18'><strong>{t('AcceptancePrice')}</strong></div>
                                <div className='col-6 col-form-label font-18'>
                                    <strong>{toFixed8({number: (this.state.customDeposit / 1e8)})} PRIX</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {this.state.acceptOfferingBtnBl}
                </div>
            }
        </div>;
    }
}

export default withRouter(AcceptOffering);
