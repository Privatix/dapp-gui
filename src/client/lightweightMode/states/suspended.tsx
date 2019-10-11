import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import SelectCountry from '../selectCountry/';

import { Offering } from 'typings/offerings';

interface SelectItem {
    value: string;
    label: string;
}

interface IProps extends WithTranslation {
    selectedLocation: SelectItem;
    offering: Offering;
    onResume(event: any): void;
}

const translate = withTranslation(['client/simpleMode']);

class Suspended extends React.Component<IProps, {}> {

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

export default translate(Suspended);
