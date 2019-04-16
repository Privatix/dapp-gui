import * as React from 'react';
import Select from 'react-select';

import SelectCountryOption from './selectCountryOption';
import SelectCountryValue from './selectCountryValue';
import OfferingInfo from './offeringInfo';

export default class SelectCountry extends React.Component<any, any> {

    render(){

        const {selectedLocation, locations, onSelect, disabled} = this.props;

        return (
            <div style={ {margin: 'auto', width: '300px'} }>
                <Select className='form-control btn btn-white'
                        value={selectedLocation}
                        valueRenderer={SelectCountryValue}
                        searchable={false}
                        clearable={false}
                        options={locations}
                        onChange={onSelect}
                        optionComponent={SelectCountryOption}
                        disabled={disabled}
                />
                <OfferingInfo offering={selectedLocation ? selectedLocation.offering : null} />
            </div>
        );
    }
}
