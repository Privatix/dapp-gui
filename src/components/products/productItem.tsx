import * as React from 'react';
// import { Link } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
import {asyncReactor} from 'async-reactor';
import ModalWindow from '../modalWindow';
import CreateOffering from '../offerings/createOffering';
import Product from './product';

function Loader() {

  return (<h2>Loading product info ...</h2>);

}

async function AsyncProductItem(props:any){

    const offerings = await fetch(`/offerings?product=${props.product.id}`, {method: 'GET'});
    const offerTemplates = await fetch(`/templates?id=${props.product.offerTplID}`, {method: 'get'});
    const offerTemplate = offerTemplates[0];
    offerTemplate.raw = JSON.parse(atob(offerTemplate.raw));

    const accessTemplates = await fetch(`/templates?id=${props.product.offerAccessID}`, {method: 'get'});
    const accessTemplate = accessTemplates[0];
    accessTemplate.raw = JSON.parse(atob(accessTemplate.raw));

    const elem = <tr>
                     {/*<td><Link to={`/product/${JSON.stringify(props.product)}`}>{props.product.name}</Link></td>*/}
                     <td><ModalWindow customClass='' modalTitle='Server info' text={props.product.name} component={<Product product={props.product} />} /></td>
                     <td>{offerTemplate.raw.schema.title}</td>
                     <td>{accessTemplate.raw.schema.title}</td>
                     <td>{(offerings as any).length}</td>
                     <td><ModalWindow customClass='btn btn-default btn-custom waves-effect waves-light' modalTitle='Create offering' text='Create an offering' component={<CreateOffering />} /></td>
                 </tr>;
    return elem;
}

export default asyncReactor(AsyncProductItem, Loader);
