import * as React from 'react';
import { translate } from 'react-i18next';

import JobName from 'common/badges/jobName';
import DotProgress from 'common/etc/dotProgress';

import SelectCountry from '../selectCountry';

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

        const currentStep = function(step: string){
            const i = steps.indexOf(step);
            return i !== -1 ? i + 1 : 0;
        };

        const step = channel ? currentStep(channel.job.jobtype) : 0;
        const percentage = Math.floor(step * 100/steps.length);

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
                <progress
                    style={ {marginLeft: 'auto', marginRight: 'auto', width: '300px', height: '10px', display: 'block'} }
                    className='wow animated progress-animated spacing'
                    value={percentage}
                    max={100}
                />
                <br />
                <JobName className='text-muted' jobtype={channel.job.jobtype} />
            </>
        );
    }
}
