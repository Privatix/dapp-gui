import {fetch} from '../fetch';
import {ServiceStatus, Channel} from '../../typings/channels';

export const getList = function (status?:ServiceStatus): Promise<Channel[]> {

    if(status){
        return fetch(`/channels/?serviceStatus=${status}`) as Promise<Channel[]>;
    }else{
        return fetch('/channels') as Promise<Channel[]>;
    }
};


export const getById = function (id: string): Promise<Channel> {
    return fetch(`/channels?id=${id}`) as Promise<Channel>;
};
