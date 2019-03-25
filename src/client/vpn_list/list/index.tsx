import * as React from 'react';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import Pagination from 'react-js-pagination';

import { asyncProviders } from 'redux/actions';

import isEqual = require('lodash.isequal'); // https://github.com/lodash/lodash/issues/3192#issuecomment-359642822

import './list.css';
import 'rc-slider/assets/index.css';

import AcceptOffering from '../acceptOffering';
import ModalWindow from 'common/modalWindow';

import notice from 'utils/notice';
import toFixedN from 'utils/toFixedN';
import countryByIso from 'utils/countryByIso';

import Spinner from './spinner';
import VPNListTable from './table';
import SelectByAgent from './selectByAgent';
import SelectByOffering from './selectByOffering';
import SelectCountry from './selectCountry';
import SelectByPrice from './selectByPrice';

import {State} from 'typings/state';
import {Offering} from 'typings/offerings';
import { WS } from 'utils/ws';

interface IProps {
    t?: any;
    ws?: WS;
    dispatch?: any;
    offeringsAvailability?: State['offeringsAvailability'];
    localSettings?: State['localSettings'];
    serviceName: string;
}

interface Filter {
    price: {
        userFilter: boolean;
        from: number;
        to: number;
        min: number;
        max: number;
    };
    agent: string;
    offeringHash: string;
    checkedCountries: string[];
    searchCountryStr: string;
}

type UpdateFilter = {
    [K in keyof Filter]?: Filter[K];
};

interface IState {
    filter: Filter;
    spinner: boolean;
    countries: string[];
    filteredCountries: string[];
    activePage: number;
    totalItems: number;
    rawOfferings: any[];
    form: {
        fromStr: string;
        toStr: string;
        step: number;
    };
}

@translate(['client/vpnList', 'utils/notice', 'common'])
class VPNList extends React.Component<IProps, IState> {

    checkAvailabilityBtn = null;
    handler = null;
    get defaultFilter(){
        return {
            price: {
                userFilter: false,
                from: 0,
                to: 0.01,
                min: 0,
                max: 0.01,
            },
            agent: '',
            offeringHash: '',
            checkedCountries: [],
            searchCountryStr: ''
        };
    }

    constructor(props:IProps) {
        super(props);

        this.checkAvailabilityBtn = React.createRef();

        this.state = {
            filter: this.defaultFilter,
            form: {
                fromStr: '0',
                toStr: '0',
                step: 0.0001,
            },
            spinner: true,
            countries: [],
            filteredCountries: [],
            activePage: 1,
            totalItems: 0,
            rawOfferings: [],
        };

    }

    async componentDidMount() {
        this.getClientOfferings();
    }

    componentWillUnmount(){
        if (this.handler !== null) {
            clearTimeout(this.handler);
            this.handler = null;
        }
    }

    refresh = async () => {

        await this.getClientOfferings();
    }

    onRefresh = async () => {
        const { t, serviceName } = this.props;
        await this.refresh();
        notice({level: 'info'
               ,header: t('utils/notice:Congratulations!')
               ,msg: <Trans i18nKey='SuccessUpdateMsg' values={{serviceName}} >
                         { {serviceName} } list was successfully updated!
                     </Trans>
        });
    }

    updateFilter(filter: UpdateFilter, cb: () => void){
        this.setState({filter: Object.assign({}, this.state.filter, filter)}, cb);
    }

    checkFilters(){

        const { t } = this.props;
        const { filter } = this.state;

        // If not empty filter input Offering hash - search only by Offering hash
        if (filter.offeringHash !== '') {
            notice({level: 'warning', header: t('utils/notice:Attention!'), msg: t('ClearOfferingHashToUseOtherFilters')});
            return false;
        }

        return true;
    }

    isFiltered(){

        const { filter } = this.state;

        return (!isEqual(filter, Object.assign({}, this.defaultFilter, {price: filter.price})))
               || filter.price.userFilter;
    }

