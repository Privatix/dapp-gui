import * as React from 'react';
import Transactions from '../transactions/transactionsList';
import * as api from '../../utils/api';
import notice from '../../utils/notice';
import ConfirmPopupSwal from '../confirmPopupSwal';
import GasRange from '../utils/gasRange';

class AccountView extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {gasPrice: 6*1e9
                     ,amount: 0
                     ,destination: 'psc'
                     ,address: `0x${Buffer.from(props.account.ethAddr, 'base64').toString('hex')}`
                     ,account: props.account
                     ,transactions: []
                     ,network: ''
        };
    }

    onGasPriceChanged(evt: any){
        this.setState({gasPrice: Math.floor(evt.target.value*1e9)}); // Gwei = 1e9 wei
    }

    onTransferAmount(evt: any){
        console.log('onChange', evt, evt.target.value);
        let amount = parseFloat(evt.target.value);
        if(amount !== amount){
            amount = 0;
        }
        amount = Math.floor(amount * 1e8);
        console.log(amount);
        this.setState({amount});
    }

    async checkUserInput(){

        let err = false;
        let msg = '';
        const settings = await api.getLocalSettings();

        if(this.state.amount <= 0){
            err = true;
            msg += 'Amount must be more then zero.';
        }

        if(this.state.destination === 'psc' && this.state.account.ptcBalance < this.state.amount){
            err = true;
            msg += ' Not enough funds on Exchange balance.';
        }

        if(this.state.destination === 'ptc' && this.state.account.psc_balance < this.state.amount){
            err = true;
            msg += ' Not enough funds on Service balance.';
        }

        if(settings.gas.transfer*this.state.gasPrice > this.state.account.ethBalance) {
            err = true;
            msg += ' Not enough funds to publish transaction.';
        }

        if(err){
            notice({level: 'error', header: 'Attention!', msg});
            return false;
        }else{
            return true;
        }
    }

    onTransferComplete(){
        notice({level: 'info', header: 'Attention!', msg: 'The data was successfully transmitted. Once the transaction will in the blockchain, you will see it in the list below.'});
        this.startRefreshing();
    }

    async refreshTransactions(){
        const transactions = await api.getTransactionsByAccount(this.state.account.id);
        console.log('TRANSACTIONS UPDATE!!!', transactions);
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

        return <div className='col-lg-9 col-md-8'>
            <div className='card m-b-20'>
                <h5 className='card-header'>General Info</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>Name:</label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={this.state.account.name} readOnly/>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>Address:</label>
                        <div className='col-9'>
                            <input type='text' className='form-control' value={this.state.address} readOnly/>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card m-b-20'>
                <h5 className='card-header'>Balance Info</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>Exchange balance:</label>
                        <div className='col-9'>
                            <div className='input-group bootstrap-touchspin'>
                                <input type='text' className='form-control' value={this.state.account.ptcBalance/1e8} readOnly/>
                                <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                            </div>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>Service balance:</label>
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
                <h5 className='card-header'>Transfer</h5>
                <div className='card-body'>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>From:</label>
                        <div className='col-9'>
                            <div className='row'>
                                <div className='col-8'>
                                    <select className='form-control'
                                            value={this.state.destination === 'psc' ? 'ptc' : 'psc'}
                                            onChange={this.changeTransferType.bind(this)}>
                                        <option value='ptc' >Exchange balance</option>
                                        <option value='psc' >Service balance</option>
                                    </select>
                                </div>
                                <div className='col-4 col-form-label'>
                                    <span>{(this.state.destination === 'psc' ? this.state.account.ptcBalance : this.state.account.psc_balance)/1e8}</span> PRIX
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>To:</label>
                        <div className='col-9'>
                            <input type='text'
                                   className='form-control'
                                   value={this.state.destination === 'psc' ? 'Service balance' : 'Exchange balance'}
                                   readOnly/>
                        </div>
                    </div>
                    <div className='form-group row'>
                        <label className='col-3 col-form-label'>Amount:</label>
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
                                title={'Transfer'}
                                text={<span>This action will transfer your tokens from {this.state.destination === 'ptc' ? 'Service' :'Exchange' } balance to {this.state.destination === 'psc' ? 'Service' :'Exchange' } balance.<br />
                                    This operation takes time and gas.<br /><br />You can monitor transaction status in the Transaction log.</span>}
                                class={'btn btn-default btn-block btn-custom waves-effect waves-light'}
                                swalType='warning'
                                swalConfirmBtnText='Yes, transfer!'
                                swalTitle='Are you sure?' />
                        </div>
                    </div>
                </div>
            </div>
            <div className='card m-t-30'>
                <h5 className='card-header'>Transaction Log</h5>
                <div className='card-body'>
                    <Transactions transactions={this.state.transactions} network={this.state.network} />
                </div>
            </div>
        </div>;
    }
}

export default AccountView;
