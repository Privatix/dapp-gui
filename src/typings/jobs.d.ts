import { AnotherPaginatedResponse } from 'typings/paginatedResponse';

export interface Job {
    id: string;
    jobtype: string;
    status: string;
    createdAt: string;
}

export interface JobType {
    ID: string;
    CreatedAt: string;
    CreatedBy: string;
    Data: string;
    NotBefore: string;
    RelatedID: string;
    RelatedType: string;
    Status: string;
    TryCount: number;
    Type: string;
}

export type JobResponse = AnotherPaginatedResponse<JobType[]>;
