import * as React from 'react';

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

export default function(props:any){

    return <div className='col-lg-3 col-md-4'>
        <div className='card m-b-20 card-body text-xs-center'>
            <form>
                <p className='card-text'>A click on an update will pop up your offering in the blockchain. You need to pay a gas to perform this operation</p>
                <ConfirmPopupSwal
                    endpoint={`/offerings/${props.offering.id}/status`}
                    options={{method: 'put', body: {action: 'popup'}}}
                    title={'Popup'}
                    text={<span>This operation will pop up your offering in the blockchain.<br />
                        You need to pay a gas from your ETH account to perform this operation.</span>}
                    class={'btn btn-primary btn-custom btn-block'}
                    swalType='warning'
                    swalConfirmBtnText='Yes, pop up it!'
                    swalTitle='Are you sure?' />
            </form>
        </div>
        <div className='card m-b-20 card-body text-xs-center warningAreaCard'>
            <form>
                <h5 className='card-title'>Warning Area</h5>
                <p className='card-text'>This operation will remove the offering from SOMC</p>
                <ConfirmPopupSwal
                    endpoint={`/offerings/${props.offering.id}/status`}
                    options={{method: 'put', body: {action: 'remove'}}}
                    title={'Remove'}
                    text={<span>This operation will permanently remove the offering from SOMC.<br />
                        You can't undo this.</span>}
                    class={'btn btn-danger btn-custom btn-block'}
                    swalType='danger'
                    swalConfirmBtnText='Yes, remove it!'
                    swalTitle='Are you sure?' />
            </form>
        </div>
    </div>;
}
