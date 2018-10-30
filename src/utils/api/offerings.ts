import {fetch} from '../fetch';
import {SaveAnswer} from '../../typings/SaveAnswer';

export const changeClientOfferingsStatus = async function(id: string, action: string, account: string, gasPrice: number, deposit: number): Promise<SaveAnswer>{
	return fetch(`/client/offerings/${id}/status`, {
		method: 'put',
		body: {action, account, gasPrice, deposit}
	}) as Promise<SaveAnswer>;
};
