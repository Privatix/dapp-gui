import * as React from 'react';
import {fetch} from '../../utils/fetch';
import GasRange from '../utils/gasRange';
// import notice from '../../utils/notice';
import { withRouter } from 'react-router';

(String as any).prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

class CreateOffering extends React.Component<any, any>{

    constructor(props: any){
        super(props);

        const payload = {
            unitName: 'Mb'
           ,unitType: 'units'
           ,billingType: 'prepaid'
           ,template: ''
           ,deposit: 0
        };

        if(props.product){
            (payload as any).product = props.product;
        }

        this.state = {payload, products: [], accounts: [], templates: [], template: null, gasPrice: 6*1e9};

        Promise.all([fetch('/products'), fetch('/accounts/')])
            .then((res: any) => {
                // TODO check products length
                let products, accounts;
                [products, accounts] = res;
                const account = accounts.find((account: any) => account.isDefault);
                console.log('Accounts retrieved!!!', accounts, account);
                const payload = Object.assign({}, this.state.payload, {product: props.product ? props.product : products[0].id, agent: account.id});
                this.setState({products, accounts, account, payload});
                fetch(`/templates?id=${products[0].offerTplID}`)
                    .then((templates: any) => {

                        const payload = Object.assign({}, this.state.payload, {template: products[0].offerTplID});

                        console.log(products, accounts, templates);
                        const template = templates[0];
                        template.raw = JSON.parse(atob(template.raw));
                        this.setState({payload, template});
                        console.log(products, template, 'accounts', accounts);
                    });
            });
    }

    onGasPriceChanged(evt:any){
        this.setState({gasPrice: Math.floor(evt.target.value * 1e9)});
    }

    onAccountChanged(evt: any) {
        console.log('ACCOUNT CHANGED!!!', evt.target);
        const selectAccount = evt.target; // document.getElementById('selectAccount');
        const accountId = (selectAccount as any).options[(selectAccount as any).selectedIndex].value;
        const account = this.state.accounts.find((account: any) => account.id === accountId);
        const payload = Object.assign({}, this.state.payload, {agent: accountId});
        console.log(accountId, account, payload);
        this.setState({account, payload});
        /*
        fetch(`/accounts?id=${accountId}`, {method: 'get'})
            .then((account: any) => {
                ethBalance = account[0].ethBalance;
                prixBalance = account[0].ptcBalance;
                document.getElementById('accountBalance').innerHTML = `${(account[0].ptcBalance/1e8).toFixed(3)} PRIX / ${(account[0].ethBalance/1e18).toFixed(3)} ETH`;
            });
           */

    }

    onUserInput(evt: any){

        const payload = Object.assign({}, this.state.payload, {[evt.target.dataset.payloadValue]: evt.target.value});
        payload.deposit = (payload.supply ? 0 + payload.supply : 0) * (payload.unitPrice ? Math.floor((0 + payload.unitPrice)*1e8) : 0) * (payload.minUnits ? payload.minUnits : 0);
        this.setState({payload});
        console.log(payload);
    }

