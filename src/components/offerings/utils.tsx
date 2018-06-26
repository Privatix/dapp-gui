import {fetch} from '../../utils/fetch';
import * as api from '../../utils/api';

export const fetchOfferings = async function(product: string){

    const endpoint = `/offerings/?product=${product === 'all' ? '' : product}`;

    const offeringsRequest = fetch(endpoint, {});
    const products = await api.getProducts();
    let offerings;
    [offerings] = await Promise.all([offeringsRequest]);
    const resolveTable = (products as any).reduce((table, product) => {
        table[product.id] = product.name;
        return table;
    }, {});

    offerings = (offerings as any).map(offering => Object.assign(offering, {productName: resolveTable[offering.product]}));
    return {offerings, products};

};
