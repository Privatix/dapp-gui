import { PaginatedResponse } from 'typings/paginatedResponse';

export interface Job {
    id: string;
    jobtype: string;
    status: string;
    createdAt: string;
}

export type JobResponse = PaginatedResponse<Job[]>;
