export enum TemplateType {
	offer = 'offer', access = 'access'
}


export interface OfferingTemplate {
	id: string,
	hash: string,
	raw: Object
}
