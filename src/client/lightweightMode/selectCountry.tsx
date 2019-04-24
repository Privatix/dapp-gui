import * as React from 'react';
import { translate } from 'react-i18next';
import Select from 'react-select';

import SelectCountryOption from './selectCountryOption';
import SelectCountryValue from './selectCountryValue';
import OfferingInfo from './offeringInfo';


@translate(['client/simpleMode'])
export default class SelectCountry extends React.Component<any, {}> {

    render(){

        const { t, selectedLocation, locations, offering, onSelect, disabled} = this.props;

        return (
            <div style={ {margin: 'auto', width: '300px'} }>
                <Select className='form-control btn btn-white'
                        wrapperStyle={ {padding: '0px'} }
                        placeholder={t('selectCountry')}
                        value={selectedLocation}
                        valueRenderer={SelectCountryValue}
                        searchable={false}
                        clearable={false}
                        options={locations}
                        onChange={onSelect}
                        optionComponent={SelectCountryOption}
                        disabled={disabled}
                />
                <OfferingInfo offering={offering} />
            </div>
        );
    }
}
