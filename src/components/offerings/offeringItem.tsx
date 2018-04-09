import * as React from 'react';
import { Link } from 'react-router-dom';
import OfferingStatus from './offeringStatus';

export default function(props:any){
    const elem = <li>
        <Link to={`/offering/${JSON.stringify(props.offering)}`}>Service: {props.offering.serviceName}</Link> | 
        <Link to={`/channels/${props.offering.id}`}>view channels</Link>
        | <OfferingStatus offeringId={props.offering.id} />
    </li>;
    return (elem);
}
