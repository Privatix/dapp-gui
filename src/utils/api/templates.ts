import {fetch} from '../fetch';
import {TemplateType, OfferingTemplate} from '../../typings/templates';

// export const addTemplate = function(template){

// };

export const getTemlates = function(id?:string, type?: TemplateType): Promise<OfferingTemplate[]> {
	let query = [];
    if (id){ query.push(`id=${id}`);}
    if (type){ query.push(`type=${type}`);}
	return fetch('/templates'+(query.length>0?'?'+query.join('&'):'')) as Promise<OfferingTemplate[]>;
};
