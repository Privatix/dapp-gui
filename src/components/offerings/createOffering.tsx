import * as React from 'react';
import Select from 'react-select';
import {fetch} from '../../utils/fetch';
import * as api from '../../utils/api';
import GasRange from '../utils/gasRange';
import { withRouter } from 'react-router';
import notice from '../../utils/notice';
import toFixed8 from '../../utils/toFixed8';
import {LocalSettings} from '../../typings/settings';
import countries from '../../utils/countries';

(String as any).prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

class CreateOffering extends React.Component<any, any>{

    static defaultState = {
        payload: {
            serviceName: ''
           ,description: ''
           ,country: ''
           ,supply: ''
           ,unitName: 'MB'
           ,unitType: 'units'
           ,unitPrice: ''
           ,billingType: 'prepaid'
           ,maxBillingUnitLag: ''
           ,minUnits: ''
           ,maxUnit: ''
           ,maxSuspendTime: ''
           ,maxInactiveTimeSec: ''
           ,template: ''
           ,deposit: 0
           ,product: ''
        },
        products: [], accounts: [], templates: [], template: null, gasPrice: 6*1e9
    };

    getDefaultState(){
        const state = Object.assign({}, CreateOffering.defaultState);
        if(this.props.product){
            state.payload.product = this.props.product;
        }
        return state;
    }

    constructor(props: any){
        super(props);
        this.state = this.getDefaultState();
    }

    async refresh(){

        const accounts = await api.getAccounts();
        const products = await api.getProducts();
        // TODO check products length
        const account = accounts.find((account: any) => account.isDefault);
        const payload = Object.assign({}, this.state.payload, {product: this.props.product ? this.props.product : products[0].id, agent: account.id});
        this.setState({products, accounts, account, payload});
        fetch(`/templates?id=${products[0].offerTplID}`)
            .then((templates: any) => {
                const payload = Object.assign({}, this.state.payload, {template: products[0].offerTplID});

                const template = templates[0];
                template.raw = JSON.parse(atob(template.raw));
                this.setState({payload, template});
            });
    }

    onGasPriceChanged(evt:any){
        this.setState({gasPrice: Math.floor(evt.target.value * 1e9)});
    }

    onProductChanged(product: any){
        if(product){
            const payload = Object.assign({}, this.state.payload, {product: product.value});
            this.setState({payload});
        }
    }

    onAccountChanged(selectedAccount: any) {

        const account = this.state.accounts.find((account: any) => account.id === selectedAccount.value);
        const payload = Object.assign({}, this.state.payload, {agent: selectedAccount.value});
        this.setState({account, payload});

    }

    onCountryChanged(selectedCountry: any) {

        const payload = Object.assign({}, this.state.payload, {country: selectedCountry.value});
        this.setState({payload});

    }

    onUserInput(evt: any){

        const payload = Object.assign({}, this.state.payload, {[evt.target.dataset.payloadValue]: evt.target.value});
        payload.deposit = (payload.supply ? 0 + payload.supply : 0) * (payload.unitPrice ? Math.floor((0 + payload.unitPrice)*1e8) : 0) * (payload.minUnits ? payload.minUnits : 0);
        this.setState({payload});
    }

