import * as React from 'react';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';
import Product from './product';


function Loader() {

  return (<h2>Loading product ...</h2>);

}

async function AsyncProducts(props:any){
    const endpoint = '/products';
    const products = await fetch(endpoint, {method: 'GET'});
    const product = (products as any).filter(product => product.id === props.match.params.productId)[0];
    return (
        <Product src={JSON.stringify(product)} />
    );
}

export default asyncReactor(AsyncProducts, Loader);
