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
    locations: SelectItem[];
    selectedLocation: SelectItem;
    offering: Offering;
    onChangeLocation: Function;
    onConnect(event: any): void;
}

@translate(['client/simpleMode'])
export default class Disconnected extends React.Component<IProps, {}> {

    render(){

        const { t, locations, selectedLocation, offering, onChangeLocation, onConnect } = this.props;

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
                                   offering={offering}
                    />
                </div>
                <button type='button'
                        className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'
                        disabled={!offering}
                        onClick={onConnect}
                >
                    {t('Connect')}
                </button>
            </>
        );
    }
}