    async onSubmit(evt:any){
        this.setState({errMsg: ''});
        evt.preventDefault();
        const aliases = {
            serviceName: 'name'
           ,description: 'description'
           ,country: 'country'
           ,supply : 'supply'
           ,unitPrice: 'unit price'
           ,maxBillingUnitLag: 'maximum billing unit lag'
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

        const settings = (await fetch('/localSettings', {})) as LocalSettings;

        let err = false;
        const payload = Object.assign({}, this.state.payload);

        const mustBeFilled = required.filter((key: string) => !(key in payload));

        integers.filter((key:string) => !mustBeFilled.includes(key) ).forEach((key: string) => {
            if(optional.includes(key)){
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
            err = true;
        }

        const wrongKeys = [...mustBeInteger, ...mustBeFilled, ...mustBePositive, ...isZero];
        if(!wrongKeys.includes('maxUnit') && !wrongKeys.includes('minUnits')){
            if (payload.maxUnit !== '') {
                if (payload.maxUnit < payload.minUnits) {
                    err = true;
                }
            }
        }
        if(payload.deposit !== payload.deposit || payload.deposit > this.state.account.psc_balance){
            err = true;
        }

        if(this.state.account.ethBalance < settings.gas.createOffering*this.state.gasPrice){
            err=true;
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
            if(this.state.account.ethBalance < settings.gas.createOffering*this.state.gasPrice){
                msg += ' Not enough funds for publish transaction. Please, select another account.';
            }
            if(!wrongKeys.includes('maxUnit') && !wrongKeys.includes('minUnits')){
                if(payload.maxUnit < payload.minUnit){
                    msg += 'Maximum units must be equal or greater then minimum units. ';
                }
            }
            this.setState({errMsg: msg});
            notice({level: 'error', header: 'Attention!', msg});
        }else{
            payload.unitPrice = Math.floor(payload.unitPrice * 1e8);
            payload.billingInterval = 1;
            payload.billingType = 'postpaid';
            payload.additionalParams = Buffer.from('{}').toString('base64');

            if (payload.maxUnit === '') {
                delete payload.maxUnit;
            }else{
                payload.maxUnit = parseInt(payload.maxUnit, 10);
            }

            fetch('/offerings/', {method: 'post', body: payload}).then(res => {
                fetch(`/offerings/${(res as any).id}/status`, {method: 'put', body: {action: 'publish', gasPrice: this.state.gasPrice}}).then(res => {
                    this.setState(this.getDefaultState());

                    if(typeof this.props.closeModal === 'function'){
                        this.props.closeModal();
                    }
                    if(typeof this.props.done === 'function'){
                       this.props.done();
                    }

                });
            });
        }

        return;

    }

    componentDidMount(){
        this.refresh();
    }

    render(){
        const selectProduct = <Select className='form-control'
            value={this.state.payload.product}
            searchable={false}
            clearable={false}
            options={this.state.products.map((product: any) => ({value: product.id, label: product.name})) }
            onChange={this.onProductChanged.bind(this)} />;

        const selectAccount =  <Select className='form-control'
            value={this.state.payload.agent}
            searchable={false}
            clearable={false}
            options={this.state.accounts.map((account:any) => ({value: account.id, label: account.name}))}
            onChange={this.onAccountChanged.bind(this)} />;
            // {this.state.accounts.map((account:any) => <option key={account.id} value={account.id}>{account.name}</option>) }
        const selectCountry = <Select className='form-control'
            value={this.state.payload.country}
            searchable={false}
            clearable={false}
            options={countries.map((country:any) => ({value: country.id, label: country.name}))}
            onChange={this.onCountryChanged.bind(this)} />;

        const title = this.state.template ? this.state.template.raw.schema.properties.serviceName.title : '';
        const ethBalance = this.state.account ? (toFixed8({number: (this.state.account.ethBalance / 1e18)})) : 0;
        const pscBalance = this.state.account ? (toFixed8({number: (this.state.account.psc_balance / 1e8)})) : 0;

        const onUserInput = this.onUserInput.bind(this);

        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12'>
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
                                        <input type='text'
                                               className='form-control'
                                               onChange={onUserInput}
                                               data-payload-value='serviceName'
                                               value={this.state.payload.serviceName}
                                               placeholder={title}
                                        />
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Description: </label>
                                    <div className='col-6'>
                                        <input type='text'
                                               className='form-control'
                                               onChange={onUserInput}
                                               data-payload-value='description'
                                               value={this.state.payload.description}
                                               placeholder={'description'}
                                        />
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Country: </label>
                                    <div className='col-6'>
                                        {selectCountry}
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Supply: </label>
                                    <div className='col-6'>
                                        <input type='text'
                                               className='form-control autonumber'
                                               onChange={onUserInput}
                                               data-payload-value='supply'
                                               value={this.state.payload.supply}
                                               placeholder='i.e. 3'
                                               data-v-max='999'
                                               data-v-min='0'
                                        />
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
                                            <option value='Mb'>MB</option>
                                        </select>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Price per MB:</label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text'
                                                   className='form-control'
                                                   placeholder='i.e. 0.001'
                                                   onChange={onUserInput}
                                                   data-payload-value='unitPrice'
                                                   value={this.state.payload.unitPrice}
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>Max billing unit lag:</label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text'
                                                   className='form-control'
                                                   placeholder='i.e. 3'
                                                   onChange={onUserInput}
                                                   data-payload-value='maxBillingUnitLag'
                                                   value={this.state.payload.maxBillingUnitLag}
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>MB</span>
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
                                            <input type='text'
                                                   className='form-control'
                                                   placeholder='i.e. 100'
                                                   onChange={onUserInput}
                                                   data-payload-value='minUnits'
                                                   value={this.state.payload.minUnits}
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>MB</span>
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
                                            <input type='text'
                                                   className='form-control'
                                                   onChange={onUserInput}
                                                   data-payload-value='maxUnit'
                                                   value={this.state.payload.maxUnit}
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>MB</span>
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
                                            <input type='text'
                                                   className='form-control'
                                                   placeholder='i.e. 1800'
                                                   onChange={onUserInput}
                                                   data-payload-value='maxSuspendTime'
                                                   value={this.state.payload.maxSuspendTime}
                                            />
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
                                            <input type='text'
                                                   className='form-control'
                                                   placeholder='i.e. 1800'
                                                   onChange={onUserInput}
                                                   data-payload-value='maxInactiveTimeSec'
                                                   value={this.state.payload.maxInactiveTimeSec}
                                            />
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
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text'
                                                   className='form-control'
                                                   value={toFixed8({number: (this.state.payload.deposit / 1e8)})}
                                                   placeholder='PRIX'
                                                   readOnly
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                                        </div>
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
                        </div>
                </div>
            </div>
        </div>;
    }
}

export default withRouter(CreateOffering);
