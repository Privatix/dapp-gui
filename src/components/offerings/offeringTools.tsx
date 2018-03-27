import * as React from 'react';
import OfferingToolPopUp from './offeringToolPopUp';
import OfferingToolDeactivate from './offeringToolDeactivate';
import OfferingToolDublicate from './offeringToolDublicate';

export default function(props:any){

    return <div>
        <OfferingToolPopUp offeringId={props.offering.id} />
        <OfferingToolDeactivate offeringId={props.offering.id} />
        <OfferingToolDublicate offering={props.offering}/>
    </div>;
}
