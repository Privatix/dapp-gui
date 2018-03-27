import * as React from 'react';
import OfferingView from './offeringView';
import OfferingTools from './offeringTools';

export default function(props:any){

    const offering = JSON.parse(props.match.params.offering);
    return <div>
        offering view<br />
        <OfferingView offering={offering} /><hr />
        offering toolbar<br />
        <OfferingTools offering={offering} />
    </div>;
}
