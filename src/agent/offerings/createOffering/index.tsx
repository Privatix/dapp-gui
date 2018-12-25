import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { translate, Trans } from 'react-i18next';
import Select from 'react-select';

import * as api from 'utils/api';
import notice from 'utils/notice';
import toFixedN from 'utils/toFixedN';
import parseFloatPrix from 'utils/parseFloatPrix';
import {LocalSettings} from 'typings/settings';
import countries from 'utils/countries';
import GasRange from 'common/etc/gasRange';
import ExternalLink from 'common/etc/externalLink';

import * as ubold from 'css/index.cssx';
// import * as styles from './index.css';

import { WS } from 'utils/ws';

import { State } from 'typings/state';
import { Account } from 'typings/accounts';
import { Product } from 'typings/products';

(String as any).prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};


interface IProps {
    product?: string;
    ws?: WS;
    t?: any;
    done?: Function;
    closeModal?: Function;
    location?: any;
    history?: any;
    accounts?: Account[];
    products?: Product[];
}

@translate(['offerings/createOffering', 'common', 'utils/notice'])
class CreateOffering extends React.Component<IProps, any>{

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
           ,maxBillingUnitLag: 70
           ,minUnits: ''
           ,maxUnit: ''
           ,maxSuspendTime: ''
           ,maxInactiveTimeSec: ''
           ,template: ''
           ,deposit: 0
           ,product: ''
           ,minDownloadMbits: ''
           ,minUploadMbits: ''
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

    constructor(props: IProps){
        super(props);
        this.state = this.getDefaultState();
    }

    componentDidMount(){
        this.refresh();
    }

    static getDerivedStateFromProps(props: IProps, state: any){
        const { accounts } = props;
        const account = accounts.find(state.account
            ? account => account.id === state.account.id
            : account => account.isDefault);

        return {account, accounts};
    }

    async refresh() {
        const { ws, accounts, products } = this.props;

        const account = accounts.find(account => account.isDefault);

        const payload = Object.assign({}, this.state.payload, {product: this.props.product
                                                                      ? this.props.product
                                                                      : products[0].id,
                                                               agent: account.id,
                                                               country: products[0].country ? products[0].country.toUpperCase() : ''
                                                              });
        this.setState({products, accounts, account, payload});
        const templates = await ws.getTemplate(products[0].offerTplID);
        const state = {
            payload: Object.assign({}, this.state.payload, {template: products[0].offerTplID}),
            template: templates[0]
        };
        this.setState(state);
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
        const account = this.state.accounts.find(account => account.id === selectedAccount.value);
        const payload = Object.assign({}, this.state.payload, {agent: selectedAccount.value});
        this.setState({account, payload});
    }

    onUserInput(evt: any){

        const payload = Object.assign({}, this.state.payload, {[evt.target.dataset.payloadValue]: evt.target.value, additionalParams: {}});
        payload.deposit = (payload.supply ? 0 + payload.supply : 0)
                        * (payload.unitPrice ? parseFloatPrix(payload.unitPrice) : 0)
                        * (payload.minUnits ? payload.minUnits : 0)
                        ;
        this.setState({payload});
    }

    async onSubmit(evt:any){

        this.setState({errMsg: ''});
        evt.preventDefault();

        const { t, ws } = this.props;

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
           ,minDownloadMbits: t('MinDownloadMbits')
           ,minUploadMbits: t('MinUploadMbits')
        };
        const required = ['serviceName', 'country', 'supply', 'unitPrice', 'maxBillingUnitLag', 'minUnits', 'maxSuspendTime', 'maxInactiveTimeSec'];
        const optional = ['description', 'maxUnit'];
        const integers = ['supply', 'maxBillingUnitLag', 'minUnits', 'maxUnit', 'maxSuspendTime', 'maxInactiveTimeSec'];
        const strings = ['serviceName', 'description', 'country'];
        const cantBeZero = ['supply', 'maxBillingUnitLag', 'minUnits', 'maxSuspendTime', 'maxInactiveTimeSec'];
        const mustBePositive = [];
        const mustBeInteger = [];
        const mustBeNumber = [];
        const isZero = [];

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

        if('minDownloadMbits' in payload && payload.minDownloadMbits !== ''){
            const value = parseFloat(payload.minDownloadMbits);
            if(isNaN(value)){
                err = true;
                mustBeNumber.push('minDownloadMbits');
            }else{
                if(value <= 0){
                    err = true;
                    mustBePositive.push('minDownloadMbits');
                }
            }
        }

        if('minUploadMbits' in payload  && payload.minUploadMbits !== ''){
            const value = parseFloat(payload.minUploadMbits);
            if(isNaN(value)){
                err = true;
                mustBeNumber.push('minUploadMbits');
            }else{
                if(value <= 0){
                    err = true;
                    mustBePositive.push('minUploadMbits');
                }
            }
        }

