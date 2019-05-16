import * as React from 'react';
import { translate } from 'react-i18next';

import DotProgress from 'common/progressBars/dotProgress';
import StepProgress from 'common/progressBars/stepProgress';

import SelectCountry from '../selectCountry/';

import { ClientChannel } from 'typings/channels';

interface SelectItem {
    value: string;
    label: string;
}

interface IProps {
    t?: any;
    selectedLocation: SelectItem;
    channel: ClientChannel;
}

@translate(['client/simpleMode'])
export default class Disconnecting extends React.Component<IProps, {}> {

    render(){

        const { t, channel, selectedLocation } = this.props;

        const steps = ['completeServiceTransition'
                      ,'clientPreServiceTerminate'
        ];

        return (
            <>
                <div className='content clearfix content-center spacing'>
                    <SelectCountry onSelect={null}
                                   selectedLocation={selectedLocation}
                                   disabled={true}
                    />
                </div>
                <button type='button' disabled className='btn btn-primary btn-custom btn-rounded waves-effect waves-light spacing'>
                    {t('Disconnecting')} <DotProgress />
                </button>
                <StepProgress steps={steps} lastDoneStep={channel.job.jobtype} />
            </>
        );
    }
}