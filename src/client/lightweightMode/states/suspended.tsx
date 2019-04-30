import * as React from 'react';
import { translate } from 'react-i18next';

import SelectCountry from '../selectCountry';

import { Offering } from 'typings/offerings';

interface SelectItem {
    value: string;
    label: string;
}

interface IProps {
    t?: any;
    selectedLocation: SelectItem;
    offering: Offering;
    onResume(event: any): void;
}

@translate(['client/simpleMode'])
export default class Suspended extends React.Component<IProps, {}> {

    render(){

        const { t, selectedLocation, offering, onResume } = this.props;

        return (
            <>
                <div className='content clearfix content-center spacing'>
                    <SelectCountry onSelect={null}
                                   selectedLocation={selectedLocation}
                                   offering={offering}
                                   disabled={true}
                    />
                </div>
                <button type='button' onClick={onResume} className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'>
                    {t('Resume')}
                </button>
            </>
        );
    }
}
