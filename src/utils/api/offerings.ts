import {fetch} from '../fetch';
import {OfferStatus, Offering} from '../../typings/offerings';
import {SaveAnswer} from '../../typings/SaveAnswer';

export const getOfferings  = async function(id?:string, product?:string, offerStatus?:OfferStatus): Promise<Offering[]>{
    let query = [];
    if (id){ query.push(`id=${id}`);}
    if (product){ query.push(`product=${product}`);}
    if (offerStatus){ query.push(`offerStatus=${offerStatus}`);}
    return fetch('/offerings'+(query.length>0?'?'+query.join('&'):'')) as Promise<Offering[]>;
};


export const changeClientOfferingsStatus = async function(id: string, action: string, account: string, gasPrice: number): Promise<SaveAnswer>{
	return fetch(`/client/offerings/${id}/status`, {
		method: 'put',
		body: {action: action, account: account, gasPrice: gasPrice}
	}) as Promise<SaveAnswer>;
};
