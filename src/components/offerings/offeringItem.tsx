import * as React from 'react';
import { Link } from 'react-router-dom';
import LinkToProductByOfferingId from '../products/linkToProductByOfferingId';
import ProductNameByOffering from '../products/productNameByOffering';
import OfferingStatus from './offeringStatus';

export default function(props:any){
    const elem = <tr>
        <td><Link to={`/offering/${JSON.stringify(props.offering)}/`}>{props.offering.id}</Link></td>
        <td>{props.offering.serviceName}</td>
        <td><LinkToProductByOfferingId offeringId={props.offering.id} ><ProductNameByOffering offeringId={props.offering.id} /></LinkToProductByOfferingId></td>
        <td><OfferingStatus offeringId={props.offering.id} /></td>
        <td>{props.offering.freeUnits}</td>
        <td>{props.offering.maxUnit}</td>
    </tr>;
    return (elem);
}