    onSubmit(evt:any){
        this.setState({errMsg: ''});
        evt.preventDefault();
        console.log(this.state);
        const aliases = {
            serviceName: 'name'
           ,description: 'description'
           ,country: 'country'
           ,supply : 'supply'
           ,unitPrice: 'unit price'
           ,maxBillingUnitLag: 'maximum payment lag'
           ,minUnits: 'minimum units'
           ,maxUnit: 'maximum units'
           ,maxSuspendTime: 'max suspend time'
           ,maxInactiveTimeSec: 'max inactive time'
        };
        const required = ['serviceName', 'description', 'country', 'supply', 'unitPrice', 'maxBillingUnitLag', 'minUnits', 'maxSuspendTime', 'maxInactiveTimeSec'];
        const optional = ['maxUnit'];
        const integers = ['supply', 'maxBillingUnitLag', 'minUnits', 'maxUnit', 'maxSuspendTime', 'maxInactiveTimeSec'];
        const strings = ['serviceName', 'description', 'country'];
        const cantBeZero = ['supply', 'maxBillingUnitLag', 'minUnits', 'maxSuspendTime', 'maxInactiveTimeSec'];
        const mustBePositive = [];
        const mustBeInteger = [];
        const isZero = [];

        let err = false;
        const payload = Object.assign({}, this.state.payload);

        const mustBeFilled = required.filter((key: string) => !(key in payload));
        

        console.log('mustBeFilled', mustBeFilled);

        integers.filter((key:string) => !mustBeFilled.includes(key) ).forEach((key: string) => {
            if(optional.includes(key) && !(key in payload)){
                return;
            }
            const res = parseInt(payload[key], 10);
            if(res !== res){
                mustBeInteger.push(key);
                err = true;
            }
            if(res < 0){
                mustBePositive.push(key);
                err = true;
            }
            if(cantBeZero.includes(key) && res === 0){
                isZero.push(key);
                err = true;
            }

            payload[key] = res;
            
        });

        payload.unitPrice = parseFloat(payload.unitPrice);

        const emptyStrings = strings.filter((key: string) => !mustBeFilled.includes(key) && payload[key].trim() === '');

        if(mustBeFilled.length || emptyStrings.length || payload.unitPrice !== payload.unitPrice || payload.unitPrice <= 0){
            console.log('first err');
            err = true;
        }

        const wrongKeys = [...mustBeInteger, ...mustBeFilled, ...mustBePositive, ...isZero];
        if(!wrongKeys.includes('maxUnit') && !wrongKeys.includes('minUnits')){
            if(payload.maxUnit < payload.minUnits){
                console.log('second err');
                err = true;
            }
        }
        if(payload.deposit !== payload.deposit || payload.deposit > this.state.account.psc_balance){
            console.log('3 err');
            err = true;
        }

        if(err){
            let msg = '';
            if(mustBeFilled.length){
                msg += (`${mustBeFilled.map(key => aliases[key]).join(', ')} ${mustBeFilled.length > 1 ? 'are' : 'is'} required. ` as any).capitalize();
            }
            if(mustBeInteger.length){
                msg += (`${mustBeInteger.map(key => aliases[key]).join(', ')} must be integer${mustBeInteger.length > 1 ? 's' : ''}. ` as any).capitalize();
            }
            if(isZero.length){
                msg += (`${cantBeZero.map(key => aliases[key]).join(', ')} have zero value. ` as any).capitalize();
            }
            if(mustBePositive.length){
                msg += (`${mustBePositive.map(key => aliases[key]).join(', ')} have negative value. ` as any).capitalize();
            }
            if(emptyStrings.length){
                msg += (`${emptyStrings.map(key => aliases[key]).join(', ')} can't be emty. ` as any).capitalize();
            }
            if(!wrongKeys.includes('unitPrice') && payload.unitPrice !== payload.unitPrice){
                msg += 'Unit price must be a number.';
            }
            if(payload.unitPrice <= 0){
                msg += 'Unit price must be more then 0.';
            } 
            if(payload.deposit === payload.deposit && payload.deposit > this.state.account.psc_balance){
                msg += 'Deposit is greater then service balance. Please choose another account or top up the balance. ';
            }
            if(!wrongKeys.includes('maxUnit') && !wrongKeys.includes('minUnits')){
                if(payload.maxUnit < payload.minUnit){
                    msg += 'Maximum units must be equal or greater then minimum units. ';
                }
            }
            this.setState({errMsg: msg});
        }else{
            payload.unitPrice = Math.floor(payload.unitPrice * 1e8);
            payload.billingInterval = 1;
            payload.additionalParams = Buffer.from('{}').toString('base64');
            console.log('FETCH!!!');
            fetch('/offerings/', {method: 'post', body: payload}).then(res => {
                console.log('offering created', res);
                fetch(`/offerings/${(res as any).id}/status`, {method: 'put', body: {action: 'publish', gasPrice: this.state.gasPrice}}).then(res => {
                    console.log('offering published', res);
                    if(typeof this.props.done === 'function'){
                       this.props.done();
                    }
                    this.props.history.push('/offerings/all');
                });
            });
        }
        
        console.log(payload);
        return;
        /*
        const payload = {} as any;
        const selectProduct = document.getElementById('selectProduct');
        payload.product = (selectProduct as any).options[(selectProduct as any).selectedIndex].value;
        payload.serviceName = (document.getElementById('offeringName') as any).value;
        payload.description = (document.getElementById('offeringDescription') as any).value;
        payload.country = (document.getElementById('offeringCountry') as any).value;
        payload.supply = parseInt((document.getElementById('offeringSupply') as any).value, 10);


        payload.setupPrice = 0;
        payload.freeUnits = 0;
        payload.template = this.state.payload.template;

        payload.unitPrice = Math.floor(1e8 * (document.getElementById('offeringPricePerUnit') as any).value);
        payload.maxBillingUnitLag = parseInt((document.getElementById('offeringMaxBillingLag') as any).value, 10);
        payload.minUnits = parseInt((document.getElementById('offeringMinUnits') as any).value, 10);
        payload.deposit = payload.unitPrice * payload.minUnits;
        payload.maxUnit = parseInt((document.getElementById('offeringMaxUnits') as any).value, 10);
        if(payload.maxUnit && payload.maxUnit < payload.minUnits){
            console.log('maxUnits must be more or equal minUnits');
            return;
        }
        payload.maxSuspendTime = parseInt((document.getElementById('offeringMaxSuspendTime') as any).value, 10);
        payload.maxInactiveTimeSec = parseInt((document.getElementById('offeringMaxInactiveTime') as any).value, 10);

        const selectAccount = document.getElementById('selectAccount');
        if(this.state.account.ethBalance === 0 || this.state.account.ptcBalance === 0){
            console.log('select account with non zero balance');
            return;
        }
        payload.agent = (selectAccount as any).options[(selectAccount as any).selectedIndex].value;
        payload.gasPrice = this.state.payload.gasPrice;

        console.log('creating offering', payload);
        fetch('/offerings/', {method: 'post', body: payload}).then(res => {
            console.log('offering created', res);
            fetch(`/offerings/${(res as any).id}/status`, {method: 'put', body: {action: 'publish', gasPrice: payload.gasPrice}}).then(res => {
                console.log('offering published', res);
               if(typeof this.props.done === 'function'){
                   this.props.done();
               }
            // props.history.push('/offerings/all');
            });
        });
       */
    }

