import {fetch} from '../fetch';
import {ServiceStatus, Channel, ChannelStatus, ClientChannel} from '../../typings/channels';

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


export const getClientList = function (channelStatus?:ChannelStatus, serviceStatus?:ServiceStatus, id?: string): Promise<ClientChannel[]> {
    let query = [];
    if (channelStatus) {query.push(`channelStatus=${channelStatus}`);}
    if (serviceStatus) {query.push(`serviceStatus=${serviceStatus}`);}
    if (id) {query.push(`id=${id}`);}
    return fetch('/client/channels?'+query.join('&'), {}) as Promise<ClientChannel[]>;
};
