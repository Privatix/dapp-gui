import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import DotProgress from 'common/progressBars/dotProgress';
import StepProgress from 'common/progressBars/stepProgress';

import SelectCountry from '../selectCountry/';

import { Offering } from 'typings/offerings';
import Channel from 'models/channel';

interface SelectItem {
    value: string;
    label: string;
}

interface IProps extends WithTranslation {
    selectedLocation: SelectItem;
    channel: Channel;
    offering: Offering;
    onChangeLocation: Function;
}

const translate = withTranslation(['client/simpleMode']);

class Connecting extends React.Component<IProps, {}> {

    render(){

        const { t, channel, selectedLocation, offering, onChangeLocation } = this.props;

        const steps = ['clientPreChannelCreate'
                      ,'clientAfterChannelCreate'
                      ,'clientEndpointGet'
                      ,'clientPreServiceUnsuspend'
                      ,'completeServiceTransition'
        ];

        return (
            <>
                <div className='content clearfix content-center spacing'>
                    <SelectCountry onSelect={onChangeLocation}
                                   selectedLocation={selectedLocation}
                                   offering={offering}
                                   disabled={true}
                    />
                </div>
                <button type='button' disabled className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'>
                    {t('Connecting')} <DotProgress />
                </button>
                <StepProgress steps={steps} lastDoneStep={ channel && channel.model ? channel.model.job.jobtype : null } />
            </>
        );
    }
}

export default translate(Connecting);
