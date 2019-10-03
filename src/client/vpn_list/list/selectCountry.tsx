import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import countryByIso from 'utils/countryByIso';

interface IProps extends WithTranslation {
    selectedCountries: string[];
    allCountries: string[];
    searchStr: string;
    onChange(evt: any): void;
    onSearch(evt: any): void;
}

interface IState {
    showAllCountries: boolean;
    defaultShowCountriesCount: number;
}

const translated = withTranslation(['client/vpnList']);

class SelectCountry extends React.Component<IProps, IState>{

    constructor(props: IProps){
        super(props);
        this.state = {
            showAllCountries: false
           ,defaultShowCountriesCount: 5
        };
            
    }

    showCountriesHandler = () => {
        this.setState({showAllCountries: !this.state.showAllCountries});
    }

    render () {

        const { t, selectedCountries, allCountries, searchStr, onChange, onSearch } = this.props;
        const { showAllCountries, defaultShowCountriesCount } = this.state;

        let searchHtml = null;
        if (showAllCountries) {
            searchHtml = <div className='form-group row'>
                <div className='col-md-12 m-t-10 m-b-10'>
                    <div className='input-group searchInputGroup'>
                        <div className='input-group-prepend'>
                            <span className='input-group-text'><i className='fa fa-search'></i></span>
                        </div>
                        <input type='search'
                               name='search'
                               className='form-control'
                               placeholder={t('Search')}
                               value={searchStr}
                               onChange={onSearch}
                       />
                    </div>
                </div>
            </div>;
        }

        const showHideCountriesBtn = allCountries.length > this.state.defaultShowCountriesCount
            ? <div className='text-center'>
                    <button type='button' className='btn btn-link waves-effect'
                            onClick={this.showCountriesHandler}>{showAllCountries ? t('HideBtn') : t('ShowAllBtn')}</button>
                </div>
            : null;

        return (
            <div className='card m-t-15 m-b-20 vpnListCountryFilterBl'>
                <h5 className='card-header'>{t('Country')}</h5>
                <div className='card-body'>
                    {searchHtml}

                    {(showAllCountries ? allCountries : allCountries.slice(0, defaultShowCountriesCount)).map(country => (
                        <div className='checkbox checkbox-custom' key={country}>
                            <input id={country}
                                   type='checkbox'
                                   name='checkboxCountry'
                                   value={country}
                                   checked={selectedCountries.includes(country)}
                                   onChange={onChange} />
                            <label htmlFor={country}>{countryByIso(country)}</label>
                        </div>
                    ))}

                    {showHideCountriesBtn}
                </div>
            </div>
        );
    }
}

export default translated(SelectCountry);
