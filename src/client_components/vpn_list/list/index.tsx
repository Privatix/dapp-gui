import * as React from 'react';
import { translate } from 'react-i18next';
import './list.css';
import SortableTable from 'react-sortable-table-vilan';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import isEqual = require('lodash.isequal'); // https://github.com/lodash/lodash/issues/3192#issuecomment-359642822

import AcceptOffering from '../acceptOffering';
import ModalWindow from '../../../components/modalWindow';
import ModalPropTextSorter from '../../../components/utils/sorters/sortingModalByPropText';
import notice from '../../../utils/notice';
import toFixedN from '../../../utils/toFixedN';
import Pagination from 'react-js-pagination';
import { connect } from 'react-redux';
import {State} from '../../../typings/state';
import * as api from '../../../utils/api';
import {LocalSettings} from '../../../typings/settings';
import countryByIso from '../../../utils/countryByIso';
import CopyToClipboard from 'components/copyToClipboard';

@translate(['client/vpnList', 'utils/notice', 'common'])

class VPNList extends React.Component<any,any> {
    constructor(props:any) {
        super(props);

        const { t } = props;

        this.state = {
            from: 0,
            to: 0,
            step: 0.0001,
            min: 0,
            max: 0.01,
            spinner: true,
            refreshHandler: null,
            changePriceInput: false,
            countries: [],
            filteredCountries: [],
            checkedCountries: [],
            showAllCountries: false,
            filtered: [],
            elementsPerPage: 0,
            activePage: 1,
            totalItems: 0,
            agent: '',
            offeringHash: '',
            defaultShowCountriesCount: 5,
            columns: [
                {
                    header: t('Block'),
                    key: 'block'
                },
                {
                    header: t('Hash'),
                    key: 'hash',
                    dataProps: { className: 'shortTableTextTd' },
                    descSortFunction: ModalPropTextSorter.desc,
                    ascSortFunction: ModalPropTextSorter.asc
                },
                {
                    header: t('Agent'),
                    key: 'agent',
                    dataProps: { className: 'shortTableTextTd' },
                    render: (agent) => {
                        const agentText = '0x' + agent;
                        return <div>
                            <span className='shortTableText' title={agentText}>{agentText}</span>
                            <CopyToClipboard text={agentText} />
                        </div>;
                    }
                },
                {
                    header: t('Country'),
                    key: 'country'
                },
                {
                    header: t('Price'),
                    key: 'price'
                },
                {
                    header: t('AvailableSupply'),
                    key: 'availableSupply'
                },
                {
                    header: t('SupplyTotal'),
                    key: 'supply'
                }
            ]
        };

    }

    async componentDidMount() {
        await this.getElementsPerPage();
        this.getClientOfferings();
    }

    async getElementsPerPage() {
        const settings = (await api.settings.getLocal()) as LocalSettings;
        this.setState({elementsPerPage: settings.elementsPerPage});
    }

    async refresh(clicked?: boolean, activePage:number = 1) {
        const { t } = this.props;

        this.getClientOfferings(activePage).then(() => {
            if (clicked === true) {
                notice({level: 'info', title: t('utils/notice:Congratulations!'), msg: t('SuccessUpdateMsg')});
            }
        });
    }

    shouldComponentUpdate(nextProps:any, nextState:any) {
        return (this.state.spinner !== nextState.spinner)
            || (this.state.showAllCountries !== nextState.showAllCountries)
            || (this.state.filteredCountries !== nextState.filteredCountries)
            || (this.state.offeringHash !== nextState.offeringHash)
            || !(isEqual(nextState.filtered, this.state.filtered));
    }

