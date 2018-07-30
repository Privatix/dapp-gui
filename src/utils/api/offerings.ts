import {fetch} from '../fetch';
import {OfferStatus, Offering} from '../../typings/offerings';

export const getOfferings  = async function(id?:string, product?:string, offerStatus?:OfferStatus): Promise<Offering[]>{
    let query = [];
    if (id){ query.push(`id=${id}`);}
    if (product){ query.push(`product=${product}`);}
    if (offerStatus){ query.push(`offerStatus=${offerStatus}`);}
    return fetch('/offerings'+(query.length>0?'?'+query.join('&'):'')) as Promise<Offering[]>;
};
