import {fetch} from '../fetch';
import {LocalSettings} from 'typings/settings';

export const getLocal = function(): Promise<LocalSettings>{
    return fetch('/localSettings') as Promise<LocalSettings>;
};
