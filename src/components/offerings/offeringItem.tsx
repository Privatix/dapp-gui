import * as React from 'react';
import { Link } from 'react-router-dom';
import OfferingStatus from './offeringStatus';

export default function(props:any){
    const elem = <tr>
        <td><Link to={`/offering/${JSON.stringify(props.offering)}/`}>{props.offering.id}</Link></td>
        <td>{props.offering.serviceName}</td>
        <td>[[ server ]]</td>
        <td><OfferingStatus offeringId={props.offering.id} /></td>
        <td>{props.offering.freeUnits}</td>
        <td>{props.offering.maxUnit}</td>
    </tr>;
    return (elem);
}
