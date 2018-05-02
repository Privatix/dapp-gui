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

    return <div>
        <form>
        <fieldset>
            <legend>Warning Area</legend>
            <label>A click on an update will pop up your offering in the blockchain. You need to pay a gas to perform this operation
            <OfferingToolPopUp offeringId={props.offering.id} /></label>
        </fieldset>
        </form>
        <form>
        <fieldset>
            <legend>Warning Area</legend>
            <label>This operation will remove the offering from SOMC
            <OfferingToolRemove offeringId={props.offering.id} /></label>
        </fieldset>
        </form>
    </div>;
}
