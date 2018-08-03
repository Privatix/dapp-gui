import * as React from 'react';
import { connect } from 'react-redux';
import {asyncProviders} from '../../redux/actions';
import {State} from '../../typings/state';
import {Offering} from '../../typings/offerings';

// import OfferingToolPublish from './offeringToolPublish';
// import OfferingToolPopUp from './offeringToolPopUp';
// import OfferingToolRemove from './offeringToolRemove';
// import OfferingToolDublicate from './offeringToolDublicate';
// import OfferingToolDeactivate from './offeringToolDeactivate';

import ConfirmPopupSwal from '../confirmPopupSwal';

/*
        <OfferingToolPublish offeringId={props.offering.id} /> |
        <OfferingToolDeactivate offeringId={props.offering.id} /> |
        <OfferingToolDublicate offering={props.offering}/> |
*/

interface Props {
    offering: Offering;
    challengePeriod: number;
    dispatch: any;
}

class OfferingTools extends React.Component<Props, any>{

    constructor(props:any){
        super(props);
    }

    componentDidMount() {
        this.update();
    }

    update(){
        this.props.dispatch(asyncProviders.updateSettings());
    }

    render(){

        const popupInfo = 'This operation will notify Clients that your offering is actual, improving your chances for a deal.';
        const removeInfo = `This operation will permanently remove offering. You will receive your deposit back. Clients will not be able to accept it anymore. Offering can be removed only, if it is inactive for ${Math.floor(this.props.challengePeriod/4)} past minutes.`;

        return <div className='col-lg-3 col-md-4'>
            <div className='card m-b-20 card-body text-xs-center'>
                <p className='card-text'>{popupInfo}</p>
                <ConfirmPopupSwal
                    endpoint={`/offerings/${this.props.offering.id}/status`}
                    options={{method: 'put', body: {action: 'popup'}}}
                    title={'Popup'}
                    text={<span>{popupInfo}</span>}
                    class={'btn btn-primary btn-custom btn-block'}
                    swalType='warning'
                    swalConfirmBtnText='Yes, pop up it!'
                    swalTitle='Are you sure?' />
            </div>
            <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
                <h5 className='card-title'>Warning Area</h5>
                <p className='card-text'>{removeInfo}</p>
                <ConfirmPopupSwal
                    endpoint={`/offerings/${this.props.offering.id}/status`}
                    options={{method: 'put', body: {action: 'remove'}}}
                    title={'Remove'}
                    text={<span>{removeInfo}<br />
                        Would you like to proceed?</span>}
                    class={'btn btn-danger btn-custom btn-block'}
                    swalType='danger'
                    swalConfirmBtnText='Yes, remove it!'
                    swalTitle='Are you sure?' />
            </div>
        </div>;
    }
}

export default connect( (state: State) => {
    const challengePeriod = state.settings.find(setting => setting.key === 'eth.challenge.period');
    return {challengePeriod: challengePeriod ? parseInt(challengePeriod.value, 10) : 0};
} )(OfferingTools);
