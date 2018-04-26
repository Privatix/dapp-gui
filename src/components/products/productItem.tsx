import * as React from 'react';
import { Link } from 'react-router-dom';
// import ProductStatus from './productStatus';

export default function(props:any){
    /*
    const elem = <li>
        <Link to={`/product/${JSON.stringify(props.product)}`}>{props.product.name}</Link> | 
        <Link to={`/offerings/${props.product.id}`}>view offerings</Link> |
        status: <ProductStatus productId={props.product.id} />
    </li>;
   */
    const elem = <tr>
                     <td><Link to={`/product/${JSON.stringify(props.product)}`}>{props.product.name}</Link></td>
                     <td>template</td>
                     <td>endpoint</td>
                     <td>count</td>
                     <td><Link className='btn btn-default waves-effect waves-light' to={`/template/${props.product.offerTplID}`}>Create an Offering</Link></td>
                 </tr>;
    return elem;
}