    render(){



        const selectProduct = <select className='form-control' id='selectProduct'>
            {this.state.products.map((product:any) => <option selected={this.state.payload.product && this.state.payload.product === product.id ? true : false } key={product.id} value={product.id}>{product.name}</option>) }
        </select>;
/*
        let selectAccount;
        if((accounts as any).length){
            // ethBalance = accounts[0].ethBalance;
            // prixBalance = accounts[0].ptcBalance;
            
        }else{
            selectAccount = [];
        }
*/
        const selectAccount =  <select className='form-control' onChange={this.onAccountChanged.bind(this)}>
            {this.state.accounts.map((account:any) => <option key={account.id} value={account.id}>{account.name}</option>) }
        </select>;

        const title = this.state.template ? this.state.template.raw.schema.properties.serviceName.title : '';
        const countryComment = this.state.template ? this.state.template.raw.uiSchema.country['ui:help'] : '';
        const ethBalance = this.state.account ? (this.state.account.ethBalance/1e18).toFixed(3) : 0;
        const pscBalance = this.state.account ? (this.state.account.psc_balance/1e8).toFixed(3) : 0;

        const onUserInput = this.onUserInput.bind(this);

        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12'>
                    <form action='' id='addOffering'>
                        <div className='card m-b-20 card-body'>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Server:</label>
                                <div className='col-6'>
                                    {selectProduct}
                                </div>
                            </div>
                        </div>
                        <div className='card m-b-20'>
                            <h5 className='card-header'>General info</h5>
                            <div className='card-body'>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Name: </label>
                                    <div className='col-6'>
                                        <input type='text' className='form-control' onChange={onUserInput} data-payload-value='serviceName' placeholder={title}  />
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Description: </label>
                                    <div className='col-6'>
                                        <input type='text' className='form-control' onChange={onUserInput} data-payload-value='description' placeholder={'description'} />
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Country: </label>
                                    <div className='col-6'>
                                        <input type='text' className='form-control' onChange={onUserInput} data-payload-value='country' placeholder={countryComment} />
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Supply: </label>
                                    <div className='col-6'>
                                        <input type='text' className='form-control autonumber' onChange={onUserInput} data-payload-value='supply' placeholder='3' data-v-max='999' data-v-min='0' />
                                        <span className='help-block'>
                                            <small>
                                                Maximum supply of services according to service offerings.
                                                It represents the maximum number of clients that can consume this service offering concurrently.
                                            </small>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='card m-b-20'>
                            <h5 className='card-header'>Billing info</h5>
                            <div className='card-body'>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Unit type:</label>
                                    <div className='col-6'>
                                        <select className='form-control' disabled>
                                            <option value='Mb'>Mb</option>
                                        </select>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Price per Mb:</label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text' className='form-control' placeholder='0.03' onChange={onUserInput} data-payload-value='unitPrice' />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Max billing unit lag:</label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text' className='form-control' placeholder='3' onChange={onUserInput} data-payload-value='maxBillingUnitLag' />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>Mb</span>
                                        </div>
                                        <span className='help-block'>
                                            <small>Maximum payment lag in units after which Agent will suspend service usage.</small>
                                        </span>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Min units:</label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text' className='form-control' placeholder='100'  onChange={onUserInput} data-payload-value='minUnits' />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>Mb</span>
                                        </div>
                                        <span className='help-block'>
                                            <small>Used to calculate minimum deposit required.</small>
                                        </span>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Max units:</label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text' className='form-control' onChange={onUserInput} data-payload-value='maxUnit' />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>Mb</span>
                                        </div>
                                        <span className='help-block'>
                                            <small>Used to specify maximum units of service that will be supplied. Can be empty.</small>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='card m-b-20'>
                            <h5 className='card-header'>Connection info</h5>
                            <div className='card-body'>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Max suspend time:</label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text' className='form-control' placeholder='1800' onChange={onUserInput} data-payload-value='maxSuspendTime' />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>sec</span>
                                        </div>
                                        <span className='help-block'>
                                            <small>Maximum time service can be in Suspended status due to payment log.
                                                After this time period service will be terminated, if no sufficient payment was received.
                                                Period is specified in seconds.</small>
                                        </span>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Max inactive time:</label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text' className='form-control' placeholder='60' onChange={onUserInput} data-payload-value='maxInactiveTimeSec' />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>sec</span>
                                        </div>
                                        <span className='help-block'>
                                            <small>Maximum time without service usage.
                                                Agent will consider that Client will not use service and stop providing it.
                                                Period is specified in seconds.</small>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='card m-b-20'>
                            <h5 className='card-header'>Publication price:</h5>
                            <div className='card-body'>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Account:</label>
                                    <div className='col-6'>
                                        {selectAccount}
                                    </div>
                                    <div className='col-4 col-form-label'>
                                        Service Balance: <span id='accountBalance'>{ pscBalance } PRIX / { ethBalance } ETH</span>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Deposit:</label>
                                    <div className='col-6'>
                                        <input type='text' className='form-control' value={(this.state.payload.deposit/1e8).toFixed(4)} placeholder='PRIX' readOnly/>
                                        <span className='help-block'>
                                            <small>This deposit will be locked while offering is active.
                                                To return deposit close your offering</small>
                                        </span>
                                    </div>
                                </div>
                                <GasRange onChange={this.onGasPriceChanged.bind(this)} value={Math.floor(this.state.gasPrice/1e9)} />
                            </div>
                        </div>
                        <div className='form-group row'>
                            <div className='col-md-8'>
                                <button type='submit' onClick={this.onSubmit.bind(this)} className='btn btn-default btn-custom btn-block waves-effect waves-light'>Create and Publish</button>
                            </div>
                            <hr />
                            <div>{this.state.errMsg}</div>
                        </div>
                    </form>
                </div>
            </div>
        </div>;
    }
}

export default withRouter(CreateOffering);