    async getClientOfferings(activePage:number = 1, from:number = 0, to:number = 0) {
        // If not empty filter input Offering hash - search only by Offering hash
        if (this.state.offeringHash !== '') {
            const { t } = this.props;
            notice({level: 'warning', title: t('utils/notice:Attention!'), msg: t('ClearOfferingHashToUseOtherFilters')});
            return;
        }

        const limit = this.state.elementsPerPage;
        const offset = activePage > 1 ? (activePage - 1) * limit : 0;

        const checkedCountries = this.state.checkedCountries;

        const filterParams = await this.props.ws.getClientOfferingsFilterParams();
        const allCountries = filterParams.countries;

        const min = filterParams.minPrice / 1e8;
        const max = filterParams.maxPrice / 1e8;

        from = from === 0 && this.state.from === 0 ? min : from > 0 ? from : this.state.from;
        to = to === 0 && this.state.to === 0 ? max : to > 0 ? to : this.state.to;

        const fromVal = Math.round(from * 1e8);
        const toVal = Math.round(to * 1e8);

        const clientOfferingsLimited = await this.props.ws.getClientOfferings(this.state.agent.replace(/^0x/, ''), fromVal, toVal, checkedCountries, offset, limit);
        const {items: clientOfferings} = clientOfferingsLimited;

        // Show loader when downloading VPN list
        const isFiltered = checkedCountries.length > 0 || this.state.agent !== '' || this.state.offeringHash !== '' || from > 0 || to > 0;
        if (Object.keys(clientOfferings).length === 0 && !isFiltered) {
            this.setState({spinner: true});
            const refreshHandler = setTimeout(() => {
                this.refresh();
            }, 5000);
            this.setState({refreshHandler});
            return;
        } else {
            if (this.state.handler !== null) {
                clearInterval(this.state.refreshHandler);
            }
        }

        let offerings = clientOfferings.map(offering => {
            return this.formFilteredDataRow(offering);
        });

        this.setState({
            spinner: false,
            filtered: offerings,
            totalItems: clientOfferingsLimited.totalItems,
            offset,
            activePage,
            min,
            max,
            from,
            to,
            countries: allCountries,
            filteredCountries: allCountries
        });
    }

    async getClientOfferingsByOfferingHash() {
        if (this.state.offeringHash === '') {
            this.getClientOfferings();
            return;
        }

        try {
            const offering = await this.props.ws.getObjectByHash('offering', this.state.offeringHash.replace(/^0x/, ''));
            const offeringRow = this.formFilteredDataRow(offering);
            this.setState({
                filtered: [offeringRow],
                totalItems: 1
            });
        } catch (e) {
            this.setState({filtered: [], totalItems: 0});
        }
    }

