import * as React from 'react';

import {Offering} from 'typings/offerings';
import PopupOfferingButton from './popupOfferingButton';
import RemoveOfferingButton from './removeOfferingButton';


interface Props {
    offering: Offering;
    closeModal: Function;
}

export default class OfferingTools extends React.Component<Props, any>{

    render(){

        const { closeModal, offering } = this.props;

        return (
            <div className='col-lg-3 col-md-4'>
                <PopupOfferingButton offering={offering} closeModal={closeModal} />
                <RemoveOfferingButton offering={offering} closeModal={closeModal}/>
            </div>
        );
    }
}
