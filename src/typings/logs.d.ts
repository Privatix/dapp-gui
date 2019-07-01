import { PaginatedResponse } from 'typings/paginatedResponse';

export interface Log{
    time: string;
    level: string;
    message: string;
    context: {
        type: string;
        method: string;
    };
    stack: string;
}

export type LogResponse = PaginatedResponse<Log[]>;
