import * as React from 'react';
import { Link } from 'react-router-dom';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<h2>Loading product info ...</h2>);

}

async function AsyncProductItem(props:any){

    const offerings = await fetch(`/offerings?product=${props.product.id}`, {method: 'GET'});
    const offerTemplates = await fetch(`/templates?id=${props.product.offerTplID}`, {method: 'get'});
    const offerTemplate = offerTemplates[0];
    offerTemplate.raw = JSON.parse(atob(offerTemplate.raw));
    console.log(offerTemplate);
    const accessTemplates = await fetch(`/templates?id=${props.product.offerAccessID}`, {method: 'get'});
    const accessTemplate = accessTemplates[0];
    accessTemplate.raw = JSON.parse(atob(accessTemplate.raw));
    console.log(offerTemplate, accessTemplate);
    const elem = <tr>
                     <td><Link to={`/product/${JSON.stringify(props.product)}`}>{props.product.name}</Link></td>
                     <td>{offerTemplate.raw.schema.title}</td>
                     <td>{accessTemplate.raw.schema.title}</td>
                     <td>{(offerings as any).length}</td>
                     <td><Link className='btn btn-default waves-effect waves-light btn-block' to={'/createOffering'}>Create an Offering</Link></td>
                 </tr>;
    return elem;
}

export default asyncReactor(AsyncProductItem, Loader);
