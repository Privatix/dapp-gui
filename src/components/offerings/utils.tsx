export const fetchOfferings = async function(product: string){
    const ws = (window as any).ws;

    const products = await ws.getProducts();
    let offerings = await ws.getAgentOfferings(product === 'all' ? '' : product);
    const resolveTable = (products as any).reduce((table, product) => {
        table[product.id] = product.name;
        return table;
    }, {});

    offerings = offerings.items.map(offering => Object.assign(offering, {productName: resolveTable[offering.product]}));
    return {offerings, products};

};
