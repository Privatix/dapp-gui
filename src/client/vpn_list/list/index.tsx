import * as React from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import Pagination from 'react-js-pagination';

import { asyncProviders } from 'redux/actions';

import isEqual = require('lodash.isequal'); // https://github.com/lodash/lodash/issues/3192#issuecomment-359642822

import './list.css';
import 'rc-slider/assets/index.css';

import AcceptOffering from '../acceptOffering';
import ModalWindow from 'common/modalWindow';

import notice from 'utils/notice';
import countryByIso from 'utils/countryByIso';
import { ipTypesAssoc } from 'utils/ipTypes';

import Spinner from './spinner';
import VPNListTable from './table';
import SelectByAgent from './selectByAgent';
import SelectByOffering from './selectByOffering';
import SelectCountry from './selectCountry';
import SelectByPrice from './selectByPrice';
import SelectByIPType from './selectByIPType';

import { State } from 'typings/state';
import { ClientOfferingItem } from 'typings/offerings';

interface IProps {
    t?: any;
    ws?: State['ws'];
    offerings: State['offerings'];
    dispatch?: any;
    offeringsAvailability?: State['offeringsAvailability'];
    localSettings?: State['localSettings'];
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
    checkedIPTypes: string[];
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
    maxRating: number;
    filteredCountries: string[];
    activePage: number;
    totalItems: number;
    rawOfferings: ClientOfferingItem[];
    form: {
        fromStr: string;
        toStr: string;
        step: number;
    };
}

@translate(['client/vpnList', 'utils/notice', 'common'])
class VPNList extends React.Component<IProps, IState> {

