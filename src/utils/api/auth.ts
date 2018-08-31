import {fetch} from '../fetch';
import {SaveAnswer} from '../../typings/SaveAnswer';

export const newPassword = async function (password: string): Promise<SaveAnswer> {
    return fetch('/auth', {method: 'post', body: {password: password}}) as Promise<SaveAnswer>;
};
