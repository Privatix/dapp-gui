import * as React from 'react';
import {fetch} from 'utils/fetch';
import {asyncReactor} from 'async-reactor';

function Loader() {

  return (<h2>Loading sessions ...</h2>);

}

async function AsyncProductName (props:any){
    // console.log(new Date(Date.parse(props.time)));
    const endpoint = `/offerings?id=${props.offeringId}`;
    const offerings = await fetch(endpoint, {method: 'GET'});
    const products = await fetch(`/products?`, {method: 'GET'});
    const product = (products as any).filter(product => product.id = offerings[0].product)[0];
    console.log('PRODUCT NAME!!!', offerings, products, product);
    return <span>{product.name}</span>;
}

export default asyncReactor(AsyncProductName, Loader);
