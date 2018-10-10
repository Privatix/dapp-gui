import {fetch} from '../fetch';
import {Offering} from '../../typings/offerings';
import {SaveAnswer} from '../../typings/SaveAnswer';

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