        const wrongKeys = [...mustBeInteger, ...mustBeFilled, ...mustBePositive, ...isZero];
        if(!wrongKeys.includes('maxUnit') && !wrongKeys.includes('minUnits')){
            if (payload.maxUnit !== '') {
                if (payload.maxUnit < payload.minUnits) {
                    err = true;
                }
            }
        }
        if(payload.deposit !== payload.deposit || payload.deposit > this.state.account.pscBalance){
            err = true;
        }

        if(this.state.account.ethBalance < settings.gas.createOffering*this.state.gasPrice){
            err=true;
        }

        if (parseFloat(payload.maxSuspendTime) < 10 || parseFloat(payload.maxInactiveTimeSec) < 10){
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
            if(mustBeNumber.length){
                const Field = t('Field', {context: mustBeNumber.length > 1 ? 'plural' : ''});
                const Fields = mustBeNumber.map(key => aliases[key]).join(', ');
                const mustBe = t('MustBeNumber', {context: mustBeNumber.length > 1 ? 'plural' : ''});
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
            if(payload.deposit === payload.deposit && payload.deposit > this.state.account.pscBalance){
                msg += t('DepositIsGreaterThenServiceBalance') + ' ';
            }
            if(this.state.account.ethBalance < settings.gas.createOffering*this.state.gasPrice){
                msg += t('NotEnoughFunds') + ' ';
            }
            if(!wrongKeys.includes('maxUnit') && !wrongKeys.includes('minUnits')){
                if (payload.maxUnit !== '') {
                    if (payload.maxUnit < payload.minUnits) {
                        msg += t('MaximumUnitsMustBeEqual') + ' ';
                    }
                }
            }

            if(wrongKeys.includes('unitPrice') && payload.unitPrice !== payload.unitPrice){
                msg += t('UnitPriceMustBeANumber') + ' ';
            }

            if (parseFloat(payload.maxSuspendTime) < 10) {
                msg += t('MaxSuspendTimeMustBeMoreOrEquals10Min') + ' ';
            }

            if (parseFloat(payload.maxInactiveTimeSec) < 10) {
                msg += t('MaxInactiveTimeSecMustBeMoreOrEquals10Min') + ' ';
            }

            this.setState({errMsg: msg});
            notice({level: 'error', header: t('utils/notice:Attention!'), msg});
        }else{
            payload.billingInterval = 1;
            payload.billingType = 'postpaid';
            payload.additionalParams = {};

            if (payload.maxUnit === '') {
                delete payload.maxUnit;
            }else{
                payload.maxUnit = parseInt(payload.maxUnit, 10);
            }

            // MaxSuspendTime and MaxInactiveTime to seconds
            payload.maxSuspendTime = Math.floor(parseFloat(payload.maxSuspendTime)) * 60;
            payload.maxInactiveTimeSec = Math.floor(parseFloat(payload.maxInactiveTimeSec)) * 60;

            // additional parameters
            if('minDownloadMbits' in payload){
                if(payload.minDownloadMbits !== ''){
                    const value = parseFloat(payload.minDownloadMbits);
                    payload.additionalParams.minDownloadMbits = value;
                }
                delete payload.minDownloadMbits;
            }

            if('minUploadMbits' in payload){
                if(payload.minUploadMbits !== ''){
                    const value = parseFloat(payload.minUploadMbits);
                    payload.additionalParams.minUploadMbits = value;
                }
                delete payload.minUploadMbits;
            }
            // const ws = (window as any).ws;
            const offeringId = await ws.createOffering(payload);
            await ws.changeOfferingStatus(offeringId, 'publish', this.state.gasPrice);
            this.setState(this.getDefaultState());

            if(typeof this.props.closeModal === 'function'){
                this.props.closeModal();
            }
            if(typeof this.props.done === 'function'){
               this.props.done();
            }
        }

        return;

    }

    redirectToServers() {
        if (this.props.location.pathname === '/products') {
            this.props.closeModal();
        } else {
            this.props.history.push('/products');
        }
    }

