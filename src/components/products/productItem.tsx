import * as React from 'react';
// import { Link } from 'react-router-dom';
import {fetch} from '../../utils/fetch';
import {asyncReactor} from 'async-reactor';
import { withRouter } from 'react-router-dom';
import ModalWindow from '../modalWindow';
import CreateOffering from '../offerings/createOffering';
import Product from './product';

function Loader() {

  return (<h2>Loading server info ...</h2>);

}

async function AsyncProductItem(props:any){

    const templates = await fetch(`/templates`, {method: 'GET'});
    const offerings = await fetch(`/offerings/?product=${props.product.id}`, {method: 'GET'});
    console.log(templates, offerings);
    let offerTemplate;
    let accessTemplate;
    if((templates as any).length){
        (templates as any).forEach(template => {
            if(template.kind === 'offer'){
                offerTemplate = template;
            }
        });
        (templates as any).forEach(template => {
            if(template.kind === 'access'){
                accessTemplate = template;
            }
        });
        offerTemplate.raw = JSON.parse(atob(offerTemplate.raw));
        accessTemplate.raw = JSON.parse(atob(accessTemplate.raw));

    }

    const onOfferingCreated = function(){
        props.history.push('/offerings/all');
    };

    const elem = <tr>
                     {/*<td><Link to={`/product/${JSON.stringify(props.product)}`}>{props.product.name}</Link></td>*/}
                     <td>{ <ModalWindow customClass='' modalTitle='Server info' text={props.product.name} component={<Product product={props.product} />} /> }</td>
                     <td>{offerTemplate.raw.schema.title}</td>
                     <td>{accessTemplate.raw.title}</td>
                     <td>{(offerings as any).length ? (offerings as any).length : 0}</td>
                     <td>{<ModalWindow customClass='btn btn-default btn-custom waves-effect waves-light' modalTitle='Create offering' text='Create an offering' component={<CreateOffering product={props.product.id} done={onOfferingCreated}/>} />}</td>
                 </tr>;
                 console.log(elem);
    return elem;
}

export default withRouter(asyncReactor(AsyncProductItem, Loader));
