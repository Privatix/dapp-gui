import * as React from 'react';
import OfferingView from './offeringView';
import OfferingTools from './offeringTools';

export default function(props:any){

    const offering = JSON.parse(props.match.params.offering);
    return <div>
        <OfferingView offering={offering} /><hr />
        <OfferingTools offering={offering} />
    </div>;
}