    formFilteredDataRow(offering: any) {
        const { t } = this.props;
        const offeringHash = '0x' + offering.hash;

        return {
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

    changeMinPriceInput(evt:any) {
        let priceFrom = evt.target.value;
        if (priceFrom === '' || Number.isNaN(priceFrom) || (typeof priceFrom === 'undefined')) {
            priceFrom = this.state.from;
        }

        if (this.state.changePriceInput === true) {
            this.setState({changePriceInput: false});
        } else {
            this.setState({changePriceInput: true});
        }
        const priceTo = (document.getElementById('priceTo') as HTMLInputElement).value;

        this.changeRange([parseFloat(priceFrom), parseFloat(priceTo)]);
    }

    changeMaxPriceInput(evt:any) {
        let priceTo = evt.target.value;
        if (priceTo === '' || Number.isNaN(priceTo) || (typeof priceTo === 'undefined')) {
            priceTo = this.state.to;
        }
        if (this.state.changePriceInput === true) {
            this.setState({changePriceInput: false});
        } else {
            this.setState({changePriceInput: true});
        }
        const priceFrom = (document.getElementById('priceFrom') as HTMLInputElement).value;

        this.changeRange([parseFloat(priceFrom), parseFloat(priceTo)]);
    }

    changeRange(value:any) {
        let from = value[0];
        let to = value[1];
        (document.getElementById('priceFrom') as HTMLInputElement).value = from;
        (document.getElementById('priceTo') as HTMLInputElement).value = to;

        const handler = setTimeout(() => {
            this.getClientOfferings(1, from, to);
        }, 200);

        if (this.state.handler !== null) {
            clearTimeout(this.state.handler);
        }

        this.setState({handler, from, to});
    }

    showCountriesHandler() {
        this.setState({filteredCountries: this.state.countries});
        if (this.state.showAllCountries) {
            this.setState({showAllCountries: false});
        } else {
            this.setState({showAllCountries: true});
        }
    }

    filterCountries(e:any) {
        const searchText = e.target.value;
        let patt = new RegExp(searchText, 'i');
        let filteredCountries = this.state.countries.filter((item) => {
            const countryName = countryByIso(item);
            return patt.test(countryName);
        });

        this.setState({
            filteredCountries: filteredCountries
        });
    }

    filterByAgent(e: any){
        let agent = e.target.value.toLowerCase().trim();

        this.setState({agent}, this.getClientOfferings);
    }

    filterByOfferingHash(e: any){
        let offeringHash = e.target.value.toLowerCase().trim();

        this.setState({offeringHash}, this.getClientOfferingsByOfferingHash);
    }

    filterByCountryHandler(e:any) {
        let checkedCountries = this.state.checkedCountries;
        const country = e.target.value;

        if (e.target.checked && checkedCountries.indexOf(country) === -1) {
            checkedCountries.push(country);
        } else if (!e.target.checked && checkedCountries.indexOf(country) !== -1) {
            checkedCountries.splice(checkedCountries.indexOf(country), 1);
        }

        this.setState({checkedCountries}, this.getClientOfferings);
    }

    handlePageChange(pageNumber:number) {
        this.getClientOfferings(pageNumber);
    }

    resetFilters() {
        this.setState({
            agent: '',
            offeringHash: '',
            checkedCountries: [],
            from: this.state.min,
            to: this.state.max
        }, this.getClientOfferings);
    }

    render() {
        const { t } = this.props;
        const createSliderWithTooltip = Slider.createSliderWithTooltip;
        const Range = createSliderWithTooltip(Slider.Range);

        let buttonText = t('ShowAllBtn');
        let searchHtml = null;
        if (this.state.showAllCountries) {
            buttonText = t('HideBtn');
            searchHtml = <div className='form-group row'>
                <div className='col-md-12 m-t-10 m-b-10'>
                    <div className='input-group searchInputGroup'>
                        <div className='input-group-prepend'>
                            <span className='input-group-text'><i className='fa fa-search'></i></span>
                        </div>
                        <input className='form-control' type='search' name='search' placeholder={t('Search')}
                               onChange={this.filterCountries.bind(this)} />
                    </div>
                </div>
            </div>;
        }

        const showHideCountriesBtn = this.state.filteredCountries.length > this.state.defaultShowCountriesCount
            ? <div className='text-center'>
                    <button type='button' className='btn btn-link waves-effect'
                            onClick={this.showCountriesHandler.bind(this)}>{buttonText}</button>
                </div>
            : '';

        const pagination = this.state.totalItems <= this.state.elementsPerPage ? '' :
            <div>
                <Pagination
                    activePage={this.state.activePage}
                    itemsCountPerPage={this.state.elementsPerPage}
                    totalItemsCount={this.state.totalItems}
                    pageRangeDisplayed={10}
                    onChange={this.handlePageChange.bind(this)}
                    prevPageText='‹'
                    nextPageText='›'
                />
            </div>;

        const noResults = this.state.filtered.length === 0 ?
            <p className='text-warning text-center m-t-20 m-b-20'>{t('common:NoResults')}</p>
            : '';

        const resetFilters = this.state.agent !== ''
            || this.state.offeringHash !== ''
            || this.state.min !== this.state.from
            || this.state.max !== this.state.to
            || this.state.offeringHash !== ''
            || this.state.checkedCountries.length > 0 ?
                <div className='m-b-20'>
                    <button className='btn btn-block btn-warning' onClick={this.resetFilters.bind(this)}>{t('ResetFilters')}</button>
                </div>
                : '';

        return this.state.spinner ? <div className='container-fluid'>
                <div className='row m-t-20'>
                    <div className='col-12'>
                        <div className='card'>
                            <div className='col-4 m-b-20'>
                                <div className='card-body'>
                                    <p className='font-25'>{t('WaitForDownloading')}</p>
                                    <div className='text-center m-t-15 m-b-15'>
                                        <div className='lds-dual-ring'></div>
                                    </div>
                                    <p className='m-b-0'>{t('CurrentlyWeAreDownloading')}</p>
                                    <p>{t('TakesTimeOnFirstRun')}</p>
                                    <p className='m-t-15'>{t('AverageTimeForDownloading')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            :
            <div className='container-fluid'>

                <div className='row m-t-20'>
                    <div className='col-12 m-b-20'>
                        <button className='btn btn-default btn-custom waves-effect waves-light' onClick={this.refresh.bind(this, true, this.state.activePage)}>{t('Refresh')}</button>
                    </div>
                    <div className='col-3'>

                        <div className='card m-b-20'>
                            <div className='card-body'>
                                <div className='form-group row'>
                                    <div className='col-12'>
                                        <label className='control-label'>{t('AgentAddress')}</label>
                                    </div>
                                    <div className='col-md-12'>
                                        <div className='input-group searchInputGroup searchInputGroupVPNList'>
                                            <div className='input-group-prepend'>
                                                <span className='input-group-text'><i className='fa fa-search'></i></span>
                                            </div>
                                            <input className='form-control'
                                                   type='search'
                                                   name='agent'
                                                   placeholder='0x354B10B5c4A96b81b5e4F12F90cd0b7Ae5e05eE6'
                                                   value={this.state.agent}
                                                   onChange={this.filterByAgent.bind(this)} />
                                        </div>
                                    </div>
                                </div>

                                <div className='form-group row'>
                                    <div className='col-12'>
                                        <label className='control-label'>{t('OfferingHash')}</label>
                                    </div>
                                    <div className='col-md-12'>
                                        <div className='input-group searchInputGroup searchInputGroupVPNList'>
                                            <div className='input-group-prepend'>
                                                <span className='input-group-text'><i className='fa fa-search'></i></span>
                                            </div>
                                            <input className='form-control'
                                                   type='search'
                                                   name='offeringHash'
                                                   placeholder='0x74c96979ae4fbb11a7122a71e90161f1feee7523472cea74f8b9f3ca8481fb37'
                                                   value={this.state.offeringHash}
                                                   onChange={this.filterByOfferingHash.bind(this)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='card m-b-20'>
                            <div className='card-body'>
                                <h6 className='card-title'>{t('PriceFilter')}</h6>
                                <div className='form-group row'>
                                    <div className='col-6 priceMinMaxInputBl'>
                                        <div className='input-group'>
                                            <div className='input-group-prepend'>
                                                <span className='input-group-text' id='priceFromLabel'>{t('From')}</span>
                                            </div>
                                            <input type='number' min={this.state.min} max={this.state.max - this.state.step} step={this.state.step} className='form-control' placeholder={this.state.min}
                                                   id='priceFrom' value={toFixedN({number: this.state.from, fixed: 8})} onChange={(e) => this.changeMinPriceInput(e)} />
                                        </div>
                                    </div>
                                    <div className='col-6 priceMinMaxInputBl'>
                                        <div className='input-group'>
                                            <div className='input-group-prepend'>
                                                <span className='input-group-text' id='priceToLabel'>{t('To')}</span>
                                            </div>
                                            <input type='number' min={this.state.min + this.state.step} max={this.state.max} step={this.state.step} className='form-control' placeholder={this.state.max}
                                                   id='priceTo' value={toFixedN({number: this.state.to, fixed: 8})} onChange={(e) => this.changeMaxPriceInput(e)} />
                                        </div>
                                    </div>
                                </div>
                                <div className='row m-t-30'>
                                    <div className='col-12'>
                                        <Range defaultValue={[this.state.from, this.state.to]} min={this.state.min} max={this.state.max} step={this.state.step}
                                               onChange={this.changeRange.bind(this)} allowCross={false}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='card m-t-15 m-b-20 vpnListCountryFilterBl'>
                            <h5 className='card-header'>{t('Country')}</h5>
                            <div className='card-body'>
                                {searchHtml}

                                {this.state.filteredCountries.map((country, key) => {
                                    let countryCheckboxHtml = <div className='checkbox checkbox-custom' key={country}>
                                        <input id={country}
                                               type='checkbox'
                                               name='checkboxCountry'
                                               value={country}
                                               checked={this.state.checkedCountries.indexOf(country) !== -1}
                                               onChange={this.filterByCountryHandler.bind(this)} />
                                        <label htmlFor={country}>{countryByIso(country)}</label>
                                    </div>;
                                    if (!this.state.showAllCountries) {
                                        if (key < this.state.defaultShowCountriesCount) {
                                            return countryCheckboxHtml;
                                        }
                                    } else {
                                        return countryCheckboxHtml;
                                    }
                                })}

                                {showHideCountriesBtn}
                            </div>
                        </div>

                        {resetFilters}
                    </div>
                    <div className='col-9'>
                        <div className='card-box'>
                            <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                                <SortableTable
                                    data={this.state.filtered}
                                    columns={this.state.columns}/>

                                {noResults}
                            </div>

                            {pagination}
                        </div>
                    </div>
                </div>
            </div>;
    }
}

export default connect( (state: State) => ({ws: state.ws}) )(VPNList);
