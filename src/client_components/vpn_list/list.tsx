import * as React from 'react';
import { translate } from 'react-i18next';
import SortableTable from 'react-sortable-table-vilan';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import isEqual = require('lodash.isequal'); // https://github.com/lodash/lodash/issues/3192#issuecomment-359642822

import AcceptOffering from './acceptOffering';
import ModalWindow from '../../components/modalWindow';
import ModalPropTextSorter from '../../components/utils/sorters/sortingModalByPropText';
import notice from '../../utils/notice';
import toFixedN from '../../utils/toFixedN';

@translate(['client/vpnList', 'utils/notice'])

export default class AsyncList extends React.Component<any,any> {
    constructor(props:any) {
        super(props);

        const { t } = props;

        this.state = {
            from: 0,
            to: 0.01,
            step: 0.0001,
            min: 0,
            max: 0.01,
            spinner: true,
            changePriceInput: false,
            data: [],
            countries: [],
            filteredCountries: [],
            checkedCountries: [],
            showAllCountries: false,
            filtered: [],
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
                    header: t('Country'),
                    key: 'country'
                },
                {
                    header: t('Price'),
                    key: 'price'
                },
                {
                    header: t('SupplyTotal'),
                    key: 'supply'
                },
                {
                    header: t('AvailableSupply'),
                    key: 'availableSupply'
                }
            ]
        };

    }

    componentDidMount() {
        this.getClientOfferings();
    }

    async refresh(clicked?: boolean) {
        const { t } = this.props;
        this.getClientOfferings(this.filter.bind(this)).then(() => {
            if (clicked === true) {
                notice({level: 'info', title: t('utils/notice:Congratulations!'), msg: t('SuccessUpdateMsg')});
            }
        });
    }

    async getClientOfferings(done?: Function) {

        const { t } = this.props;

        const {items: clientOfferings} = await (window as any).ws.getClientOfferings();
        // Show loader when downloading VPN list
        setTimeout(() => {
            this.refresh();
        }, 5000);

        if (Object.keys(clientOfferings).length === 0) {
            this.setState({spinner: true});
            return;
        }

        let offerings = clientOfferings.map(offering => {

            const offeringHash = '0x' + new Buffer(offering.hash, 'base64').toString('hex');

            return {
                block: offering.blockNumberUpdated,
                hash: <ModalWindow
                    customClass='shortTableText'
                    modalTitle={t('AcceptOffering')}
                    text={offeringHash}
                    copyToClipboard={true}
                    component={<AcceptOffering offering={offering} />}
                />,
                country: offering.country,
                price: toFixedN({number: (offering.unitPrice / 1e8), fixed: 8}),
                supply: offering.supply,
                availableSupply: offering.currentSupply,
                agent: '0x' + new Buffer(offering.agent, 'base64').toString('hex')
            };
        });

        // get countries list for filter by countries
        let countriesArr = [];
        let countriesAsocArr = [];
        clientOfferings.forEach((offering) => {
            if (countriesAsocArr[offering.country] !== undefined) {
                countriesAsocArr[offering.country].count++;
            } else {
                countriesAsocArr[offering.country] = {
                    name: offering.country,
                    defShow: 0,
                    count: 1
                };
            }
        });

        (Object.keys(countriesAsocArr as any)).forEach((country) => {
            countriesArr.push(countriesAsocArr[country]);
        });

        countriesArr.sort((country1, country2) => {
            return country2.count - country1.count;
        });

        let countriesArrCount = 0;
        let countries = (countriesArr as any).map((country) => {
            countriesArrCount++;
            return {
                name: country.name,
                defShow: countriesArrCount > 5 ? 0 : 1
            };
        });
        const max = clientOfferings.reduce((max, offering) => offering.unitPrice > max ? offering.unitPrice : max, 0);
        const min = clientOfferings.reduce((min, offering) => offering.unitPrice < min ? offering.unitPrice : min, max);
        this.setState({
            spinner: false,
            data: offerings,
            filtered: offerings,
            countries,
            filteredCountries: countries,
            max: max/1e8,
            to: max/1e8,
            min: min/1e8,
            from: min/1e8
        });

        if ('function' === typeof done) {
            done();
        }
    }

    shouldComponentUpdate(nextProps:any, nextState:any) {
        return (this.state.spinner !== nextState.spinner)
            || (this.state.data !== nextState.data)
            || (this.state.changePriceInput !== nextState.changePriceInput)
            || (this.state.showAllCountries !== nextState.showAllCountries)
            || (this.state.filteredCountries !== nextState.filteredCountries)
            || !(isEqual(nextState.filtered, this.state.filtered));
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

        this.setState({
            from, to
        });

        const handler = setTimeout(() => {
            this.filter();
        }, 200);

        if (this.state.handler !== null) {
            clearTimeout(this.state.handler);
        }

        this.setState({handler});
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
            return patt.test(item.name);
        });

        this.setState({
            filteredCountries: filteredCountries
        });
    }

    filterByAgent(e: any){
        const searchText = e.target.value.toLowerCase().trim();
        const agent = searchText.replace(/^0x/, '');
        
        if(agent === ''){
            this.filter();
            return;
        }

        const filtered = this.state.data.filter(item => agent === item.agent.trim().toLowerCase().replace(/^0x/, ''));

        this.setState({filtered});
    }

    filterByCountryHandler(e:any) {
        let checkedCountries = this.state.checkedCountries;
        const country = e.target.value;

        if (e.target.checked && checkedCountries.indexOf(country) === -1) {
            checkedCountries.push(country);
        } else if (!e.target.checked && checkedCountries.indexOf(country) !== -1) {
            checkedCountries.splice(checkedCountries.indexOf(country), 1);
        }

        this.setState({checkedCountries});

        this.filter();
    }

    filter() {
        // filter by price
        let fromEl = document.getElementById('priceFrom') as HTMLInputElement;
        let from = fromEl !== null ? fromEl.value : false;
        let to = (document.getElementById('priceTo') as HTMLInputElement).value;
        let filtered = this.state.data.filter((item) => {
            if (item.price >= from && item.price <= to) {
                return true;
            }
            return false;
        });

        // filter by countries
        const checkedCountries = this.state.checkedCountries;

        if (checkedCountries.length > 0) {
            filtered = filtered.filter((item) => {
                if (checkedCountries.includes(item.country)) {
                    return true;
                }
                return false;
            });
        }

        this.setState({
            filtered: filtered
        });
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
                        <button className='btn btn-default btn-custom waves-effect waves-light' onClick={this.refresh.bind(this, true)}>{t('Refresh')}</button>
                    </div>
                    <div className='col-3'>

                        <div className='card m-b-20'>
                            <div className='card-body'>
                                <div className='form-group row'>
                                    <div className='col-12'>
                                        <label className='control-label'>{t('AgentAddress')}</label>
                                    </div>
                                    <div className='col-md-12 m-t-10 m-b-10'>
                                        <div className='input-group searchInputGroup searchInputGroupVPNList'>
                                            <div className='input-group-prepend'>
                                                <span className='input-group-text'><i className='fa fa-search'></i></span>
                                            </div>
                                            <input className='form-control' type='search' name='agent' placeholder='0x354B10B5c4A96b81b5e4F12F90cd0b7Ae5e05eE6'
                                                   onChange={this.filterByAgent.bind(this)} />
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

                        <div className='card m-t-15 m-b-20'>
                            <h5 className='card-header'>{t('Country')}</h5>
                            <div className='card-body'>
                                {searchHtml}

                                {this.state.filteredCountries.map((country) => {
                                    let countryCheckboxHtml = <div className='checkbox checkbox-custom'>
                                        <input id={country.name}
                                               type='checkbox'
                                               name='checkboxCountry'
                                               value={country.name}
                                               checked={this.state.checkedCountries.indexOf(country.name) !== -1}
                                               onChange={this.filterByCountryHandler.bind(this)} />
                                        <label htmlFor={country.name}>{country.name}</label>
                                    </div>;
                                    if (!this.state.showAllCountries) {
                                        if (country.defShow === 1) {
                                            return countryCheckboxHtml;
                                        }
                                    } else {
                                        return countryCheckboxHtml;
                                    }
                                })}

                                <div className='text-center'>
                                    <button type='button' className='btn btn-link waves-effect'
                                            onClick={this.showCountriesHandler.bind(this)}>{buttonText}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-9'>
                        <div className='card-box'>
                            <div className='bootstrap-table bootstrap-table-sortable table-responsive'>
                                <SortableTable
                                    data={this.state.filtered}
                                    columns={this.state.columns}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>;
    }
}
