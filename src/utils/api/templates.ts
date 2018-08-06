import {fetch} from '../fetch';
import {TemplateType, OfferingTemplate} from '../../typings/templates';
import {AddAnswer} from '../../typings/SaveAnswer';

export const addTemplate = function(template:OfferingTemplate): Promise<AddAnswer> {
	return fetch('/templates', {method:'post', body: template}) as Promise<AddAnswer>;
};

export const getTemlates = function(id?:string, type?: TemplateType): Promise<OfferingTemplate[]> {
	let query = [];
    if (id){ query.push(`id=${id}`);}
    if (type){ query.push(`type=${type}`);}
	return fetch('/templates'+(query.length>0?'?'+query.join('&'):'')) as Promise<OfferingTemplate[]>;
};