    checkAvailabilityBtn = null;

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
            checkedIPTypes: [],
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
            maxRating: 0,
            filteredCountries: [],
            activePage: 1,
            totalItems: 0,
            rawOfferings: [],
        };

    }

    async componentDidMount() {

        const { offerings } = this.props;

        offerings.addEventListener('*', this.refresh);
        offerings.useUnlimitedOnly = false;

        this.getClientOfferings();
    }

    componentWillUnmount(){

        const { offerings } = this.props;

        offerings.removeEventListener('*', this.refresh);
        offerings.useUnlimitedOnly = false;

    }

    refresh = async () => {

        await this.getClientOfferings();
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

    newSelect = () => {
            this.setState({activePage: 0}, this.getClientOfferings);
    }

    getClientOfferings = async () => {

        const { ws, localSettings } = this.props;
        const { filter, activePage } = this.state;

        if (filter.offeringHash !== '') {

            try {
                const offering = await ws.getObjectByHash('offering', filter.offeringHash.replace(/^0x/, ''));
                this.setState({
                    rawOfferings: [{offering, rating: 0}],
                    totalItems: 1
                });
            } catch (e) {
                this.setState({rawOfferings: [], totalItems: 0});
            }

            return;
        }

        const limit = localSettings.paging.offerings;
        const offset = activePage > 1 ? (activePage - 1) * limit : 0;

        const filterParams = await ws.getClientOfferingsFilterParams();
        const allCountries = filterParams.countries;

        const min = filterParams.minPrice / 1e8;
        const max = filterParams.maxPrice / 1e8;

        const from =  filter.price.userFilter ? filter.price.from : min;
        const to = filter.price.userFilter ? filter.price.to : max;

        const fromVal = Math.round(from * 1e8);
        const toVal = Math.round(to * 1e8);

        const clientOfferingsLimited = await ws.getClientOfferings(filter.agent.replace(/^0x/, '')
                                                                  ,fromVal
                                                                  ,toVal
                                                                  ,filter.checkedCountries
                                                                  ,filter.checkedIPTypes
                                                                  ,offset
                                                                  ,limit);
        const {items: clientOfferings} = clientOfferingsLimited;

        // Show loader when downloading VPN list
        if (clientOfferings.length === 0 && !this.isFiltered()) {
            this.setState({spinner: true});
            return;
        }

        this.setState({
            spinner: false,
            rawOfferings: clientOfferings,
            totalItems: clientOfferingsLimited.totalItems,
            countries: allCountries,
            maxRating: filterParams.maxRating,
            filteredCountries: filter.searchCountryStr === '' ? allCountries : this.filterCountries(filter.searchCountryStr, allCountries)
        });
        this.updateFilter({price: {userFilter: filter.price.userFilter, min, max, from, to}}, undefined);
    }

    formFilteredDataRow(offeringItem: ClientOfferingItem, maxRating: number) {

        const { t, offeringsAvailability } = this.props;
        const offering = offeringItem.offering;
        const offeringHash = '0x' + offering.hash;

        const availability = (offering.id in offeringsAvailability.statuses)
            ? (offeringsAvailability.statuses[offering.id] === true ? 'available' : (offeringsAvailability.statuses[offering.id] === false ? 'unreachable' : 'unknown' ))
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
            ipType: ipTypesAssoc[offering.ipType],
            price: offering.unitPrice,
            availableSupply: offering.currentSupply,
            supply: offering.supply,
            rating: maxRating ? (100/maxRating)*offeringItem.rating : 0,
            maxUnits: offering.maxUnit
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
                this.updateFilter({price: Object.assign({}, filter.price, {userFilter: true, from, to})}, this.newSelect);
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
            this.updateFilter({searchCountryStr: searchText}, this.newSelect);
        }
    }

    onAgentChanged = (e: any): void => {

        const { t } = this.props;

        const agent = e.target.value.toLowerCase().trim();
        if(this.state.filter.offeringHash.trim() === ''){
            this.updateFilter({agent}, this.newSelect);
        }else{
            notice({level: 'warning', header: t('utils/notice:Attention!'), msg: t('ClearOfferingHashToUseOtherFilters')});
        }
    }

    onOfferingHashChanged = (e: any): void => {

        const { t } = this.props;
        const { filter } = this.state;

        const offeringHash = e.target.value.toLowerCase().trim();
        if(filter.agent.trim() === ''){
            this.updateFilter({offeringHash}, this.newSelect);
        }else{
            notice({level: 'warning', header: t('utils/notice:Attention!'), msg: t('ClearAgentHashToUseOtherFilters')});
        }
    }

    filterByIPTypeHandler = (e: any): void => {

        const { filter } = this.state;
        const changedType = e.target.value;

        if(filter.checkedIPTypes.includes(changedType)){
            this.updateFilter({checkedIPTypes: filter.checkedIPTypes.filter(IPType => IPType !== changedType)}, this.newSelect);
        }else{
            this.updateFilter({checkedIPTypes: filter.checkedIPTypes.concat([changedType])}, this.newSelect);
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

            this.updateFilter({checkedCountries}, this.newSelect);
        }
    }

    handlePageChange = (pageNumber: number) => {
        this.setState({activePage: pageNumber}, this.getClientOfferings);
    }

    resetFilters = () => {
        this.updateFilter(this.defaultFilter, this.newSelect);
    }

    onCheckStatus = () => {
        this.checkAvailabilityBtn.current.setAttribute('disabled', 'disabled');
        const offeringsIds = this.state.rawOfferings.map(offeringItem => offeringItem.offering.id);
        this.props.dispatch(asyncProviders.setOfferingsAvailability(offeringsIds));
    }

    render() {

        if(this.state.spinner){
            return <Spinner />;
        }

        const { t, localSettings, offeringsAvailability } = this.props;
        const { rawOfferings, filteredCountries, filter, form, activePage, totalItems, maxRating } = this.state;

        const offerings = rawOfferings.map(offeringItem => this.formFilteredDataRow(offeringItem, maxRating));

        if (offeringsAvailability.counter === 0
            && this.checkAvailabilityBtn.current
            && this.checkAvailabilityBtn.current.hasAttribute('disabled')) {
            this.checkAvailabilityBtn.current.removeAttribute('disabled');
        }

        const pagination = totalItems <= localSettings.paging.offerings ? null :
            <div>
                <Pagination
                    activePage={activePage}
                    itemsCountPerPage={localSettings.paging.offerings}
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

                        <SelectByIPType
                            selectedTypes={filter.checkedIPTypes}
                            onChange={this.filterByIPTypeHandler}
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
    ,offerings: state.offerings
    ,offeringsAvailability: state.offeringsAvailability
    ,localSettings: state.localSettings
    }) )(VPNList);
