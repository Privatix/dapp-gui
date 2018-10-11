export default async function AsyncProductName (offeringId:string){
    const ws = (window as any).ws;

    const offering = await ws.getOffering(offeringId);
    let products = await ws.getProducts();
    products = Array.isArray(products) ? products : [];
    return (products as any).filter(product => product.id === offering.product)[0];
}

export async function GetProductIdByOfferingId (offeringId:string){
    const offering = await (window as any).ws.getOffering(offeringId);
    return offering.product;
}
