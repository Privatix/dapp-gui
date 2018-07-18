import * as React from 'react';
import Select from 'react-select';
import * as api from '../../utils/api';
import {fetch} from '../../utils/fetch';
import notice from '../../utils/notice';
import { withRouter } from 'react-router-dom';
import GasRange from '../../components/utils/gasRange';
import {LocalSettings} from '../../typings/settings';
import toFixed8 from '../../utils/toFixed8';

class AcceptOffering extends React.Component<any, any>{

    constructor(props:any){
        super(props);

        const acceptOfferingBtnBl = <div className='form-group row'>
            <div className='col-md-12'>
                <button type='submit'
                        onClick={this.onSubmit.bind(this)}
                        className='btn btn-default btn-lg btn-custom btn-block waves-effect waves-light'
                >
                    Accept
                </button>
            </div>
        </div>;

        this.state = {
            accounts: [],
            gasPrice: 6*1e9,
            deposit: (props.offering.unitPrice*props.offering.minUnits),
            acceptOfferingBtnBl: acceptOfferingBtnBl
        };
    }

    async componentDidMount(){

        const accounts = await api.getAccounts();
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
            this.setState({
                acceptOfferingBtnBl: <div className='form-group row'>
                    <div className='col-md-12'>
                        <div className='text-danger'>Note. You can have only one VPN connection. To accept another, terminate the current connection.</div>
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

    async onSubmit(evt: any){
        evt.preventDefault();
        let err = false;
        let msg = '';
        const settings = (await api.settings.getLocal()) as LocalSettings;

        if(this.state.account.psc_balance < this.state.deposit){
            err=true;
            msg += ' Not enough PRIXes for deposit. Please, select another account.';
        }

        if(this.state.account.ethBalance < settings.gas.acceptOffering*this.state.gasPrice){
            err=true;
            msg += ' Not enough funds for publish transaction. Please, select another account.';
        }

        if(err){
            notice({level: 'error', title: 'Attention!', msg});
            return;
        }

        fetch(`/client/offerings/${this.props.offering.id}/status`, {method: 'put', body: {action: 'accept', account: this.state.account.id, gasPrice: this.state.gasPrice}})
            .then((res) =>{
                notice({level: 'info', title: 'Congratulations!', msg: 'offering accepted!'});
                this.props.history.push('/client-dashboard-connecting');
            });
    }


    render(){

        const offering = this.props.offering;

        const selectAccount =  <Select className='form-control'
            value={this.state.account ? this.state.account.id : ''}
            searchable={false}
            clearable={false}
            options={this.state.accounts.map((account:any) => ({value: account.id, label: account.name}))}
            onChange={this.onAccountChanged.bind(this)} />;

        return <div className='col-lg-12 col-md-12'>
            <div className='card m-b-20'>
                <h5 className='card-header'>VPN Info</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>Country: </label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={offering.country} readOnly/>
                        </div>
                    </div>
                </div>
            </div>

            <div className='card m-b-20'>
                <h5 className='card-header'>Billing Info</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>Price per MB:</label>
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
                <h5 className='card-header'>Connection Info</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>Max inactive time:</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={offering.maxInactiveTimeSec} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>sec</span>
                            </div>
                            <span className='help-block'>
                                <small>Maximum time without service usage.
                                    Agent will consider that Client will not use service and stop providing it.
                                    Period is specified in seconds.</small>
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
                        <h5 className='card-header'>Pay Info:</h5>
                        <div className='card-body'>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Account:</label>
                                <div className='col-6'>
                                    {selectAccount}
                                </div>
                                <div className='col-4 col-form-label'>
                                    Balance: <span>{this.state.account ? toFixed8({number: (this.state.account.psc_balance / 1e8)}) : 0} PRIX / {this.state.account ? toFixed8({number: (this.state.account.ethBalance / 1e18)}) : 0} ETH</span>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Deposit:</label>
                                <div className='col-6'>
                                    <div className='input-group bootstrap-touchspin'>
                                        <input id='offeringDeposit' type='text' className='form-control' value={toFixed8({number: (this.state.deposit / 1e8)})} readOnly/>
                                        <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                                    </div>
                                    <span className='help-block'>
                                        <small>After the end of using, the unused PRIX will be returned.</small>
                                    </span>
                                </div>
                            </div>
                            <GasRange onChange={this.onGasPriceChanged.bind(this)} value={Math.floor(this.state.gasPrice/1e9)}
                                      extLinkText='Information about Gas price' averageTimeText={'acceptance'} />
                            <div className='form-group row'>
                                <div className='col-2 col-form-label font-18'><strong>Acceptance Price:</strong></div>
                                <div className='col-6 col-form-label font-18'>
                                    <strong>{toFixed8({number: (this.state.deposit / 1e8)})} PRIX</strong>
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
