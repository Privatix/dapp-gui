import * as React from 'react';
import { translate } from 'react-i18next';

import SelectCountry from '../selectCountry';
import DotProgress from 'common/progressBars/dotProgress';

interface SelectItem {
    value: string;
    label: string;
}

interface IProps {
    t?: any;
    locations: SelectItem[];
    selectedLocation: SelectItem;
    onChangeLocation: Function;
}

@translate(['client/simpleMode'])
export default class PingLocations extends React.Component<IProps, {}> {

    render(){

        const { t, locations, selectedLocation, onChangeLocation } = this.props;

        if(!locations || !locations.length){
            return (
                <div className='text-center m-t-15 m-b-15 spacing'>
                    <div className='lds-dual-ring'></div>
                </div>
            );
        }

        return (
            <>
                <div className='content clearfix content-center spacing'>
                    <SelectCountry onSelect={onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   locations={locations}
                    />
                </div>
                <button type='button' disabled className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'>
                    {t('Connect')}
                </button>
                <div className='spacing'>
                    <div style={ {margin: '10px'} }>{t('SearchingTheOptimalNode')} <DotProgress /></div>
                    <div style={ {margin: '10px'} }>
                        <i className='fa fa-circle-o-notch fa-spin' style={ {fontSize: '28px'} }></i>
                    </div>
                </div>
            </>
        );
    }
}