    async getClientOfferings() {

        const { ws, localSettings } = this.props;
        const { filter, activePage } = this.state;

        if (filter.offeringHash !== '') {

            try {
                const offering = await this.props.ws.getObjectByHash('offering', filter.offeringHash.replace(/^0x/, ''));
                this.setState({
                    rawOfferings: [offering],
                    totalItems: 1
                });
            } catch (e) {
                this.setState({rawOfferings: [], totalItems: 0});
            }

            return;
        }

        const limit = localSettings.elementsPerPage;
        const offset = activePage > 1 ? (activePage - 1) * limit : 0;

        const filterParams = await ws.getClientOfferingsFilterParams();
        const allCountries = filterParams.countries;

        const min = filterParams.minPrice / 1e8;
        const max = filterParams.maxPrice / 1e8;

        const from =  filter.price.userFilter ? filter.price.from : min;
        const to = filter.price.userFilter ? filter.price.to : max;

        const fromVal = Math.round(from * 1e8);
        const toVal = Math.round(to * 1e8);

        const clientOfferingsLimited = await ws.getClientOfferings(filter.agent.replace(/^0x/, ''), fromVal, toVal, filter.checkedCountries, offset, limit);
        const {items: clientOfferings} = clientOfferingsLimited;

        if (this.handler !== null) {
            clearInterval(this.handler);
            this.handler = null;
        }
        // Show loader when downloading VPN list
        if (clientOfferings.length === 0 && !this.isFiltered()) {
            this.setState({spinner: true});
            this.handler = setTimeout(this.refresh, 5000);
            return;
        }

        this.setState({
            spinner: false,
            rawOfferings: clientOfferings,
            totalItems: clientOfferingsLimited.totalItems,
            countries: allCountries,
            filteredCountries: filter.searchCountryStr === '' ? allCountries : this.filterCountries(filter.searchCountryStr, allCountries)
        });
        this.updateFilter({price: {userFilter: filter.price.userFilter, min, max, from, to}}, undefined);
    }

    formFilteredDataRow(offering: Offering) {

        const { t, offeringsAvailability } = this.props;

        const offeringHash = '0x' + offering.hash;

        const availability = (offering.id in offeringsAvailability.statuses)
            ? (offeringsAvailability.statuses[offering.id] === true ? 'available' : 'unreachable')
            : 'unknown';

        return {
            availability: availability,
            block: offering.blockNumberUpdated,
            hash: <ModalWindow
                customClass='shortTableText'
                modalTitle={t('AcceptOffering')}
                text={offeringHash}
                copyToClipboard={true}
                component={<AcceptOffering offering={offering} />}
            />,
            agent: offering.agent,
            country: countryByIso(offering.country),
            price: toFixedN({number: (offering.unitPrice / 1e8), fixed: 8}),
            availableSupply: offering.currentSupply,
            supply: offering.supply
        };
    }

    onChangeMinPrice = (evt:any): void => {

        const { filter } = this.state;

        if(this.checkFilters()){
            let priceFrom = parseFloat(evt.target.value);
            if (!isFinite(priceFrom) || (typeof priceFrom === 'undefined')) {
                priceFrom = filter.price.from;
            }

            this.onChangeRange([priceFrom, filter.price.to]);
        }
    }

    onChangeMaxPrice = (evt:any):void => {

        const { filter } = this.state;

        if(this.checkFilters()){
            let priceTo = parseFloat(evt.target.value);
            if (!isFinite(priceTo) || (typeof priceTo === 'undefined')) {
                priceTo = filter.price.to;
            }

            this.onChangeRange([filter.price.from, priceTo]);
        }
    }

    onChangeRange = (value:any): void => {
        const { filter } = this.state;
        if(this.checkFilters()){
            const [ from, to ] = value;
            if(from !== filter.price.from || to !== filter.price.to){
                this.updateFilter({price: Object.assign({}, filter.price, {userFilter: true, from, to})}, this.getClientOfferings);
            }
        }
    }

    filterCountries(pattern: string, countries: string[]){
        const regexp = new RegExp(pattern, 'i');
        return countries.filter(country => regexp.test(countryByIso(country)));
    }

    onCountriesSearch = (e:any): void => {
        if(this.checkFilters()){
            const searchText = e.target.value.trim();
            const filteredCountries = this.filterCountries(searchText, this.state.countries);

            this.setState({filteredCountries});
            this.updateFilter({searchCountryStr: searchText}, this.getClientOfferings);
        }
    }

    onAgentChanged = (e: any): void => {

        const { t } = this.props;

        const agent = e.target.value.toLowerCase().trim();
        if(this.state.filter.offeringHash.trim() === ''){
            this.updateFilter({agent}, this.getClientOfferings);
        }else{
            notice({level: 'warning', header: t('utils/notice:Attention!'), msg: t('ClearOfferingHashToUseOtherFilters')});
        }
    }

    onOfferingHashChanged = (e: any): void => {

        const { t } = this.props;
        const { filter } = this.state;

        const offeringHash = e.target.value.toLowerCase().trim();
        if(filter.agent.trim() === ''){
            this.updateFilter({offeringHash}, this.getClientOfferings);
        }else{
            notice({level: 'warning', header: t('utils/notice:Attention!'), msg: t('ClearAgentHashToUseOtherFilters')});
        }
    }

