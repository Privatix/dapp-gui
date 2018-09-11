import {fetch} from '../fetch';
import {OfferStatus, Offering} from '../../typings/offerings';
import {SaveAnswer, AddAnswer} from '../../typings/SaveAnswer';

export const getOfferings  = async function(id?:string, product?:string, offerStatus?:OfferStatus): Promise<Offering[]>{
    let query = [];
    if (id){ query.push(`id=${id}`);}
    if (product){ query.push(`product=${product}`);}
    if (offerStatus){ query.push(`offerStatus=${offerStatus}`);}
    return fetch('/offerings'+(query.length>0?'?'+query.join('&'):'')) as Promise<Offering[]>;
};

export const addOffering = async function(offering: object): Promise<AddAnswer> {
	return fetch('/offerings/', {method: 'post', body: offering}) as Promise<AddAnswer>;
};

export const changeOfferingStatus = async function(id: string, action: string, gasPrice: number): Promise<SaveAnswer>{
	return fetch(`/offerings/${id}/status`, {method: 'put', body: {action: action, gasPrice: gasPrice}}) as Promise<SaveAnswer>;
};

export const changeClientOfferingsStatus = async function(id: string, action: string, account: string, gasPrice: number, deposit: number): Promise<SaveAnswer>{
	return fetch(`/client/offerings/${id}/status`, {
		method: 'put',
		body: {action, account, gasPrice, deposit}
	}) as Promise<SaveAnswer>;
};

export const getClientOfferingById = function(offeringId: string): Promise<Offering>{
    return (fetch(`/client/offerings/?id=${offeringId}`) as Promise<Offering[]>)
        .then(offerings => offerings.length ? offerings[0] : null);
};
