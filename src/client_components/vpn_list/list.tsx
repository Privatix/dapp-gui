import * as React from 'react';
// import {asyncReactor} from 'async-reactor';
import SortableTable from 'react-sortable-table';
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import * as _ from 'lodash';

export default class AsyncList extends React.Component<any,any> {
    constructor(props:any) {
        super(props);

        const data = [
            {
                id: '1111',
                country: 'Canada',
                price: 0.05,
                publishTime: '31.05.2018'
            },
            {
                id: '3333',
                country: 'Germany',
                price: 0.33,
                publishTime: '19.04.2018'
            },
            {
                id: '2224',
                country: 'Netherlands',
                price: 0.12,
                publishTime: '01.06.2018'
            },
            {
                id: '74543',
                country: 'Germany',
                price: 0.65,
                publishTime: '18.05.2018'
            }
        ];

        const countries = [
            {
                name: 'Afganistan',
                defShow: 0
            },
            {
                name: 'Albania',
                defShow: 0
            },
            {
                name: 'Canada',
                defShow: 1
            },
            {
                name: 'Germany',
                defShow: 1
            },
            {
                name: 'Japan',
                defShow: 1
            },
            {
                name: 'Netherlands',
                defShow: 1
            },
            {
                name: 'Romania',
                defShow: 1
            },
            {
                name: 'Russia',
                defShow: 0
            }
        ];

        this.state = {
            from: 0,
            to: 1,
            spinner: true,
            changePriceInput: false,
            data,
            countries,
            filteredCountries: countries.slice(),
            // defCountries,
            showAllCountries: false,
            filtered: data.slice(),
            columns: [
                {
                    header: 'Id',
                    key: 'id'
                },
                {
                    header: 'Country',
                    key: 'country'
                },
                {
                    header: 'Price (PRIX/Mb)',
                    key: 'price'
                },
                {
                    header: 'Publish time',
                    key: 'publishTime'
                }
            ]
        };

        setTimeout(() => {
            this.setState({
                spinner: false
            });
        }, 3000);

    }

    shouldComponentUpdate(nextProps:any, nextState:any) {
        return (this.state.spinner !== nextState.spinner)
            || (this.state.changePriceInput !== nextState.changePriceInput)
            || (this.state.showAllCountries !== nextState.showAllCountries)
            || (this.state.filteredCountries !== nextState.filteredCountries)
            || !(_.isEqual(nextState.filtered, this.state.filtered));
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

    filterByCountryHandler() {
        this.filter();
    }

    filter() {
        // filter by price
        let from = (document.getElementById('priceFrom') as HTMLInputElement).value;
        let to = (document.getElementById('priceTo') as HTMLInputElement).value;
        let filtered = this.state.data.filter((item) => {
            if (item.price >= from && item.price <= to) {
                return true;
            }
            return false;
        });

        // filter by countries
        const checkedCountries = document.querySelectorAll('input[name=checkboxCountry]:checked');
        let checkedCountriesArr = [];
        for (let i = 0; i < checkedCountries.length; i++) {
            checkedCountriesArr.push((checkedCountries[i] as HTMLInputElement).value);
        }

        if (checkedCountriesArr.length > 0) {
            filtered = filtered.filter((item) => {
                if (checkedCountriesArr.includes(item.country)) {
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
        const createSliderWithTooltip = Slider.createSliderWithTooltip;
        const Range = createSliderWithTooltip(Slider.Range);

        let buttonText = 'show all...';
        let searchHtml = null;
        if (this.state.showAllCountries) {
            buttonText = 'hide';
            searchHtml = <div className='form-group row'>
                <div className='col-md-12 m-t-10 m-b-10'>
                    <div className='input-group searchInputGroup'>
                        <div className='input-group-prepend'>
                            <span className='input-group-text'><i className='fa fa-search'></i></span>
                        </div>
                        <input className='form-control' type='search' name='search' placeholder='search'
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
                                <p className='font-25'>Please, wait for downloading....</p>
                                <div className='text-center m-t-15 m-b-15'>
                                    <div className='lds-dual-ring'></div>
                                </div>
                                <p className='m-b-0'>Currently, we are downloading VPN list.</p>
                                <p>It takes time only on the first run.</p>
                                <p className='m-t-15'>An average time for downloading ap. 2-5 min.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        :
        <div className='container-fluid'>
            <div className='row m-t-20'>
                <div className='col-3'>
                    <div className='card m-b-20'>
                        <div className='card-body'>
                            <h6 className='card-title'>Price (PRIX/Mb):</h6>
                            <div className='form-group row'>
                                <div className='col-6'>
                                    <div className='input-group'>
                                        <div className='input-group-prepend'>
                                            <span className='input-group-text' id='priceFromLabel'>from</span>
                                        </div>
                                        <input type='number' step='0.01' className='form-control' placeholder='0'
                                               id='priceFrom' value={this.state.from} onChange={(e) => this.changeMinPriceInput(e)} />
                                    </div>
                                </div>
                                <div className='col-6'>
                                    <div className='input-group'>
                                        <div className='input-group-prepend'>
                                            <span className='input-group-text' id='priceToLabel'>to</span>
                                        </div>
                                        <input type='number' step='0.01' className='form-control' placeholder='1'
                                               id='priceTo' value={this.state.to} onChange={(e) => this.changeMaxPriceInput(e)} />
                                    </div>
                                </div>
                            </div>
                            <div className='row m-t-30'>
                                <div className='col-12'>
                                    <Range defaultValue={[this.state.from, this.state.to]} min={0} max={1} step={0.01}
                                           onChange={this.changeRange.bind(this)} allowCross={false}/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='card m-t-15 m-b-20'>
                        <h5 className='card-header'>Country</h5>
                        <div className='card-body'>
                            {searchHtml}

                            {this.state.filteredCountries.map((country) => {
                                let countryCheckboxHtml = <div className='checkbox checkbox-custom'>
                                    <input id={country.name} type='checkbox' name='checkboxCountry' value={country.name}
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
                        <div className='bootstrap-table bootstrap-table-sortable'>
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
