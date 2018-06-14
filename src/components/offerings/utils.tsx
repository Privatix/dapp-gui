import {fetch} from '../../utils/fetch';

export const fetchOfferings = async function(product: string){

    const endpoint = `/offerings/?product=${product === 'all' ? '' : product}`;

    const offeringsRequest = fetch(endpoint, {});
    const productsRequest = fetch('/products', {});
    let offerings, products;
    [offerings, products] = await Promise.all([offeringsRequest, productsRequest]);
    const resolveTable = (products as any).reduce((table, product) => {
        table[product.id] = product.name;
        return table;
    }, {});

    offerings = (offerings as any).map(offering => Object.assign(offering, {productName: resolveTable[offering.product]}));
    return {offerings, products};

};
