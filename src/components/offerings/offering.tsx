import * as React from 'react';
import OfferingView from './offeringView';
import OfferingTools from './offeringTools';

export default function(props:any){

    const offering = props.offering;

    return <div className='container-fluid'>
        <div className='row'>
            <OfferingView offering={offering} />
            <OfferingTools offering={offering} />
        </div>
    </div>;
}
