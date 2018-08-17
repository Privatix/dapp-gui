import {fetch} from '../fetch';
import {Logs} from '../../typings/logs';

export const getLogs = function (query: string): Promise<Logs> {
    return fetch(`/logs?${query}`) as Promise<Logs>;
};