    render(){
        const { t } = this.props;

        const selectProduct = <Select className='form-control'
            value={this.state.payload.product}
            searchable={false}
            clearable={false}
            options={this.state.products.map(product => ({value: product.id, label: product.name})) }
            onChange={this.onProductChanged.bind(this)} />;

        const selectAccount =  <Select className='form-control'
            value={this.state.payload.agent}
            searchable={false}
            clearable={false}
            options={this.state.accounts.map(account => ({value: account.id, label: account.name}))}
            onChange={this.onAccountChanged.bind(this)} />;
            // {this.state.accounts.map((account:any) => <option key={account.id} value={account.id}>{account.name}</option>) }

        // const title = this.state.template ? this.state.template.raw.schema.properties.serviceName.title : '';
        const ethBalance = this.state.account ? (toFixedN({number: (this.state.account.ethBalance / 1e18), fixed: 8})) : 0;
        const pscBalance = this.state.account ? (toFixedN({number: (this.state.account.pscBalance / 1e8), fixed: 8})) : 0;

        const onUserInput = this.onUserInput.bind(this);

        const country = countries.filter((country:any) => country.id === this.state.payload.country.toUpperCase());
        const countryName = country[0] ? country[0].name : '';
        const countryImg = !this.state.payload.country ? '' :
            <span className='input-group-addon bootstrap-touchspin-prefix'>
                <img src={`images/country/${this.state.payload.country.toLowerCase()}.png`} width='25px'/>
            </span>;

        return <div className='containerFluid'>
            <div className={ubold.row}>
                <div className='col-sm-12'>
                        <div className={ubold.cardCardBodyMB20}>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>{t('Server')}:</label>
                                <div className='col-6'>
                                    {selectProduct}
                                </div>
                            </div>
                        </div>
                        <div className={ubold.cardMB20}>
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
                                    <label className='col-2 col-form-label'>{t('Country')}:</label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            {countryImg}
                                            <input type='text' className='form-control' readOnly value={countryName} />
                                        </div>
                                        <span className='help-block'>
                                            <small>
                                                <Trans i18nKey='ChangeCountryHelpText'>
                                                    For changing country you must go to the
                                                    <button
                                                        className='btn btn-link btnLinkSmallCustom'
                                                        onClick={this.redirectToServers.bind(this)}
                                                    >Servers</button>
                                                    page
                                                </Trans>
                                            </small>
                                        </span>
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
                                            <small>
                                                <strong>{t('Attention') + ' '}</strong>
                                                {t('MaximumPaymentLagInUnits') + ' '}
                                                <Trans i18nKey='MaxBillingUnitLagHelpLink'>
                                                    Do not change, if you do not understand
                                                    <ExternalLink
                                                        className='btn btn-link btnLinkSmallCustom'
                                                        href={'https://privatix.atlassian.net/wiki/spaces/BVP/pages/603848732/Max.+billing+unit+lag'}
                                                    >how to calculate max. billing unit lag</ExternalLink>
                                                </Trans>
                                            </small>
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
                                                   placeholder={t('ie') + ' 150'}
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
                                                   placeholder={t('ie') + ' 10'}
                                                   onChange={onUserInput}
                                                   data-payload-value='maxSuspendTime'
                                                   value={this.state.payload.maxSuspendTime}
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>{t('min')}</span>
                                        </div>
                                        <span className='help-block'>
                                            <small>
                                                {t('MaximumTimeServiceCan') + ' '}
                                                {t('AfterThisTimePeriodService') + ' '}
                                                {t('PeriodIsSpecifiedInMinutes') + ' '}
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
                                                   placeholder={t('ie') + ' 10'}
                                                   onChange={onUserInput}
                                                   data-payload-value='maxInactiveTimeSec'
                                                   value={this.state.payload.maxInactiveTimeSec}
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>{t('min')}</span>
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
                            <h5 className='card-header'>{t('AdditionalParameters')}</h5>
                            <div className='card-body'>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('MinDownloadMbits')}:</label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text'
                                                   className='form-control'
                                                   placeholder={t('ie') + ' 100'}
                                                   onChange={onUserInput}
                                                   data-payload-value='minDownloadMbits'
                                                   value={this.state.payload.minDownloadMbits}
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>{t('Mbits')}</span>
                                        </div>
                                        <span className='help-block'>
                                            <small>
                                            </small>
                                        </span>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('MinUploadMbits')}:</label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text'
                                                   className='form-control'
                                                   placeholder={t('ie') + ' 80'}
                                                   onChange={onUserInput}
                                                   data-payload-value='minUploadMbits'
                                                   value={this.state.payload.minUploadMbits}
                                            />
                                            <span className='input-group-addon bootstrap-touchspin-postfix'>{t('Mbits')}</span>
                                        </div>
                                        <span className='help-block'>
                                            <small>
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
                                        {t('ServiceBalance')}: <span id='accountBalance'>{ pscBalance } PRIX / { ethBalance } ETH</span>
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-2 col-form-label'>{t('Deposit')}:</label>
                                    <div className='col-6'>
                                        <div className='input-group bootstrap-touchspin'>
                                            <input type='text'
                                                   className='form-control'
                                                   value={toFixedN({number: (this.state.payload.deposit / 1e8), fixed: 8})}
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

// export default withRouter(CreateOffering);
export default connect( (state: State, onProps: IProps) => {
    return (Object.assign({}, {ws: state.ws, accounts: state.accounts, products: state.products}, onProps));
} )(withRouter(CreateOffering));
