import {fetch} from '../fetch';
import {ServiceStatus, Channel, ChannelStatus, ClientChannel, ClientChannelStatus, ChannelActions, OneChannelStatus} from '../../typings/channels';
import {SaveAnswer} from '../../typings/SaveAnswer';

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

export const setClientChannelStatus = function (id: string, action:ChannelActions): Promise<SaveAnswer> {
    return fetch(`/client/channels/${id}/status`, {method: 'put', body: {action: action}}) as Promise<SaveAnswer>;
};


export const getClientStatus = function (id: string): Promise<ClientChannelStatus> {
    return fetch(`/client/channels/${id}/status`) as Promise<ClientChannelStatus>;
};


export const setChannelStatus = function (id: string, action:ChannelActions): Promise<SaveAnswer> {
    return fetch(`/channels/${id}/status`, {method: 'put', body: {action: action}}) as Promise<SaveAnswer>;
};


export const getChannelStatus = function (id: string): Promise<OneChannelStatus> {
    return fetch(`/channels/${id}/status`) as Promise<OneChannelStatus>;
};

