import * as React from 'react';
import { translate } from 'react-i18next';

import countryByIso from 'utils/countryByIso';

interface IProps {
    t?: any;
    selectedCountries: string[];
    allCountries: string[];
    onChange(evt: any): void;
    onSearch(evt: any): void;
}

interface IState {
    showAllCountries: boolean;
    defaultShowCountriesCount: number;
}

const translated = translate(['client/vpnList']);

class SelectCountry extends React.Component<IProps, IState>{

    constructor(props: IProps){
        super(props);
        this.state = {
            showAllCountries: false
           ,defaultShowCountriesCount: 5
        };
            
    }

    showCountriesHandler = () => {
        // this.setState({filteredCountries: this.state.countries}); WHY?
        if (this.state.showAllCountries) {
            this.setState({showAllCountries: false});
        } else {
            this.setState({showAllCountries: true});
        }
    }

    render () {

        const { t, selectedCountries, allCountries, onChange, onSearch } = this.props;
        const { showAllCountries, defaultShowCountriesCount } = this.state;

        let searchHtml = null;
        if (showAllCountries) {
            searchHtml = <div className='form-group row'>
                <div className='col-md-12 m-t-10 m-b-10'>
                    <div className='input-group searchInputGroup'>
                        <div className='input-group-prepend'>
                            <span className='input-group-text'><i className='fa fa-search'></i></span>
                        </div>
                        <input className='form-control' type='search' name='search' placeholder={t('Search')}
                               onChange={onSearch} />
                    </div>
                </div>
            </div>;
        }

        const showHideCountriesBtn = allCountries.length > this.state.defaultShowCountriesCount
            ? <div className='text-center'>
                    <button type='button' className='btn btn-link waves-effect'
                            onClick={this.showCountriesHandler}>{showAllCountries ? t('HideBtn') : t('ShowAllBtn')}</button>
                </div>
            : '';

        return (
            <div className='card m-t-15 m-b-20 vpnListCountryFilterBl'>
                <h5 className='card-header'>{t('Country')}</h5>
                <div className='card-body'>
                    {searchHtml}

                    {allCountries.map((country, key) => {
                        let countryCheckboxHtml = <div className='checkbox checkbox-custom' key={country}>
                            <input id={country}
                                   type='checkbox'
                                   name='checkboxCountry'
                                   value={country}
                                   checked={selectedCountries.includes(country)}
                                   onChange={onChange} />
                            <label htmlFor={country}>{countryByIso(country)}</label>
                        </div>;
                        if (showAllCountries || key < defaultShowCountriesCount) {
                            return countryCheckboxHtml;
                        } else {
                            return null;
                        }
                    })}

                    {showHideCountriesBtn}
                </div>
            </div>
        );
    }
}

export default translated(SelectCountry);
