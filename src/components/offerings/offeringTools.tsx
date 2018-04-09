import * as React from 'react';
import { Link } from 'react-router-dom';
import OfferingToolPublish from './offeringToolPublish';
import OfferingToolPopUp from './offeringToolPopUp';
import OfferingToolDeactivate from './offeringToolDeactivate';
import OfferingToolDublicate from './offeringToolDublicate';

export default function(props:any){

    return <div>
        <OfferingToolPublish offeringId={props.offering.id} /> |
        <OfferingToolPopUp offeringId={props.offering.id} /> |
        <OfferingToolDeactivate offeringId={props.offering.id} /> |
        <OfferingToolDublicate offering={props.offering}/> |
        <Link to={'/'}>back</Link>
    </div>;
}
