import * as React from 'react';
import Select from 'react-select';
import { withRouter } from 'react-router';
import { translate } from 'react-i18next';

import {fetch} from '../../utils/fetch';
import * as api from '../../utils/api';
import GasRange from '../utils/gasRange';
import notice from '../../utils/notice';
import toFixed8 from '../../utils/toFixed8';
import parseFloatPrix from '../../utils/parseFloatPrix';
import {LocalSettings} from '../../typings/settings';
import countries from '../../utils/countries';

(String as any).prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

@translate(['offerings/createOffering', 'common', 'utils/notice'])
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
        console.log(props);
    }

    async refresh(){

        const accounts = await api.accounts.getAccounts();
        const products = await api.products.getProducts();
        // TODO check products length
        const account = accounts.find((account: any) => account.isDefault);
        const payload = Object.assign({}, this.state.payload, {product: this.props.product ? this.props.product : products[0].id, agent: account.id});
        this.setState({products, accounts, account, payload});
        fetch(`/templates?id=${products[0].offerTplID}`)
            .then((templates: any) => {
                const payload = Object.assign({}, this.state.payload, {template: products[0].offerTplID});

                const template = templates[0];
                // template.raw = JSON.parse(atob(template.raw));
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
        payload.deposit = (payload.supply ? 0 + payload.supply : 0) * (payload.unitPrice ? parseFloatPrix(payload.unitPrice) : 0) * (payload.minUnits ? payload.minUnits : 0);
        this.setState({payload});
    }

    async onSubmit(evt:any){

        this.setState({errMsg: ''});
        evt.preventDefault();

        const { t } = this.props;

        const aliases = {
            serviceName: t('Name')
           ,description: t('description')
           ,country: t('Country')
           ,supply : t('Supply')
           ,unitPrice: t('PricePerMB')
           ,maxBillingUnitLag: t('MaxBillingUnitLag')
           ,minUnits: t('MinUnits')
           ,maxUnit: t('MaxUnits')
           ,maxSuspendTime: t('MaxSuspendTime')
           ,maxInactiveTimeSec: t('MaxInactiveTime')
        };
        const required = ['serviceName', 'country', 'supply', 'unitPrice', 'maxBillingUnitLag', 'minUnits', 'maxSuspendTime', 'maxInactiveTimeSec'];
        const optional = ['description', 'maxUnit'];
        const integers = ['supply', 'maxBillingUnitLag', 'minUnits', 'maxUnit', 'maxSuspendTime', 'maxInactiveTimeSec'];
        const strings = ['serviceName', 'description', 'country'];
        const cantBeZero = ['supply', 'maxBillingUnitLag', 'minUnits', 'maxSuspendTime', 'maxInactiveTimeSec'];
        const mustBePositive = [];
        const mustBeInteger = [];
        const isZero = [];

        // const settings = (await fetch('/localSettings', {})) as LocalSettings;
        const settings = (await api.settings.getLocal()) as LocalSettings;

        let err = false;
        const payload = Object.assign({}, this.state.payload);

        const mustBeFilled = required.filter((key: string) => !(key in payload) || payload[key] === '');

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

        payload.unitPrice = parseFloatPrix(payload.unitPrice);

        const emptyStrings = strings.filter((key: string) => required.includes(key) && payload[key].trim() === '');

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
                const Field = t('Field', {context: mustBeFilled.length > 1 ? 'plural' : ''});
                const Fields = mustBeFilled.map(key => aliases[key]).join(', ');
                const isRequired = t('isRequired', {context: mustBeFilled.length > 1 ? 'plural' : ''});
                msg += (`${Field} ${Fields} ${isRequired} ` as any).capitalize();
            }
            if(mustBeInteger.length){
                const Field = t('Field', {context: mustBeInteger.length > 1 ? 'plural' : ''});
                const Fields = mustBeInteger.map(key => aliases[key]).join(', ');
                const mustBe = t('MustBeInteger', {context: mustBeInteger.length > 1 ? 'plural' : ''});
                msg += (`${Field} ${Fields} ${mustBe} ` as any).capitalize();
            }
            if(isZero.length){
                const Field = t('Field', {context: isZero.length > 1 ? 'plural' : ''});
                const Fields = isZero.map(key => aliases[key]).join(', ');
                const haveZero = t('haveZeroValue', {context: isZero.length > 1 ? 'plural' : ''});
                msg += (`${Field} ${Fields} ${haveZero} ` as any).capitalize();
            }
            if(mustBePositive.length){
                const Field = t('Field', {context: mustBePositive.length > 1 ? 'plural' : ''});
                const Fields = mustBePositive.map(key => aliases[key]).join(', ');
                const haveNegative = t('haveNegativeValue', {context: mustBePositive.length > 1 ? 'plural' : ''});
                msg += (`${Field} ${Fields} ${haveNegative} ` as any).capitalize();
            }
            if(emptyStrings.length){
                const Field = t('Field', {context: emptyStrings.length > 1 ? 'plural' : ''});
                const Fields = emptyStrings.map(key => aliases[key]).join(', ');
                const cantBeEmpty = t('cantBeEmpty', {context: emptyStrings.length > 1 ? 'plural' : ''});
                msg += (`${Field} ${Fields} ${cantBeEmpty} ` as any).capitalize();
            }
            if(!wrongKeys.includes('unitPrice') && payload.unitPrice !== payload.unitPrice){
                msg += t('UnitPriceMustBeANumber') + ' ';
            }
            if(payload.unitPrice <= 0){
                msg += t('UnitPriceMustBeMoreThen0') + ' ';
            }
            if(payload.deposit === payload.deposit && payload.deposit > this.state.account.psc_balance){
                msg += t('DepositIsGreaterThenServiceBalance') + ' ';
            }
            if(this.state.account.ethBalance < settings.gas.createOffering*this.state.gasPrice){
                msg += t('NotEnoughFunds') + ' ';
            }
            if(!wrongKeys.includes('maxUnit') && !wrongKeys.includes('minUnits')){
                if(payload.maxUnit < payload.minUnit){
                    msg += t('MaximumUnitsMustBeEqual') + ' ';
                }
            }
            this.setState({errMsg: msg});
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
        }else{
            payload.billingInterval = 1;
            payload.billingType = 'postpaid';
            payload.additionalParams = '{}';

            if (payload.maxUnit === '') {
                delete payload.maxUnit;
            }else{
                payload.maxUnit = parseInt(payload.maxUnit, 10);
            }

            api.offerings.addOffering(payload).then(res => {
                api.offerings.changeOfferingStatus((res as any).id, 'publish', this.state.gasPrice).then(res => {
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

        const { t } = this.props;

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
            onChange={this.onCountryChanged.bind(this)}
            placeholder={t('common:Select')}
        />;

        // const title = this.state.template ? this.state.template.raw.schema.properties.serviceName.title : '';
        const ethBalance = this.state.account ? (toFixed8({number: (this.state.account.ethBalance / 1e18)})) : 0;
        const pscBalance = this.state.account ? (toFixed8({number: (this.state.account.psc_balance / 1e8)})) : 0;

        const onUserInput = this.onUserInput.bind(this);

        return <div className='container-fluid'>
            <div className='row'>
                <div className='col-sm-12'>
                        <div className='card m-b-20 card-body'>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>{t('Server')}:</label>
                                <div className='col-6'>
                                    {selectProduct}
                                </div>
                            </div>
                        </div>
                        <div className='card m-b-20'>
                            <h5 className='card-header'>{t('GeneralInfo')}</h5>
                            <div className='card-body'>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('Name')}:<span className='text-danger'>*</span> </label>
                                    <div className='col-6'>
                                        <input type='text'
                                               className='form-control'
                                               onChange={onUserInput}
                                               data-payload-value='serviceName'
                                               value={this.state.payload.serviceName}
                                               placeholder={t('serviceNameTitle')}
                                        />
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('Description')}: </label>
                                    <div className='col-6'>
                                        <input type='text'
                                               className='form-control'
                                               onChange={onUserInput}
                                               data-payload-value='description'
                                               value={this.state.payload.description}
                                               placeholder={t('description')}
                                        />
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('Country')}:<span className='text-danger'>*</span> </label>
                                    <div className='col-6'>
                                        {selectCountry}
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('Supply')}:<span className='text-danger'>*</span> </label>
                                    <div className='col-6'>
                                        <input type='text'
                                               className='form-control autonumber'
                                               onChange={onUserInput}
                                               data-payload-value='supply'
                                               value={this.state.payload.supply}
                                               placeholder={t('ie') + ' 3'}
                                               data-v-max='999'
                                               data-v-min='0'
                                        />
                                        <span className='help-block'>
                                            <small>
                                                {t('MaximumSupplyOfServices') + ' '}
                                                {t('ItRepresentsTheMaximum')}
                                            </small>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='card m-b-20'>
                            <h5 className='card-header'>{t('BillingInfo')}</h5>
                            <div className='card-body'>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('UnitType')}:</label>
                                    <div className='col-6'>
                                        <select className='form-control' disabled>
                                            <option value='Mb'>MB</option>
                                        </select>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('PricePerMB')}:<span className='text-danger'>*</span></label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text'
                                                   className='form-control'
                                                   placeholder={t('ie') + ' 0.001'}
                                                   onChange={onUserInput}
                                                   data-payload-value='unitPrice'
                                                   value={this.state.payload.unitPrice}
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>PRIX</span>
                                        </div>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('MaxBillingUnitLag')}:<span className='text-danger'>*</span></label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text'
                                                   className='form-control'
                                                   placeholder={t('ie') + ' 3'}
                                                   onChange={onUserInput}
                                                   data-payload-value='maxBillingUnitLag'
                                                   value={this.state.payload.maxBillingUnitLag}
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>MB</span>
                                        </div>
                                        <span className='help-block'>
                                            <small>{t('MaximumPaymentLagInUnits')}</small>
                                        </span>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('MinUnits')}:<span className='text-danger'>*</span></label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text'
                                                   className='form-control'
                                                   placeholder={t('ie') + ' 100'}
                                                   onChange={onUserInput}
                                                   data-payload-value='minUnits'
                                                   value={this.state.payload.minUnits}
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>MB</span>
                                        </div>
                                        <span className='help-block'>
                                            <small>{t('UsedToCalculateMinimumDeposit')}</small>
                                        </span>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('MaxUnits')}:</label>
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
                                            <small>{t('UsedToSpecifyMaximumUnits')}</small>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='card m-b-20'>
                            <h5 className='card-header'>{t('ConnectionInfo')}</h5>
                            <div className='card-body'>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('MaxSuspendTime')}:<span className='text-danger'>*</span></label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text'
                                                   className='form-control'
                                                   placeholder={t('ie') + ' 1800'}
                                                   onChange={onUserInput}
                                                   data-payload-value='maxSuspendTime'
                                                   value={this.state.payload.maxSuspendTime}
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>{t('sec')}</span>
                                        </div>
                                        <span className='help-block'>
                                            <small>
                                                {t('MaximumTimeServiceCan') + ' '}
                                                {t('AfterThisTimePeriodService') + ' '}
                                                {t('PeriodIsSpecifiedInSeconds') + ' '}
                                            </small>
                                        </span>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('MaxInactiveTime')}:<span className='text-danger'>*</span></label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text'
                                                   className='form-control'
                                                   placeholder={t('ie') + ' 1800'}
                                                   onChange={onUserInput}
                                                   data-payload-value='maxInactiveTimeSec'
                                                   value={this.state.payload.maxInactiveTimeSec}
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>{t('sec')}</span>
                                        </div>
                                        <span className='help-block'>
                                            <small>
                                                {t('MaximumTimeWithoutServiceUsage') + ' '}
                                                {t('AgentWillConsider') + ' '}
                                                {t('PeriodIsSpecified') + ' '}
                                            </small>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='card m-b-20'>
                            <h5 className='card-header'>{t('PublicationPrice')}:</h5>
                            <div className='card-body'>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('Account')}:</label>
                                    <div className='col-6'>
                                        {selectAccount}
                                    </div>
                                    <div className='col-4 col-form-label'>
                                        Service Balance: <span id='accountBalance'>{ pscBalance } PRIX / { ethBalance } ETH</span>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('Deposit')}:</label>
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
                                            <small>
                                                {t('ThisDepositWillBeLocked')}
                                                {t('ToReturnDeposit')}
                                            </small>
                                        </span>
                                    </div>
                                </div>
                                <GasRange onChange={this.onGasPriceChanged.bind(this)} value={Math.floor(this.state.gasPrice/1e9)} />
                            </div>
                        </div>
                        <div className='form-group row'>
                            <div className='col-md-8'>
                                <button type='submit'
                                        onClick={this.onSubmit.bind(this)}
                                        className='btn btn-default btn-custom btn-block waves-effect waves-light'
                                >
                                {t('CreateAndPublish')}
                                </button>
                            </div>
                        </div>
                </div>
            </div>
        </div>;
    }
}

export default withRouter(CreateOffering);
