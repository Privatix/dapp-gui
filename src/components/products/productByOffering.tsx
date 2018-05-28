import {fetch} from '../../utils/fetch';

export default async function AsyncProductName (offeringId:string){

    const endpoint = `/offerings?id=${offeringId}`;
    const offerings = await fetch(endpoint, {method: 'GET'});
    const products = await fetch(`/products?`, {method: 'GET'});
    return (products as any).filter(product => product.id === offerings[0].product)[0];
}
