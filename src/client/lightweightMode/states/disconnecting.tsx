import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import DotProgress from 'common/progressBars/dotProgress';
import StepProgress from 'common/progressBars/stepProgress';

import SelectCountry from '../selectCountry/';

import Channel from 'models/channel';

interface SelectItem {
    value: string;
    label: string;
}

interface IProps extends WithTranslation {
    selectedLocation: SelectItem;
    channel: Channel;
}

const translate = withTranslation(['client/simpleMode']);

class Disconnecting extends React.Component<IProps, {}> {

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
                <StepProgress steps={steps} lastDoneStep={channel.model.job.jobtype} />
            </>
        );
    }
}

export default translate(Disconnecting);
