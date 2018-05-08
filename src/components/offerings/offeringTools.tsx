import * as React from 'react';
// import { Link } from 'react-router-dom';
// import OfferingToolPublish from './offeringToolPublish';
import OfferingToolPopUp from './offeringToolPopUp';
import OfferingToolRemove from './offeringToolRemove';
// import OfferingToolDeactivate from './offeringToolDeactivate';
// import OfferingToolDublicate from './offeringToolDublicate';


/*
        <OfferingToolPublish offeringId={props.offering.id} /> |
        <OfferingToolDeactivate offeringId={props.offering.id} /> |
        <OfferingToolDublicate offering={props.offering}/> |
*/

export default function(props:any){

    return <div className='col-lg-3 col-md-4'>
        <div className='card m-b-20 card-body text-xs-center cardHoverBgWarning'>
            <form>
                <h5 className='card-title'>Warning Area</h5>
                <p className='card-text'>A click on an update will pop up your offering in the blockchain. You need to pay a gas to perform this operation</p>
                <p className='text-center'><OfferingToolPopUp offeringId={props.offering.id} /></p>
            </form>
        </div>
        <div className='card m-b-20 card-body text-xs-center cardHoverBgDanger'>
            <form>
                <h5 className='card-title'>Warning Area</h5>
                <p className='card-text'>This operation will remove the offering from SOMC</p>
                <p className='text-center'><OfferingToolRemove offeringId={props.offering.id} /></p>
            </form>
        </div>
    </div>;
}
