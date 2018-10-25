import {fetch} from '../fetch';
import {ClientChannelStatus, ChannelActions, OneChannelStatus} from '../../typings/channels';
import {SaveAnswer} from '../../typings/SaveAnswer';

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

