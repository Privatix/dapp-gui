import {fetch} from '../fetch';

export const saveAs = function(fileName: string, data: string): Promise<any>{
    return fetch('/saveAs', {body: {fileName, data}}) as Promise<any>;
};

export const readFile = function(fileName: string): Promise<string>{
    return fetch('/readFile', {method: 'post', body: {fileName}}) as Promise<string>;
};

export const moveFile = function(src: string, dest: string): Promise<any>{
    return fetch('/moveFile', {src, dest}) as Promise<any>;
};
