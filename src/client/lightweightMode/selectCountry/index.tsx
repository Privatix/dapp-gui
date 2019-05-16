import * as React from 'react';
import { translate } from 'react-i18next';
import Select from 'react-select';

import SelectCountryOption from './option';
import SelectCountryValue from './value';
import OfferingInfo from './offeringInfo';

import { Offering } from 'typings/offerings';

interface SelectItem {
    value: string;
    label: string;
}

interface IProps {
    t?: any;
    selectedLocation?: SelectItem;
    locations?: SelectItem[];
    offering?: Offering;
    onSelect: Function;
    disabled?: boolean;
}

@translate(['client/simpleMode'])
export default class SelectCountry extends React.Component<IProps, {}> {

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