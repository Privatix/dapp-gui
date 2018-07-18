import {fetch} from '../fetch';
import {LocalSettings} from '../../typings/settings';

export const getLocal = function(): Promise<LocalSettings>{
    return fetch('/localSettings') as Promise<LocalSettings>;
};

export const saveLocal = function(settings: LocalSettings): Promise<any> {
    return fetch('/localSettings', {method: 'put', body: settings}) as Promise<any>;
};


export const updateLocal = async function(newSettings: Object): Promise<any> {
    const settings = Object.assign(await getLocal() , newSettings);
    return saveLocal(settings) as Promise<any>;
};
