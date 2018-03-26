import * as React from 'react';
import offeringsList from './offeringsList';

export default function(props:any){

    const offeringsSrc = [{title: 'first offering', id: 1}, {title: 'second offering', id: 2}, {title: 'third offering', id: 3}];
    return (
        <div>
          <h3>services workplace</h3>
          <OfferingsList offerings={offeringsSrc} />
        </div>
   );
}
