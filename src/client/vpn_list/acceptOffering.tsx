import * as React from 'react';
import { translate } from 'react-i18next';
import { withRouter } from 'react-router-dom';

import Select from 'react-select';
import * as api from 'utils/api';
import notice from 'utils/notice';
import GasRange from 'common/etc/gasRange';
import toFixedN from 'utils/toFixedN';
import countryByIso from 'utils/countryByIso';

import {LocalSettings} from 'typings/settings';
import {Offering} from 'typings/offerings';
import { WS, ws } from 'utils/ws';

interface IProps{
    ws?: WS;
    t?: any;
    history?: any;
    offering: Offering;
    mode?: string;
}

@translate(['client/acceptOffering', 'utils/gasRange', 'utils/notice'])
class AcceptOffering extends React.Component<IProps, any>{

    acceptBtn = null;

    constructor(props:IProps){
        super(props);

        const { t } = props;

        this.acceptBtn = React.createRef();
        const acceptOfferingBtnBl = <div className='form-group row'>
            <div className='col-md-12'>
                <button type='submit'
                        onClick={this.onSubmit.bind(this)}
                        ref={this.acceptBtn}
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
        const accounts = await (window as any).ws.getAccounts();
        const account = accounts.find((account: any) => account.isDefault);
        this.getNotTerminatedConnections();
        this.setState({accounts, account});
    }

    async getNotTerminatedConnections() {

        const { t, ws } = this.props;

        const activeChannels = await ws.getNotTerminatedClientChannels();

        if(activeChannels.length > 0){
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
        this.acceptBtn.current.setAttribute('disabled', 'disabled');
        let err = false;
        let msg = '';
        const settings = (await api.settings.getLocal()) as LocalSettings;
        const { t } = this.props;

        if(this.state.customDeposit < this.state.deposit) {
            err=true;
            msg += ' ' + t('DepositMustBeMoreThan') + ' ' + toFixedN({number: (this.state.deposit / 1e8), fixed: 8}) + ' PRIX.';
        }

        if(this.props.offering.maxUnit && this.props.offering.maxUnit > 0) {
            const topDepositLimit = this.props.offering.maxUnit * this.props.offering.unitPrice;
            if (this.state.customDeposit > topDepositLimit) {
                err = true;
                msg += ' ' + t('DepositMustBeLessOrEqualThan') + ' ' + toFixedN({number: (topDepositLimit / 1e8), fixed: 8}) + ' PRIX.';
            }
        }


        if(this.state.account.pscBalance < this.state.deposit){
            err=true;
            msg += ' ' + t('NotEnoughPrixForDeposit');
        }

        if(this.state.account.ethBalance < settings.gas.acceptOffering*this.state.gasPrice){
            err=true;
            msg += ' ' + t('NotEnoughToPublishTransaction');
        }

        if(err){
            notice({level: 'error', title: t('utils/notice:Attention!'), msg});
            this.acceptBtn.current.removeAttribute('disabled');
            return;
        }

        try {
            const acceptRes = await this.props.ws.acceptOffering(this.state.account.ethAddr, this.props.offering.id, this.state.customDeposit, this.state.gasPrice);
            if (typeof acceptRes === 'string') {
                notice({level: 'info', title: t('utils/noticeCongratulations!'), msg: t('OfferingAccepted')});
                this.acceptBtn.current.removeAttribute('disabled');
                document.body.classList.remove('modal-open');
                this.props.history.push('/client-dashboard-connecting');
            }
        } catch (e) {
            msg = t('ErrorAcceptingOffering');
            notice({level: 'error', title: t('utils/notice:Attention!'), msg});
            this.acceptBtn.current.removeAttribute('disabled');
        }


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
                            <input type='text' className='form-control' value={countryByIso(offering.country)} readOnly/>
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
                                <input type='text' className='form-control' value={toFixedN({number: (offering.unitPrice / 1e8), fixed: 8})} readOnly/>
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
                                    {t('Balance')} <span>{this.state.account ? toFixedN({number: (this.state.account.pscBalance / 1e8), fixed: 8}) : 0} PRIX / {this.state.account ? toFixedN({number: (this.state.account.ethBalance / 1e18), fixed: 8}) : 0} ETH</span>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>{t('Deposit')}</label>
                                <div className='col-6'>
                                    <div className='input-group bootstrap-touchspin'>
                                        <input id='offeringDeposit' type='number' className='form-control' min='0' step='0.01'
                                               value={toFixedN({number: (this.state.customDeposit / 1e8), fixed: 8})}
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
                                    <strong>{toFixedN({number: (this.state.customDeposit / 1e8), fixed: 8})} PRIX</strong>
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

// export default connect( (state: State, ownProps: IProps) => Object.assign({}, {ws: state.ws}, ownProps) )(withRouter(AcceptOffering));
export default ws<IProps>(withRouter(AcceptOffering));
