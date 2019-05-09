import * as React from 'react';

import JobName from 'common/badges/jobName';

interface IProps {
    steps: string[];
    lastDoneStep: string;
}

export default class StepsProgress extends React.Component<IProps, {}> {

    lastDoneStepIndex(){
        const { steps, lastDoneStep } = this.props;
        const i = steps.indexOf(lastDoneStep);
        return i !== -1 ? i + 1 : 0;
    }

    currentStepName(){
        const { steps, lastDoneStep } = this.props;
        const i = steps.indexOf(lastDoneStep);
        switch(true){
            case i === -1 :
                return steps[0];
            case  i === steps.length :
                return lastDoneStep;
            default:
                return steps[i+1];
        }
    }

    render(){

        const { steps, lastDoneStep } = this.props;

        const currentStepIndex = lastDoneStep ? this.lastDoneStepIndex() + 1 : 1;
        const percentage = Math.floor(currentStepIndex * 100/steps.length);

        return(
            <>
                <progress
                    style={ {marginLeft: 'auto', marginRight: 'auto', width: '300px', height: '10px', display: 'block'} }
                    className='wow animated progress-animated spacing'
                    value={percentage}
                    max={100}
                />
                <JobName className='text-muted spacing' jobtype={lastDoneStep ? this.currentStepName() : steps[0]} />
            </>
        );
    }
}