    filterByCountryHandler = (e:any): void => {

        const { filter } = this.state;

        if(this.checkFilters()){
            const checkedCountries = filter.checkedCountries.slice();
            const country = e.target.value.trim();

            const add = e.target.checked && checkedCountries.indexOf(country) === -1;

            if (add) {
                checkedCountries.push(country);
            } else {
                checkedCountries.splice(checkedCountries.indexOf(country), 1);
            }

            this.updateFilter({checkedCountries}, undefined);
            this.setState({activePage: 0}, this.getClientOfferings);
        }
    }

    handlePageChange = (pageNumber: number) => {
        this.setState({activePage: pageNumber}, this.getClientOfferings);
    }

    resetFilters = () => {
        this.updateFilter(this.defaultFilter, this.getClientOfferings);
    }

    onCheckStatus = () => {
        this.checkAvailabilityBtn.current.setAttribute('disabled', 'disabled');
        const offeringsIds = this.state.rawOfferings.map(offering => offering.id);
        this.props.dispatch(asyncProviders.setOfferingsAvailability(offeringsIds));
    }

    render() {

        if(this.state.spinner){
            return <Spinner />;
        }

        const { t, localSettings, offeringsAvailability } = this.props;
        const { rawOfferings, filteredCountries, filter, form, activePage, totalItems } = this.state;

        const offerings = rawOfferings.map(offering => this.formFilteredDataRow(offering));

        if (offeringsAvailability.counter === 0
            && this.checkAvailabilityBtn.current
            && this.checkAvailabilityBtn.current.hasAttribute('disabled')) {
            this.checkAvailabilityBtn.current.removeAttribute('disabled');
        }

        const pagination = totalItems <= localSettings.elementsPerPage ? null :
            <div>
                <Pagination
                    activePage={activePage}
                    itemsCountPerPage={localSettings.elementsPerPage}
                    totalItemsCount={totalItems}
                    pageRangeDisplayed={10}
                    onChange={this.handlePageChange}
                    prevPageText='‹'
                    nextPageText='›'
                />
            </div>;

        const resetFilters = this.isFiltered()
            ? <div className='m-b-20'>
                <button className='btn-block btn btn-warning btn-custom waves-effect waves-light' onClick={this.resetFilters}>{t('ResetFilters')}</button>
              </div>
            : <div className='m-b-20'>
                <div className='btn-block btn btn-warning btn-custom waves-effect waves-light disabled'>{t('ResetFilters')}</div>
              </div>;

        return (
            <div className='container-fluid'>
                <div className='row m-t-20'>
                    <div className='col-12 m-b-20'>
                        <button
                            className='btn btn-default btn-custom waves-effect waves-light'
                            onClick={this.onRefresh}>
                            {t('Refresh')}
                        </button>
                        <button
                            className='btn btn-default btn-custom waves-effect waves-light ml-3'
                            ref={this.checkAvailabilityBtn}
                            onClick={this.onCheckStatus}>
                            {t('CheckAvailability')}
                        </button>
                    </div>
                    <div className='col-3'>

                        {resetFilters}
                        <div className='card m-b-20'>
                            <div className='card-body'>
                                <SelectByAgent agentHash={filter.agent} onChange={this.onAgentChanged} />
                                <SelectByOffering offeringHash={filter.offeringHash} onChange={this.onOfferingHashChanged} />
                            </div>
                        </div>

                        <SelectByPrice
                            onChangeMinPrice={this.onChangeMinPrice}
                            onChangeMaxPrice={this.onChangeMaxPrice}
                            onChangeRange={this.onChangeRange}
                            min={filter.price.min}
                            max={filter.price.max}
                            step={form.step}
                            start={filter.price.from}
                            end={filter.price.to}
                        />

                        <SelectCountry
                            selectedCountries={filter.checkedCountries}
                            allCountries={filteredCountries}
                            searchStr={filter.searchCountryStr}
                            onChange={this.filterByCountryHandler}
                            onSearch={this.onCountriesSearch}
                        />

                    </div>
                    <div className='col-9'>
                        <div className='card-box'>
                            <VPNListTable offerings={offerings} />
                            {pagination}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect( (state: State) => (
    {ws: state.ws
    ,offeringsAvailability: state.offeringsAvailability
    ,localSettings: state.localSettings
    ,serviceName: state.serviceName
    }) )(VPNList);
