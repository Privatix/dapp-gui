import * as React from 'react';
import OfferingView from './offeringView';
import OfferingTools from './offeringTools';

export default function(props:any){

    const offering = JSON.parse(props.match.params.offering);
    return <div className='container-fluid'>
        <div className='row'>
            <div className='col-sm-12 m-b-15'>
                <h3 className='page-title'>Offering</h3>
            </div>
        </div>
        <div className='row'>
            <OfferingView offering={offering} />
            <OfferingTools offering={offering} />
        </div>
    </div>;
}
