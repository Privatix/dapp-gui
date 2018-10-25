import {fetch} from '../fetch';
import {ChannelActions} from '../../typings/channels';
import {SaveAnswer} from '../../typings/SaveAnswer';

export const setClientChannelStatus = function (id: string, action:ChannelActions): Promise<SaveAnswer> {
    return fetch(`/client/channels/${id}/status`, {method: 'put', body: {action: action}}) as Promise<SaveAnswer>;
};

export const setChannelStatus = function (id: string, action:ChannelActions): Promise<SaveAnswer> {
    return fetch(`/channels/${id}/status`, {method: 'put', body: {action: action}}) as Promise<SaveAnswer>;
};
