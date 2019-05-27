import {Job} from './job';

export type ServiceStatus = 'pending' |'activating' | 'active' | 'suspending' | 'suspended' | 'terminating' | 'terminated';
export type ChannelStatus = 'pending' | 'active' | 'wait_coop' | 'closed_coop' | 'wait_challenge' | 'in_challenge' | 'wait_uncoop' | 'closed_uncoop';
export type ChannelActions = 'terminate' | 'pause' | 'resume';

export interface Channel{
    id: string;
    agent: string;
    client: string;
    offering: string;
    block: number;
    channelStatus: string;
    serviceStatus: ServiceStatus;
    serviceChangedTime: string;
    totalDeposit: number;
    receiptBalance: number;
    receiptSignature: string;
}


export interface ClientChannelStatus {
    serviceStatus: ServiceStatus;
    channelStatus: ChannelStatus;
    lastChanged: string;
    maxInactiveTime: number;
}

export interface ClientChannelUsage {
    current: number;
    maxUsage: number;
    unitName: string;
    unitType: string;
    cost: number;
}

export interface ClientChannel {
    id: string;
    agent: string;
    client: string;
    offering: string;
    totalDeposit: number;
    channelStatus: ClientChannelStatus;
    job: Job;
    usage: ClientChannelUsage;
}

export interface OneChannelStatus {
    code?: number;
    status: ChannelStatus;
}
