import {fetch} from '../fetch';

export const resizeWindow = function(width: number, height: number){
    return fetch('/resizeWindow', {width, height}) as Promise<string>;
};
