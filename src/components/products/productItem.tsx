import * as React from 'react';
import { Link } from 'react-router-dom';
import ProductStatus from './productStatus';

export default function(props:any){
    const elem = <li>
        <Link to={`/product/${props.product.id}`}>{props.product.title}</Link> | 
        <Link to={`/offerings/${props.product.id}`}>view offerings</Link>
        <ProductStatus productId={props.product.id} />
    </li>;
    return (elem);
}
